import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import AddPatientForm from "./AddPatientForm";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: patients } = await supabase
    .from("patients")
    .select("*, conversations(last_message_at)")
    .eq("archived", false)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="font-semibold text-lg">Patients</h1>
        <form action="/auth/signout" method="post">
          <button className="text-sm text-gray-500 hover:text-gray-800">Sign out</button>
        </form>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <AddPatientForm />

        {patients && patients.length > 0 ? (
          <ul className="space-y-3">
            {patients.map((patient) => {
              const lastActive = patient.conversations
                ?.map((c: { last_message_at: string }) => c.last_message_at)
                .sort()
                .at(-1);
              return (
                <li key={patient.id}>
                  <Link
                    href={`/dashboard/patients/${patient.id}`}
                    className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-5 py-4 hover:border-blue-300 hover:shadow-sm transition"
                  >
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-gray-400 mt-0.5">
                        {lastActive
                          ? `Last session ${new Date(lastActive).toLocaleDateString()}`
                          : "No sessions yet"}
                      </p>
                    </div>
                    <span className="text-gray-300 text-lg">→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-400 text-center py-12">
            No patients yet. Add one above to get started.
          </p>
        )}
      </main>
    </div>
  );
}
