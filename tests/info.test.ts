import { describe, expect, it } from "vitest";
import { buildInfoSnapshot, diffInfoSnapshot } from "@/lib/projects/info";
import { acknowledgeInfo, createProject } from "@/lib/projects/logic";
import { loadCriteriaSet } from "@/lib/content/loader";
import { computeHurdle } from "@/lib/score/engine";
import type { CountryDoc } from "@/lib/content/types";

const meta = { freshness: "A" as const, source: "test", retrievedAt: "2026-07-17" };

const country: CountryDoc = {
  id: "taiwan",
  meta,
  nameJa: "台湾",
  route: "east-china-sea",
  population: "約2,340万人",
  currency: "新台湾ドル（TWD）",
  language: "中国語（繁体字）",
  safetyLevel: "0",
  safetyNote: "レベル指定なし",
  quarantineSummary: "園地登録と検疫証明が必要",
  epaSummary: "EPAなし",
};

const scored = {
  status: "scored" as const,
  score: 78,
  grade: "B" as const,
  summary: "",
  breakdown: [
    {
      id: "orchard-registration",
      points: -10,
      label: "生産園地登録が必要",
      remedy: "r",
      stepRef: "#a",
      axis: "institutional" as const,
      resolved: false,
    },
    {
      id: "strait-tension",
      points: -4,
      label: "台湾海峡情勢",
      remedy: "r",
      stepRef: "#b",
      axis: "geopolitical" as const,
      resolved: false,
    },
  ],
};

describe("情報スナップショット", () => {
  it("国情報・点数・軸別の減点項目を記録する", () => {
    const snap = buildInfoSnapshot(country, scored);
    expect(snap["country:population"]).toBe("約2,340万人");
    expect(snap["hurdle:score"]).toBe("難易度B（78点）");
    expect(snap["breakdown:institutional"]).toBe("生産園地登録が必要（-10点）");
    expect(snap["breakdown:geopolitical"]).toBe("台湾海峡情勢（-4点）");
    expect(snap["breakdown:logistics"]).toBe("");
  });

  it("輸出不可の場合も記録できる", () => {
    const snap = buildInfoSnapshot(country, {
      status: "prohibited",
      reason: "相手国が輸入を禁止しています",
    });
    expect(snap["hurdle:score"]).toContain("輸出不可");
  });
});

describe("差分検知", () => {
  it("同一なら差分なし", () => {
    const snap = buildInfoSnapshot(country, scored);
    expect(diffInfoSnapshot(snap, snap)).toEqual([]);
  });

  it("値が変わった項目だけをラベル・新旧値つきで返す", () => {
    const saved = buildInfoSnapshot(country, scored);
    const now = buildInfoSnapshot(
      { ...country, population: "約2,300万人" },
      { ...scored, score: 74, grade: "C" as const },
    );
    const changes = diffInfoSnapshot(saved, now);
    expect(changes.map((c) => c.key).sort()).toEqual(["country:population", "hurdle:score"]);
    const pop = changes.find((c) => c.key === "country:population")!;
    expect(pop.label).toBe("人口");
    expect(pop.saved).toBe("約2,340万人");
    expect(pop.current).toBe("約2,300万人");
  });

  it("スナップショットが空（旧データ）なら差分なし扱い", () => {
    expect(diffInfoSnapshot({}, buildInfoSnapshot(country, scored))).toEqual([]);
  });
});

describe("確認（acknowledgeInfo）", () => {
  it("スナップショットを更新し履歴が残る", () => {
    let p = createProject({
      id: "p1",
      uid: null,
      item: "apple",
      country: "taiwan",
      hurdle: { score: 78, grade: "B", snapshotAt: "2026-07-17" },
      infoSnapshot: { "country:population": "旧" },
      now: 1000,
    });
    p = acknowledgeInfo(p, { "country:population": "新" }, 2000);
    expect(p.infoSnapshot["country:population"]).toBe("新");
    expect(p.history.at(-1)).toEqual({ at: 2000, action: "info-ack" });
  });
});

describe("実contentとの整合", () => {
  it("実データからスナップショットを構築でき、自身との差分はない", () => {
    const set = loadCriteriaSet("apple", "taiwan");
    const snap = buildInfoSnapshot(set.country, computeHurdle(set));
    expect(snap["hurdle:score"]).toBe("難易度B（78点）");
    expect(Object.keys(snap).length).toBeGreaterThanOrEqual(10);
    expect(diffInfoSnapshot(snap, snap)).toEqual([]);
  });
});
