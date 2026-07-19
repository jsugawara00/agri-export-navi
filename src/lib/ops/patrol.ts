import crypto from "node:crypto";

/**
 * 区分B巡回・差分検知の純関数コア。
 * 検知するだけで content/ には一切書き込まない（自動書換は禁止。
 * 反映は運用者確認キューを経て必ず人間が行う）。
 */

export interface Thresholds {
  W: number;
  A: number;
  B: number;
  C: number;
}

export interface WatchTarget {
  /** content/ からの相対パス */
  file: string;
  freshness: "W" | "A" | "B" | "C";
  retrievedAt: string;
  sourceUrl?: string;
}

export function daysBetween(fromIso: string, toIso: string): number {
  const from = Date.parse(fromIso);
  const to = Date.parse(toIso);
  if (Number.isNaN(from) || Number.isNaN(to)) return Number.NaN;
  return Math.floor((to - from) / 86_400_000);
}

export interface StalenessResult {
  file: string;
  freshness: "W" | "A" | "B" | "C";
  retrievedAt: string;
  staleDays: number;
  limitDays: number;
  isStale: boolean;
}

/** 取得日からの経過日数が区分ごとの上限を超えていれば鮮度警告 */
export function checkStaleness(
  target: WatchTarget,
  todayIso: string,
  thresholds: Thresholds,
): StalenessResult {
  const staleDays = daysBetween(target.retrievedAt, todayIso);
  const limitDays = thresholds[target.freshness];
  return {
    file: target.file,
    freshness: target.freshness,
    retrievedAt: target.retrievedAt,
    staleDays,
    limitDays,
    isStale: Number.isNaN(staleDays) ? true : staleDays > limitDays,
  };
}

/** HTMLをテキスト化して比較用に正規化（タグ・script/style除去、空白圧縮） */
export function normalizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function hashText(text: string): string {
  return crypto.createHash("sha256").update(text, "utf-8").digest("hex");
}

/** URLからスナップショット/キューのファイル名に使う短いキーを作る */
export function urlKey(url: string): string {
  return crypto.createHash("sha1").update(url, "utf-8").digest("hex").slice(0, 12);
}

/** 同じ情報源URLを見ている複数mdをまとめる（重複フェッチ防止） */
export function groupBySource(targets: WatchTarget[]): Map<string, WatchTarget[]> {
  const map = new Map<string, WatchTarget[]>();
  for (const t of targets) {
    if (!t.sourceUrl) continue;
    const list = map.get(t.sourceUrl) ?? [];
    list.push(t);
    map.set(t.sourceUrl, list);
  }
  return map;
}

export interface QueueItemInput {
  detectedAt: string; // YYYY-MM-DD
  sourceUrl: string;
  files: string[];
  oldHash: string;
  newHash: string;
  excerpt: string;
}

/** 運用者確認キューのmdを組み立てる（検知のみ。反映は人間） */
export function buildQueueItem(input: QueueItemInput): {
  filename: string;
  content: string;
} {
  const filename = `${input.detectedAt.replaceAll("-", "")}_${urlKey(input.sourceUrl)}.md`;
  const content = `---
status: pending
detected_at: ${input.detectedAt}
source_url: ${input.sourceUrl}
targets: ${input.files.join(", ")}
old_hash: ${input.oldHash}
new_hash: ${input.newHash}
---

## 変更検知

巡回時に情報源ページの内容変化を検知しました。
**このシステムは基準mdを自動で書き換えません。反映は必ず運用者が行ってください。**

### 影響しうる基準ファイル

${input.files.map((f) => `- ${f}`).join("\n")}

### 運用者チェックリスト

- [ ] 情報源ページを開き、採点基準・手順に影響する変更かを確認する
- [ ] 影響がある場合: 対象mdの減点項目・本文を更新し、retrieved_at と reviewed_by を更新する
- [ ] 影響がない場合: 「影響なし」と判断した理由をこのファイル末尾に追記する
- [ ] このファイルの status を resolved に変更する

### 新しい内容の冒頭（参考抜粋）

> ${input.excerpt.slice(0, 400)}
`;
  return { filename, content };
}
