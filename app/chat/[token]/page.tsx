import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ChatWindow from "./ChatWindow";

export default async function ChatPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: patient } = await supabase
    .from("patients")
    .select("id, name")
    .eq("chat_token", token)
    .single();

  if (!patient) notFound();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 text-center">
        <p className="text-sm text-gray-500">
          This is a safe space between your sessions. Your therapist can read these conversations.
        </p>
      </header>
      <ChatWindow token={token} />
    </div>
  );
}
