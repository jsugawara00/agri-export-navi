"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import type { CountryId, ItemId } from "@/lib/content/catalog";
import { createProject } from "@/lib/projects/logic";
import { resolveStore } from "@/lib/projects/store";
import type { Grade } from "@/lib/score/engine";

/**
 * 「この内容でナビゲートを始める」CTA。
 * 判定時点のハードル指数をスナップショットとして案件に保存する。
 */
export default function SaveCta({
  item,
  country,
  score,
  grade,
  infoSnapshot,
}: {
  item: ItemId;
  country: CountryId;
  score: number;
  grade: Grade;
  /** 判定時点の地域情報スナップショット（変更検知の基準になる） */
  infoSnapshot: Record<string, string>;
}) {
  const router = useRouter();
  const { enabled, user, loading, signIn } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const store = resolveStore(user?.uid ?? null);

  const handleSave = async () => {
    if (!store || busy) return;
    setBusy(true);
    setError("");
    try {
      const project = createProject({
        id: crypto.randomUUID(),
        uid: user?.uid ?? null,
        item,
        country,
        hurdle: {
          score,
          grade,
          snapshotAt: new Date().toISOString().slice(0, 10),
        },
        infoSnapshot,
      });
      await store.save(project);
      router.push(`/projects/${project.id}`);
    } catch (e) {
      setError(`保存に失敗しました: ${String(e)}`);
      setBusy(false);
    }
  };

  if (loading) {
    return <p className="text-center text-xs text-dim">読み込み中…</p>;
  }

  // Firebase設定済みだが未ログイン → Googleログインを促す
  if (enabled && !user) {
    return (
      <div className="text-center">
        <button
          onClick={() => signIn().catch((e) => setError(String(e)))}
          className="rounded-lg border border-teal px-8 py-3 text-sm font-semibold text-teal transition hover:bg-teal/10"
        >
          Googleでログインして案件を保存する
        </button>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="text-center">
      <button
        onClick={handleSave}
        disabled={busy}
        className="rounded-lg bg-teal px-8 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "保存しています…" : "この内容でナビゲートを始める"}
      </button>
      {store?.mode === "local" && (
        <p className="mt-3 text-xs text-dim">
          本サイトはログイン不要で、案件はいまお使いの端末（ブラウザ）にのみ保存されます。
          PCとスマホの間でデータは共有されません。
        </p>
      )}
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
