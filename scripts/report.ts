/**
 * 巡回の「監視対象カタログ」＋鮮度レポートをデスクトップに書き出す確認用スクリプト。
 *   npx tsx scripts/report.ts
 * content/ には一切書き込まない。デスクトップにmdを1枚出すだけ。
 *
 * このプロジェクトで「更新対象」となっている項目＝巡回が監視している全mdと、
 * その情報源・鮮度区分・更新期限のルールを一覧化する。
 */
import fs from "node:fs";
import path from "node:path";
import { checkStaleness, groupBySource } from "../src/lib/ops/patrol";
import { collectTargets, loadThresholds } from "../src/lib/ops/targets";

const today = new Date().toISOString().slice(0, 10);
const thresholds = loadThresholds();
const targets = collectTargets();
const rows = targets.map((t) => checkStaleness(t, today, thresholds));
const stale = rows.filter((r) => r.isStale);

// 情報源URL単位でまとめる（1フェッチで複数mdを見る対応）
const bySource = groupBySource(targets);

const lines: string[] = [];
lines.push(`# 農産物輸出ナビ 更新対象カタログ / 巡回レポート`);
lines.push(``);
lines.push(`生成日: ${today}`);
lines.push(`鮮度上限ルール: 区分A ${thresholds.A}日 / 区分B ${thresholds.B}日 / 区分C ${thresholds.C}日`);
lines.push(`（上限は content/ops/patrol.md が単一情報源）`);
lines.push(``);
lines.push(`監視対象の基準md: 全${targets.length}件`);
lines.push(`外部情報源（フェッチ先）: ${[...bySource.keys()].filter(Boolean).length}件`);
lines.push(`いま鮮度切れ（要確認）: ${stale.length}件`);
lines.push(``);

lines.push(`## 1. 外部情報源ごとの更新対象（巡回が変化を見張っている先）`);
lines.push(``);
lines.push(`巡回（npm run patrol）は下記URLをフェッチし、内容が変わると`);
lines.push(`対応する基準mdが「更新対象」になる。source_url を持たないmdは`);
lines.push(`外部監視の対象外で、鮮度上限による定期見直しのみ行う。`);
lines.push(``);
for (const [url, files] of bySource) {
  if (!url) continue;
  lines.push(`### ${url}`);
  for (const f of files) {
    const r = rows.find((x) => x.file === f.file);
    lines.push(`- ${f.file.replace("content/", "")}（区分${r?.freshness ?? "?"}・取得 ${r?.retrievedAt ?? "?"}・残り${r ? r.limitDays - r.staleDays : "?"}日）`);
  }
  lines.push(``);
}

const noSource = targets.filter((t) => !t.sourceUrl);
if (noSource.length > 0) {
  lines.push(`### （外部URLなし・鮮度上限による定期見直しのみ）`);
  for (const t of noSource) {
    const r = rows.find((x) => x.file === t.file);
    lines.push(`- ${t.file.replace("content/", "")}（区分${r?.freshness ?? "?"}・取得 ${r?.retrievedAt ?? "?"}・残り${r ? r.limitDays - r.staleDays : "?"}日）`);
  }
  lines.push(``);
}

lines.push(`## 2. 全監視項目の鮮度一覧（更新期限が近い順）`);
lines.push(``);
lines.push(`| ファイル | 区分 | 取得日 | 経過/上限 | 残り日数 | 状態 |`);
lines.push(`|---|---|---|---|---|---|`);
for (const r of [...rows].sort((a, b) => a.limitDays - a.staleDays - (b.limitDays - b.staleDays))) {
  const remain = r.limitDays - r.staleDays;
  lines.push(`| ${r.file.replace("content/", "")} | ${r.freshness} | ${r.retrievedAt} | ${r.staleDays}/${r.limitDays}日 | ${remain}日 | ${r.isStale ? "⚠要確認" : "OK"} |`);
}
lines.push(``);

lines.push(`## 3. いま鮮度切れの項目`);
lines.push(``);
if (stale.length === 0) {
  lines.push(`**なし（全${rows.length}件が上限内）。**`);
} else {
  for (const r of stale) {
    lines.push(`- ⚠ ${r.file.replace("content/", "")}（区分${r.freshness}・取得 ${r.retrievedAt}・${r.staleDays}/${r.limitDays}日）`);
  }
}
lines.push(``);
lines.push(`---`);
lines.push(`※このレポートは確認用の出力です。基準mdの更新は必ず運用者が行います（自動書換なし）。`);
lines.push(`最新の差分検知の生ログは ops/patrol-report.md を参照。`);

const desktop = path.join(process.env.USERPROFILE || process.env.HOME || ".", "Desktop");
const outPath = path.join(desktop, `農産物輸出ナビ_更新対象カタログ_${today}.md`);
fs.writeFileSync(outPath, lines.join("\n"), "utf-8");
console.log(`書き出しました: ${outPath}`);
console.log(`監視md ${targets.length}件 / 外部情報源 ${[...bySource.keys()].filter(Boolean).length}件 / 鮮度切れ ${stale.length}件`);
