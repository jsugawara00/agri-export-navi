"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { comboKey, type ComboMap } from "@/lib/content/combo-types";
import { resolveStore } from "@/lib/projects/store";
import type { Project } from "@/lib/projects/types";

function fmtDate(ms: number): string {
  return new Date(ms).toLocaleDateString("ja-JP");
}

export default function ProjectsClient({ combos }: { combos: ComboMap }) {
  const { enabled, user, loading, signIn } = useAuth();
  const [projects, setProjects] = useState<Project[] | null>(null);

  const uid = user?.uid ?? null;

  useEffect(() => {
    if (loading) return;
    const store = resolveStore(uid);
    if (!store) return;
    let alive = true;
    store.list().then((list) => {
      if (alive) setProjects(list);
    });
    return () => {
      alive = false;
    };
  }, [loading, uid]);

  if (loading) return <p className="mt-6 text-sm text-dim">読み込み中…</p>;

  if (enabled && !user) {
    return (
      <div className="mt-6">
        <p className="text-sm text-dim">案件の一覧にはログインが必要です。</p>
        <button
          onClick={() => signIn()}
          className="mt-3 rounded-lg border border-teal px-6 py-2.5 text-sm font-semibold text-teal hover:bg-teal/10"
        >
          Googleでログイン
        </button>
      </div>
    );
  }

  if (projects === null) return <p className="mt-6 text-sm text-dim">読み込み中…</p>;

  return (
    <div className="mt-6 space-y-3">
      {!enabled && (
        <p className="rounded-lg border border-line bg-panel px-4 py-2 text-xs leading-relaxed text-dim">
          本サイトは会員登録・ログインなしで、どなたでも無料でお使いいただけます。
          個人情報をお預かりしない設計のため、案件はいまお使いの端末（ブラウザ）にのみ
          保存され、PCとスマホの間でデータは共有されません。あらかじめご了承ください。
        </p>
      )}
      {projects.length === 0 && (
        <p className="text-sm text-dim">
          保存された案件はまだありません。
          <Link href="/" className="ml-1 text-teal underline">
            トップから検索して保存
          </Link>
          できます。
        </p>
      )}
      {projects.map((p) => {
        const combo = combos[comboKey(p.item, p.country)];
        return (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className="block rounded-xl border border-line bg-panel p-4 transition hover:border-teal/50"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-base font-semibold">
                {combo ? `${combo.itemLabel} × ${combo.countryLabel}` : `${p.item} × ${p.country}`}
              </p>
              <p className="text-xs text-dim">最終更新 {fmtDate(p.updatedAt)}</p>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
              <span>
                難易度{p.hurdle.grade}（{p.hurdle.score}点・{p.hurdle.snapshotAt}時点）
              </span>
              <span className="text-teal">準備完成度 {p.progress.completionPct}%</span>
            </div>
            {p.buyerMemo && (
              <p className="mt-2 truncate text-xs text-dim">メモ: {p.buyerMemo}</p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
