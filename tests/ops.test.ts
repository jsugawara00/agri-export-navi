import { describe, expect, it } from "vitest";
import {
  buildQueueItem,
  checkStaleness,
  daysBetween,
  groupBySource,
  hashText,
  normalizeHtml,
  urlKey,
  type WatchTarget,
} from "@/lib/ops/patrol";

const thresholds = { W: 7, A: 30, B: 90, C: 365 };

function target(freshness: "A" | "B" | "C", retrievedAt: string): WatchTarget {
  return { file: "content/test.md", freshness, retrievedAt };
}

describe("鮮度チェック", () => {
  it("上限ちょうどはOK、超えたら警告", () => {
    // 区分B: 90日ちょうど → OK
    expect(checkStaleness(target("B", "2026-04-18"), "2026-07-17", thresholds).isStale).toBe(false);
    // 91日 → 警告
    expect(checkStaleness(target("B", "2026-04-17"), "2026-07-17", thresholds).isStale).toBe(true);
  });

  it("区分ごとに上限が異なる", () => {
    const r = checkStaleness(target("A", "2026-06-01"), "2026-07-17", thresholds);
    expect(r.limitDays).toBe(30);
    expect(r.staleDays).toBe(46);
    expect(r.isStale).toBe(true);
    expect(checkStaleness(target("C", "2026-06-01"), "2026-07-17", thresholds).isStale).toBe(false);
  });

  it("取得日が不正なら安全側（要確認）に倒す", () => {
    expect(checkStaleness(target("B", ""), "2026-07-17", thresholds).isStale).toBe(true);
  });

  it("daysBetweenは日数を返す", () => {
    expect(daysBetween("2026-07-01", "2026-07-17")).toBe(16);
  });
});

describe("HTML正規化とハッシュ", () => {
  it("タグ・script・styleを除去し空白を圧縮する", () => {
    const html = `<html><head><style>body{color:red}</style><script>alert(1)</script></head>
      <body><h1>輸出   条件</h1><p>りんご&amp;なし</p></body></html>`;
    expect(normalizeHtml(html)).toBe("輸出 条件 りんご&なし");
  });

  it("同じテキストは同じハッシュ、違えば異なる", () => {
    expect(hashText("abc")).toBe(hashText("abc"));
    expect(hashText("abc")).not.toBe(hashText("abd"));
  });

  it("広告等に影響されない: タグ構造が変わっても本文が同じなら同一ハッシュ", () => {
    const a = normalizeHtml("<div><p>条件A</p></div>");
    const b = normalizeHtml("<section><span>条件A</span></section>");
    expect(hashText(a)).toBe(hashText(b));
  });
});

describe("情報源のグルーピング", () => {
  it("同一URLを見る複数mdを1つにまとめ、URLなしは除外する", () => {
    const targets: WatchTarget[] = [
      { file: "a.md", freshness: "B", retrievedAt: "2026-07-17", sourceUrl: "https://x/1" },
      { file: "b.md", freshness: "B", retrievedAt: "2026-07-17", sourceUrl: "https://x/1" },
      { file: "c.md", freshness: "C", retrievedAt: "2026-07-17" },
    ];
    const map = groupBySource(targets);
    expect(map.size).toBe(1);
    expect(map.get("https://x/1")?.map((t) => t.file)).toEqual(["a.md", "b.md"]);
  });
});

describe("確認キュー生成", () => {
  it("pendingステータス・対象md・チェックリスト・自動書換禁止の明記を含む", () => {
    const item = buildQueueItem({
      detectedAt: "2026-07-17",
      sourceUrl: "https://www.maff.go.jp/pps/",
      files: ["content/criteria/institutional/apple_taiwan.md"],
      oldHash: "aaa",
      newHash: "bbb",
      excerpt: "新しい内容",
    });
    expect(item.filename).toBe(`20260717_${urlKey("https://www.maff.go.jp/pps/")}.md`);
    expect(item.content).toContain("status: pending");
    expect(item.content).toContain("apple_taiwan.md");
    expect(item.content).toContain("自動で書き換えません");
    expect(item.content).toContain("- [ ]");
  });
});
