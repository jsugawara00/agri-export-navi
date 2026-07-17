"use client";

import Link from "next/link";
import type { useProject } from "@/components/projects/useProject";

/** 書類ツール共通の読込・ログインガード。準備完了なら null を返す */
export default function ToolGuard({
  state,
}: {
  state: Pick<
    ReturnType<typeof useProject>,
    "loading" | "needsSignIn" | "signIn" | "notFound" | "project"
  >;
}) {
  if (state.loading) return <p className="mt-6 text-sm text-dim">読み込み中…</p>;
  if (state.needsSignIn) {
    return (
      <div className="mt-6">
        <p className="text-sm text-dim">このツールを使うにはログインが必要です。</p>
        <button
          onClick={() => state.signIn()}
          className="mt-3 rounded-lg border border-teal px-6 py-2.5 text-sm font-semibold text-teal hover:bg-teal/10"
        >
          Googleでログイン
        </button>
      </div>
    );
  }
  if (state.notFound) {
    return (
      <p className="mt-6 text-sm text-dim">
        案件が見つかりません。
        <Link href="/projects" className="ml-1 text-teal underline">
          案件一覧へ戻る
        </Link>
      </p>
    );
  }
  if (!state.project) return <p className="mt-6 text-sm text-dim">読み込み中…</p>;
  return null;
}
