"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ArchivePatientButton({ patientId }: { patientId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleArchive() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("patients").update({ archived: true }).eq("id", patientId);
    router.push("/dashboard");
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Archive this patient?</span>
        <button
          onClick={handleArchive}
          disabled={loading}
          className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
        >
          {loading ? "Archiving..." : "Yes, archive"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-sm text-gray-400 hover:text-red-500 transition-colors"
    >
      Archive patient
    </button>
  );
}
