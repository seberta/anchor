import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import ConversationActions from "./ConversationActions";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string; conversationId: string }>;
}) {
  const { id, conversationId } = await params;
  const supabase = await createClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("*, patients(name, therapist_id)")
    .eq("id", conversationId)
    .single();

  if (!conversation) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href={`/dashboard/patients/${id}`} className="text-sm text-gray-500 hover:text-gray-800">
          ← {(conversation.patients as { name: string })?.name}
        </Link>
        <div>
          <span className="font-semibold">
            {new Date(conversation.started_at).toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric",
            })}
          </span>
          {conversation.flagged && (
            <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              Flagged
            </span>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Transcript */}
        <div className="space-y-3">
          {messages?.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-800"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Therapist actions */}
        <ConversationActions
          conversationId={conversationId}
          initialNotes={conversation.therapist_notes ?? ""}
          initialFlagged={conversation.flagged}
        />
      </main>
    </div>
  );
}
