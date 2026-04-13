"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ContextEditor({
  patientId,
  initialContent,
}: {
  patientId: string;
  initialContent: string;
}) {
  const [content, setContent] = useState(initialContent);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSave() {
    setLoading(true);
    await supabase
      .from("patient_context")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("patient_id", patientId);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <p className="text-xs text-gray-400">
        This text is injected as the AI's system prompt at the start of every conversation.
        Include background, goals, approach, boundaries, and tone.
      </p>
      <textarea
        value={content}
        onChange={(e) => { setContent(e.target.value); setSaved(false); }}
        rows={10}
        placeholder={`Background: [age, situation, reason for therapy]
Goals: [what we're working toward]
Approach: [how the AI should engage — e.g. validating, CBT-adjacent]
Boundaries: [what the AI should never do — e.g. never give medication advice, always suggest calling 988 in a crisis]
Tone: [warm and gentle / direct / etc.]`}
        className="w-full text-sm font-mono border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-sm text-green-600">Saved</span>}
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save context"}
        </button>
      </div>
    </div>
  );
}
