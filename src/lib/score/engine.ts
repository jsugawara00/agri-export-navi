import type { CriteriaAxis, CriteriaDoc, Deduction } from "@/lib/content/types";

/**
 * 採点エンジン（純関数）。
 * - LLMは一切使わない。md採点表のパース結果を加減算するだけの決定論的計算。
 * - 「輸出可能性◯%」という確率表現は実装しない。100点からの減点方式。
 * - 禁止品目は点数を出さず status: "prohibited" を返す（可・不可は事実として区別）。
 */

export type Grade = "A" | "B" | "C" | "D" | "E";

export interface BreakdownItem extends Deduction {
  axis: CriteriaAxis;
  /** 対応ステップ完了で true（Phase 2で更新。Phase 1は常に false） */
  resolved: boolean;
}

export type ScoreResult =
  | { status: "prohibited"; reason: string }
  | {
      status: "scored";
      score: number;
      grade: Grade;
      summary: string;
      breakdown: BreakdownItem[];
    };

export interface ScoreInput {
  institutional: CriteriaDoc;
  geopolitical: CriteriaDoc;
  logistics: CriteriaDoc;
}

export function gradeOf(score: number): Grade {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "E";
}

const GRADE_SUMMARY: Record<Grade, string> = {
  A: "大きな障壁は見当たらず、少ない手続きで着手できる組み合わせです",
  B: "登録手続きは必要だが、実現ルートが確立されている組み合わせです",
  C: "必要な手続きが多く、計画的な準備が求められる組み合わせです",
  D: "ハードルの高い組み合わせです。時間の確保と専門窓口の支援を見込んでください",
  E: "非常にハードルの高い組み合わせです。専門機関への相談を強く推奨します",
};

export function computeHurdle(input: ScoreInput): ScoreResult {
  const axes: [CriteriaAxis, CriteriaDoc][] = [
    ["institutional", input.institutional],
    ["geopolitical", input.geopolitical],
    ["logistics", input.logistics],
  ];

  // 禁止フラグが1つでもあれば点数を出さずに終了
  for (const [, doc] of axes) {
    if (doc.prohibited) {
      return {
        status: "prohibited",
        reason: doc.prohibitedReason ?? "相手国が輸入を禁止しています",
      };
    }
  }

  const breakdown: BreakdownItem[] = [];
  for (const [axis, doc] of axes) {
    for (const d of doc.deductions) {
      breakdown.push({ ...d, axis, resolved: false });
    }
  }

  const total = breakdown.reduce((sum, d) => sum + d.points, 0);
  const score = Math.max(0, 100 + total);
  const grade = gradeOf(score);

  return { status: "scored", score, grade, summary: GRADE_SUMMARY[grade], breakdown };
}
