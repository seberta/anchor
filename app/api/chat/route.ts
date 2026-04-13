import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  const { token, conversationId, message } = await req.json();

  if (!token || !message) {
    return new Response("Missing token or message", { status: 400 });
  }

  const supabase = createServiceClient();

  // Resolve patient from chat token
  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("chat_token", token)
    .single();

  if (!patient) return new Response("Invalid token", { status: 401 });

  // Get or create conversation
  let convoId = conversationId as string | null;
  if (!convoId) {
    const { data: newConvo } = await supabase
      .from("conversations")
      .insert({ patient_id: patient.id })
      .select("id")
      .single();
    convoId = newConvo!.id;
  }

  // Save the user's message
  await supabase.from("messages").insert({
    conversation_id: convoId,
    role: "user",
    content: message,
  });

  // Load the patient's context (system prompt)
  const { data: context } = await supabase
    .from("patient_context")
    .select("content")
    .eq("patient_id", patient.id)
    .single();

  // Load recent conversation history (last 40 messages)
  const { data: history } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", convoId)
    .order("created_at", { ascending: true })
    .limit(40);

  const basePrompt = context?.content?.trim()
    ? context.content
    : "You are a warm, supportive AI companion helping someone between therapy sessions. Listen carefully, validate feelings, and gently reflect back. You are not a replacement for therapy — always encourage the person to discuss important topics with their therapist.";

  // Always append formatting instructions so the chat reads naturally
  const systemPrompt = `${basePrompt}

IMPORTANT — formatting: You are in a conversational chat interface. Write in plain, natural prose. Do not use markdown — no bullet points, no bold (**), no italics (*), no headers. If you want to offer a few options or questions, weave them into sentences naturally rather than listing them. Keep responses warm and concise.`;

  // Stream the response from Claude
  const encoder = new TextEncoder();
  let assistantMessage = "";

  const stream = new ReadableStream({
    async start(controller) {
      // Send the conversation ID on the first chunk so the client can track it
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ conversationId: convoId })}\n\n`)
      );

      const anthropicStream = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: systemPrompt,
        messages: (history ?? []).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        stream: true,
      });

      for await (const event of anthropicStream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          const text = event.delta.text;
          assistantMessage += text;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
          );
        }
      }

      // Save the completed assistant message
      await supabase.from("messages").insert({
        conversation_id: convoId,
        role: "assistant",
        content: assistantMessage,
      });

      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
