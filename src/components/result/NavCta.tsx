"use client";

import { useState } from "react";

/** Phase 1ではプレビューのみ（案件保存・ナビはPhase 2で提供） */
export default function NavCta() {
  const [note, setNote] = useState(false);
  return (
    <div className="text-center">
      <button
        onClick={() => setNote(true)}
        className="rounded-lg bg-teal px-8 py-3 text-sm font-semibold text-background transition hover:opacity-90"
      >
        この内容でナビゲートを始める
      </button>
      {note && (
        <p className="rise mt-3 text-xs text-dim">
          案件の保存とステップナビゲーションは Phase 2 で提供予定です（現在はプレビュー版）。
        </p>
      )}
    </div>
  );
}
