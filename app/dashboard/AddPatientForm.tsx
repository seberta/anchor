"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AddPatientForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: patient, error } = await supabase
      .from("patients")
      .insert({ therapist_id: user.id, name: name.trim() })
      .select()
      .single();

    if (!error && patient) {
      // Create an empty context row for this patient
      await supabase.from("patient_context").insert({ patient_id: patient.id, content: "" });
      setName("");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleAdd} className="flex gap-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Patient name or initials"
        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        Add patient
      </button>
    </form>
  );
}
