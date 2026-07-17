"use client";

import { useState } from "react";
import FreshnessBadge from "@/components/FreshnessBadge";
import type { BreakdownItem, Grade } from "@/lib/score/engine";
import type { ContentMeta, CriteriaAxis } from "@/lib/content/types";

const AXIS_LABEL: Record<CriteriaAxis, string> = {
  institutional: "制度要因",
  geopolitical: "国情勢要因",
  logistics: "物流経路要因",
};

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
        <span className="text-2xl font-semibold">{score}点</span>
        <span className="text-xs text-dim underline decoration-dotted">
          内訳を{open ? "閉じる" : "見る"}（{breakdown.length}項目 / {totalDeduction}点）
        </span>
      </button>
      <p className="mt-2 text-sm leading-relaxed">{summary}</p>

      {open && (
        <div className="rise mt-4 space-y-4 border-t border-line pt-4">
          <p className="text-xs text-dim">
            100点からの減点内訳です。各項目には対処案が付いており、対応する
            ステップを完了すると「ハードル解消済み」になります（Phase 2で提供）。
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
                  {items.map((b) => (
                    <li
                      key={`${axis}-${b.id}`}
                      className="rounded-lg border border-line bg-background/60 p-3"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-sm font-medium">{b.label}</p>
                        <p className="shrink-0 text-sm font-semibold text-amber">
                          {b.points}点
                        </p>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-dim">
                        対処案: {b.remedy}
                      </p>
                      <p className="mt-1 text-[10px] text-dim/70">
                        {b.resolved ? "ハードル解消済み" : "未対応（ナビのステップに対応）"}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
