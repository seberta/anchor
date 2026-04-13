"use client";

import { useState } from "react";

export default function ChatLinkBox({ url, patientId }: { url: string; patientId: string }) {
  const [copied, setCopied] = useState(false);
  void patientId; // reserved for future token regeneration

  function copy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
      <input
        readOnly
        value={url}
        className="flex-1 text-sm text-gray-600 bg-transparent focus:outline-none"
      />
      <button
        onClick={copy}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium shrink-0"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
