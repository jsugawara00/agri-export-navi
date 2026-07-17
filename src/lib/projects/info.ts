import type { CountryDoc } from "@/lib/content/types";
import type { ScoreResult } from "@/lib/score/engine";

/**
 * 案件保存時の「輸出に関わる情報」スナップショットと差分検知。
 * 判定後にcontent（判断基準md）が更新された場合、ナビ画面で注意喚起し、
 * 地域情報ページで変更箇所をハイライトするために使う。
 * スナップショットの更新はユーザーの明示操作（確認しました）のみ。
 */

export type InfoSnapshot = Record<string, string>;

export const INFO_LABELS: Record<string, string> = {
  "country:population": "人口",
  "country:currency": "通貨",
  "country:language": "言語",
  "country:safety": "治安",
  "country:quarantine": "検疫概要",
  "country:epa": "EPA・関税",
  "hurdle:score": "輸出ハードル指数",
  "breakdown:institutional": "制度要因の減点項目",
  "breakdown:geopolitical": "国情勢要因の減点項目",
  "breakdown:logistics": "物流経路要因の減点項目",
};

export function buildInfoSnapshot(country: CountryDoc, result: ScoreResult): InfoSnapshot {
  const snap: InfoSnapshot = {
    "country:population": country.population,
    "country:currency": country.currency,
    "country:language": country.language,
    "country:safety": `レベル${country.safetyLevel}｜${country.safetyNote}`,
    "country:quarantine": country.quarantineSummary,
    "country:epa": country.epaSummary,
  };
  if (result.status === "scored") {
    snap["hurdle:score"] = `難易度${result.grade}（${result.score}点）`;
    for (const axis of ["institutional", "geopolitical", "logistics"] as const) {
      snap[`breakdown:${axis}`] = result.breakdown
        .filter((b) => b.axis === axis)
        .map((b) => `${b.label}（${b.points}点）`)
        .join(" / ");
    }
  } else {
    snap["hurdle:score"] = `輸出不可（${result.reason}）`;
  }
  return snap;
}

export interface InfoChange {
  key: string;
  label: string;
  saved: string;
  current: string;
}

/**
 * 保存時スナップショットと現在の情報の差分。
 * スナップショットが空（旧バージョンで作成した案件）の場合は
 * 比較基準がないため差分なしとして扱う。
 */
export function diffInfoSnapshot(saved: InfoSnapshot, current: InfoSnapshot): InfoChange[] {
  if (Object.keys(saved).length === 0) return [];
  const changes: InfoChange[] = [];
  for (const key of Object.keys(current)) {
    const before = saved[key] ?? "";
    if (before !== current[key]) {
      changes.push({
        key,
        label: INFO_LABELS[key] ?? key,
        saved: before,
        current: current[key],
      });
    }
  }
  return changes;
}
