"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ConversationActions({
  conversationId,
  initialNotes,
  initialFlagged,
}: {
  conversationId: string;
  initialNotes: string;
  initialFlagged: boolean;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [flagged, setFlagged] = useState(initialFlagged);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  async function handleSave() {
    await supabase
      .from("conversations")
      .update({ therapist_notes: notes, flagged })
      .eq("id", conversationId);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      <h3 className="text-sm font-medium text-gray-700">Your notes</h3>
      <textarea
        value={notes}
        onChange={(e) => { setNotes(e.target.value); setSaved(false); }}
        rows={4}
        placeholder="Private notes about this conversation — not visible to the patient or AI..."
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={flagged}
            onChange={(e) => { setFlagged(e.target.checked); setSaved(false); }}
            className="rounded"
          />
          <span className="text-sm text-gray-600">Flag for follow-up in session</span>
        </label>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-green-600">Saved</span>}
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700"
          >
            Save notes
          </button>
        </div>
      </div>
    </div>
  );
}
