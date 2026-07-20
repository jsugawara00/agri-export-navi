"use client";

import { useEffect, useState } from "react";
import FreshnessBadge from "@/components/FreshnessBadge";
import type { BreakdownItem, Grade } from "@/lib/score/engine";
import type { ContentMeta, CriteriaAxis } from "@/lib/content/types";

const AXIS_LABEL: Record<CriteriaAxis, string> = {
  institutional: "制度要因",
  geopolitical: "国情勢要因",
  logistics: "物流経路要因",
};

/**
 * 減点項目が「手続きで対応できる」か「相手国・物流の事情で固定」か。
 * 制度要因（園地登録・検疫証明・関税確認等）はステップ完了で解消できる＝対応可。
 * 国情勢（為替・海峡・規制変動）・物流（リードタイム・スペース・天候）は
 * 利用者側では解消できず、確認・計画で備える性質＝固定。
 * ※これは表示上の色分けのみ。採点（点数）には一切影響しない。
 */
function isActionable(axis: CriteriaAxis): boolean {
  return axis === "institutional";
}

const GRADE_COLOR: Record<Grade, string> = {
  A: "text-teal",
  B: "text-teal",
  C: "text-amber",
  D: "text-amber",
  E: "text-red-400",
};

export interface HurdleCardProps {
  score: number;
  grade: Grade;
  summary: string;
  breakdown: BreakdownItem[];
  axisMeta: Record<CriteriaAxis, ContentMeta>;
}

/**
 * 輸出ハードル指数カード。点数タップで内訳パネル
 * （減点項目・点数・対処案）を開示する。
 */
export default function HurdleCard({
  score,
  grade,
  summary,
  breakdown,
  axisMeta,
}: HurdleCardProps) {
  const [open, setOpen] = useState(false);
  const totalDeduction = breakdown.reduce((sum, b) => sum + b.points, 0);
  const axes: CriteriaAxis[] = ["institutional", "geopolitical", "logistics"];

  // スコアを 0→score へカウントアップ（演出。動きを控える設定なら即表示）
  const [displayScore, setDisplayScore] = useState(score);
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplayScore(score);
      return;
    }
    setDisplayScore(0);
    const dur = 750;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplayScore(Math.round(score * e));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <section className="rounded-xl border border-line bg-panel p-5">
      <h2 className="text-sm font-semibold text-dim">輸出ハードル指数</h2>
      <button
        onClick={() => setOpen(!open)}
        className="mt-2 flex w-full flex-wrap items-baseline gap-x-3 gap-y-1 text-left"
        aria-expanded={open}
      >
        <span className={`text-3xl font-bold ${GRADE_COLOR[grade]}`}>
          難易度{grade}
        </span>
        <span className="text-2xl font-semibold tabular-nums">{displayScore}点</span>
        <span className="text-xs text-dim underline decoration-dotted">
          内訳を{open ? "閉じる" : "見る"}（{breakdown.length}項目 / {totalDeduction}点）
        </span>
      </button>
      <p className="mt-2 text-sm leading-relaxed">{summary}</p>

      {open && (
        <div className="rise mt-4 space-y-4 border-t border-line pt-4">
          <p className="text-xs text-dim">
            100点からの減点内訳です。
            <span className="text-teal">緑＝手続きで対応できる項目</span>（登録・検疫証明など
            ステップを完了すると解消）、
            <span className="text-foreground/80">グレー＝相手国・物流の事情</span>
            （利用者側では解消できず、確認・計画で備える項目）。
          </p>
          {axes.map((axis) => {
            const items = breakdown.filter((b) => b.axis === axis);
            if (items.length === 0) return null;
            return (
              <div key={axis}>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="text-xs font-semibold">{AXIS_LABEL[axis]}</h3>
                  <FreshnessBadge meta={axisMeta[axis]} />
                </div>
                <ul className="space-y-2">
                  {items.map((b) => {
                    const actionable = isActionable(b.axis);
                    return (
                      <li
                        key={`${axis}-${b.id}`}
                        className={`rounded-lg border border-line border-l-2 bg-background/60 p-3 ${
                          actionable ? "border-l-teal" : "border-l-foreground/25"
                        }`}
                      >
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="text-sm font-medium">{b.label}</p>
                          <p
                            className={`shrink-0 text-sm font-semibold tabular-nums ${
                              actionable ? "text-teal" : "text-foreground/70"
                            }`}
                          >
                            {b.points}点
                          </p>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-dim">
                          対処案: {b.remedy}
                        </p>
                        <p className="mt-1.5">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] ${
                              actionable
                                ? "bg-teal/15 text-teal"
                                : "bg-foreground/10 text-foreground/70"
                            }`}
                          >
                            {b.resolved
                              ? "ハードル解消済み"
                              : actionable
                                ? "手続きで対応（ナビのステップに対応）"
                                : "相手国・物流の事情（確認・計画で備える）"}
                          </span>
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
