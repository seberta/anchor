import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import ContextEditor from "./ContextEditor";
import ChatLinkBox from "./ChatLinkBox";

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: patient } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .single();

  if (!patient) notFound();

  const { data: context } = await supabase
    .from("patient_context")
    .select("*")
    .eq("patient_id", id)
    .single();

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*")
    .eq("patient_id", id)
    .order("last_message_at", { ascending: false });

  const chatUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/chat/${patient.chat_token}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800">
          ← Patients
        </Link>
        <h1 className="font-semibold text-lg">{patient.name}</h1>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Patient chat link */}
        <section>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Patient Chat Link
          </h2>
          <ChatLinkBox url={chatUrl} patientId={id} />
        </section>

        {/* Context editor */}
        <section>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            AI Context
          </h2>
          <ContextEditor patientId={id} initialContent={context?.content ?? ""} />
        </section>

        {/* Conversation history */}
        <section>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Conversations
          </h2>
          {conversations && conversations.length > 0 ? (
            <ul className="space-y-2">
              {conversations.map((convo) => (
                <li key={convo.id}>
                  <Link
                    href={`/dashboard/patients/${id}/conversations/${convo.id}`}
                    className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-5 py-4 hover:border-blue-300 hover:shadow-sm transition"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(convo.started_at).toLocaleDateString("en-US", {
                          weekday: "short", month: "short", day: "numeric",
                        })}
                        {" · "}
                        {new Date(convo.started_at).toLocaleTimeString("en-US", {
                          hour: "numeric", minute: "2-digit",
                        })}
                      </p>
                      {convo.summary && (
                        <p className="text-sm text-gray-400 mt-0.5 truncate max-w-lg">
                          {convo.summary}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {convo.flagged && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          Flagged
                        </span>
                      )}
                      <span className="text-gray-300 text-lg">→</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8 bg-white rounded-xl border border-gray-200">
              No conversations yet. Share the chat link with {patient.name} to get started.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
