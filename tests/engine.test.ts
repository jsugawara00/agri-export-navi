import { describe, expect, it } from "vitest";
import { computeHurdle, gradeOf } from "@/lib/score/engine";
import type { CriteriaAxis, CriteriaDoc, Deduction } from "@/lib/content/types";

function doc(
  axis: CriteriaAxis,
  points: number[],
  overrides: Partial<CriteriaDoc> = {},
): CriteriaDoc {
  const deductions: Deduction[] = points.map((p, i) => ({
    id: `${axis}-${i}`,
    points: p,
    label: `減点${i}`,
    remedy: `対処${i}`,
    stepRef: `#step-${i}`,
  }));
  return {
    axis,
    meta: { freshness: "B", source: "test", retrievedAt: "2026-07-17", reviewedBy: "test" },
    prohibited: false,
    deductions,
    overview: "",
    ...overrides,
  };
}

function input(inst: number[], geo: number[] = [], logi: number[] = []) {
  return {
    institutional: doc("institutional", inst),
    geopolitical: doc("geopolitical", geo),
    logistics: doc("logistics", logi),
  };
}

describe("computeHurdle: 禁止分岐", () => {
  it("禁止フラグがあれば点数を出さず prohibited を返す", () => {
    const result = computeHurdle({
      ...input([-10]),
      institutional: doc("institutional", [-10], {
        prohibited: true,
        prohibitedReason: "相手国が輸入を禁止しています",
        deductions: [],
      }),
    });
    expect(result.status).toBe("prohibited");
    if (result.status === "prohibited") {
      expect(result.reason).toBe("相手国が輸入を禁止しています");
    }
    expect("score" in result).toBe(false);
  });

  it("禁止理由が未記載ならデフォルト文言を返す", () => {
    const result = computeHurdle({
      ...input([]),
      institutional: doc("institutional", [], { prohibited: true }),
    });
    expect(result.status === "prohibited" && result.reason).toBe(
      "相手国が輸入を禁止しています",
    );
  });
});

describe("computeHurdle: 減点合算", () => {
  it("100 + Σ(points) を計算し、内訳を3軸の順で返す", () => {
    const result = computeHurdle(input([-10, -5], [-4], [-3]));
    expect(result.status).toBe("scored");
    if (result.status !== "scored") return;
    expect(result.score).toBe(78);
    expect(result.grade).toBe("B");
    expect(result.breakdown).toHaveLength(4);
    expect(result.breakdown.map((b) => b.axis)).toEqual([
      "institutional",
      "institutional",
      "geopolitical",
      "logistics",
    ]);
    // 各項目は対処案とステップ参照を必ず持ち、初期状態は未解消
    for (const b of result.breakdown) {
      expect(b.remedy).toBeTruthy();
      expect(b.stepRef).toBeTruthy();
      expect(b.resolved).toBe(false);
    }
  });

  it("減点なしなら100点・グレードA", () => {
    const result = computeHurdle(input([]));
    expect(result.status === "scored" && result.score).toBe(100);
    expect(result.status === "scored" && result.grade).toBe("A");
  });

  it("減点が100点を超えても0点で下げ止まる", () => {
    const result = computeHurdle(input([-60, -60], [-30]));
    expect(result.status === "scored" && result.score).toBe(0);
    expect(result.status === "scored" && result.grade).toBe("E");
  });
});

describe("gradeOf: グレード境界", () => {
  it.each([
    [100, "A"],
    [90, "A"],
    [89, "B"],
    [75, "B"],
    [74, "C"],
    [60, "C"],
    [59, "D"],
    [40, "D"],
    [39, "E"],
    [0, "E"],
  ] as const)("%i点 → %s", (score, grade) => {
    expect(gradeOf(score)).toBe(grade);
  });
});
