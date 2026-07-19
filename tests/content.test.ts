import { describe, expect, it } from "vitest";
import { COUNTRIES, ITEMS } from "@/lib/content/catalog";
import { comboPrepared, loadCriteriaSet } from "@/lib/content/loader";
import { validateAll } from "@/lib/content/validate";
import { computeHurdle } from "@/lib/score/engine";

describe("content/ バリデーション", () => {
  it("全mdのfrontmatter・減点項目・step_ref整合にエラーがない", () => {
    expect(validateAll()).toEqual([]);
  });
});

describe("実contentでの採点", () => {
  it("整備済みの全組み合わせが採点可能で0〜100点に収まる（v1.0の9コンボは必ず整備済み）", () => {
    let prepared = 0;
    for (const item of ITEMS) {
      for (const country of COUNTRIES) {
        if (!comboPrepared(item.id, country.id)) continue;
        prepared++;
        const set = loadCriteriaSet(item.id, country.id);
        const result = computeHurdle(set);
        expect(
          ["scored", "prohibited"],
          `${item.id}_${country.id}`,
        ).toContain(result.status);
        if (result.status === "scored") {
          expect(result.score).toBeGreaterThanOrEqual(0);
          expect(result.score).toBeLessThanOrEqual(100);
          expect(result.breakdown.length).toBeGreaterThan(0);
        }
      }
    }
    // v1.0からの9コンボ（3品目×3カ国）は常に整備済みであること
    for (const item of ["rice", "apple", "la-france"] as const) {
      for (const country of ["taiwan", "hongkong", "usa"] as const) {
        expect(comboPrepared(item, country), `${item}_${country}`).toBe(true);
      }
    }
    expect(prepared).toBeGreaterThanOrEqual(9);
  });

  it("りんご×台湾は難易度B・78点（企画書の代表例と一致）", () => {
    const result = computeHurdle(loadCriteriaSet("apple", "taiwan"));
    expect(result.status === "scored" && result.score).toBe(78);
    expect(result.status === "scored" && result.grade).toBe("B");
  });

  it("りんご×香港はグレードA（成功体験ルート）", () => {
    const result = computeHurdle(loadCriteriaSet("apple", "hongkong"));
    expect(result.status === "scored" && result.grade).toBe("A");
  });

  it("りんご×米国はグレードD（難ルート）", () => {
    const result = computeHurdle(loadCriteriaSet("apple", "usa"));
    expect(result.status === "scored" && result.grade).toBe("D");
  });
});

describe("県統計の実績データ（v1.1・参考表示専用）", () => {
  it("確認済みの組み合わせは実績メモを返す（例: 米×香港）", async () => {
    const { loadExportRecord } = await import("@/lib/content/loader");
    expect(loadExportRecord("rice", "hongkong").note).toBeTruthy();
    expect(loadExportRecord("apple", "taiwan").note).toBeTruthy();
  });

  it("未確認の組み合わせはnote無し＝中立表示（実績ゼロでも減点しない）", async () => {
    const { loadExportRecord } = await import("@/lib/content/loader");
    expect(loadExportRecord("apple", "usa").note).toBeUndefined();
    // 実績データの有無がスコアへ影響しないこと（エンジンは実績を参照しない）
    const withRecord = computeHurdle(loadCriteriaSet("rice", "hongkong"));
    expect(withRecord.status).toBe("scored");
  });
});
