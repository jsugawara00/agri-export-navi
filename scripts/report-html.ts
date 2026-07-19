/**
 * 画面領域（検索結果／ナビ／ツール）ごとに、どの基準mdが更新対象（巡回・鮮度監視の
 * 対象）かを分類し、デスクトップに自己完結HTMLを書き出す確認用スクリプト。
 *   npx tsx scripts/report-html.ts
 * content/ には一切書き込まない。
 */
import fs from "node:fs";
import path from "node:path";
import { checkStaleness } from "../src/lib/ops/patrol";
import { collectTargets, loadThresholds } from "../src/lib/ops/targets";

const CONTENT = path.join(process.cwd(), "content");
const today = new Date().toISOString().slice(0, 10);
const thresholds = loadThresholds();
const rows = collectTargets().map((t) => ({
  ...t,
  ...checkStaleness(t, today, thresholds),
}));

function rel(f: string) {
  return f.replace("content/", "");
}
function remain(r: (typeof rows)[number]) {
  return r.limitDays - r.staleDays;
}

// 監視対象md（＝更新対象）を、表示される画面領域に対応づける
type Area = "result" | "nav" | "tool";
function areasOf(file: string): Area[] {
  if (file.includes("criteria/institutional")) return ["result", "nav"];
  if (file.includes("criteria/geopolitical")) return ["result"];
  if (file.includes("criteria/logistics")) return ["result"];
  if (file.includes("countries/")) return ["result", "nav"];
  if (file.includes("guides/")) return ["tool"];
  return [];
}

const areaMeta: Record<Area, { title: string; desc: string }> = {
  result: {
    title: "検索結果画面",
    desc: "ハードル指数・減点内訳・国概要（人口/通貨/言語/治安/検疫概要/EPA関税）を表示する画面。",
  },
  nav: {
    title: "ナビゲーション画面",
    desc: "案件のステップ進行・地域情報・ハードル解消の内訳を表示する画面。",
  },
  tool: {
    title: "ツール内（各ステップのガイド）",
    desc: "契約書・書類・港選定・銀行相談など各ツールから開くステップ別ガイド。",
  },
};

// 監視対象外（＝巡回では追っていない）ディレクトリの棚卸し
function countMd(dir: string): number {
  const d = path.join(CONTENT, dir);
  if (!fs.existsSync(d)) return 0;
  return fs.readdirSync(d).filter((f) => f.endsWith(".md")).length;
}
const notWatched = [
  { dir: "procedures", label: "ステップ定義（ナビの手順）", area: "ナビ" },
  { dir: "routes", label: "港・出荷ルート（酒田港等）", area: "ツール（港選定）" },
  { dir: "forwarders", label: "乙仲リスト", area: "ツール（港選定）" },
  { dir: "reference", label: "県輸出統計（参考表示）", area: "検索結果" },
  { dir: "checklists", label: "銀行相談チェックリスト等", area: "ツール" },
  { dir: "municipalities", label: "自治体（港の選択肢）", area: "ツール（港選定）" },
].map((x) => ({ ...x, count: countMd(x.dir) }));

function fresColor(f: string) {
  return f === "A" ? "#0d9488" : f === "B" ? "#b45309" : "#6b7280";
}

function tableFor(area: Area): string {
  const list = rows
    .filter((r) => areasOf(r.file).includes(area))
    .sort((a, b) => remain(a) - remain(b));
  if (list.length === 0) return "<p>（該当なし）</p>";
  const body = list
    .map(
      (r) => `<tr>
      <td class="mono">${rel(r.file)}</td>
      <td><span class="badge" style="background:${fresColor(r.freshness)}">区分${r.freshness}</span></td>
      <td>${r.retrievedAt}</td>
      <td>${remain(r)}日</td>
      <td>${r.sourceUrl ? `<a href="${r.sourceUrl}">情報源</a>` : "—（定期見直し）"}</td>
      <td>${r.isStale ? "⚠要確認" : "OK"}</td>
    </tr>`,
    )
    .join("\n");
  return `<table>
    <thead><tr><th>基準ファイル</th><th>鮮度区分</th><th>取得日</th><th>更新期限まで</th><th>監視情報源</th><th>状態</th></tr></thead>
    <tbody>${body}</tbody>
  </table>`;
}

const sections = (["result", "nav", "tool"] as Area[])
  .map((a) => {
    const m = areaMeta[a];
    const n = rows.filter((r) => areasOf(r.file).includes(a)).length;
    return `<section>
      <h2>${m.title} <span class="count">更新対象 ${n}件</span></h2>
      <p class="desc">${m.desc}</p>
      ${tableFor(a)}
    </section>`;
  })
  .join("\n");

const notWatchedRows = notWatched
  .map(
    (x) => `<tr><td class="mono">${x.dir}/</td><td>${x.label}</td><td>${x.area}</td><td>${x.count}件</td></tr>`,
  )
  .join("\n");

const html = `<!doctype html>
<html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>農産物輸出ナビ 更新対象マップ ${today}</title>
<style>
  body { font-family: system-ui, "Segoe UI", sans-serif; max-width: 960px; margin: 0 auto; padding: 24px; color: #1f2937; line-height: 1.6; }
  h1 { font-size: 1.5rem; border-bottom: 2px solid #0d9488; padding-bottom: 8px; }
  h2 { font-size: 1.15rem; margin-top: 32px; }
  .count { font-size: .8rem; color: #0d9488; font-weight: 600; margin-left: 8px; }
  .desc { color: #6b7280; font-size: .9rem; margin-top: 4px; }
  .summary { background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-size: .92rem; }
  table { border-collapse: collapse; width: 100%; margin-top: 12px; font-size: .85rem; }
  th, td { border: 1px solid #e5e7eb; padding: 6px 10px; text-align: left; vertical-align: top; }
  th { background: #f9fafb; }
  .mono { font-family: ui-monospace, monospace; font-size: .8rem; }
  .badge { color: #fff; padding: 1px 8px; border-radius: 999px; font-size: .72rem; white-space: nowrap; }
  a { color: #0d9488; }
  .note { color: #6b7280; font-size: .82rem; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 12px; }
</style></head>
<body>
<h1>農産物輸出ナビ 更新対象マップ</h1>
<p class="desc">生成日: ${today}／鮮度上限ルール: 区分A ${thresholds.A}日・区分B ${thresholds.B}日・区分C ${thresholds.C}日（content/ops/patrol.md）</p>

<div class="summary">
  <strong>更新対象（巡回・鮮度監視の対象）</strong>は全 ${rows.length} 件。うち鮮度切れ ${rows.filter((r) => r.isStale).length} 件。<br>
  「監視情報源」列にURLがあるものは、その情報源が変わると自動で更新対象として検知されます。
  「—」は外部URLを持たず、鮮度上限による定期見直しのみ行う項目です。
</div>

${sections}

<section>
  <h2>参考: 巡回の監視対象外（画面には出るが、鮮度監視はしていない）</h2>
  <p class="desc">これらは内容が変わりうるが、現状の巡回では追っていない。更新は手動で見直す。</p>
  <table>
    <thead><tr><th>ディレクトリ</th><th>内容</th><th>主な画面</th><th>件数</th></tr></thead>
    <tbody>${notWatchedRows}</tbody>
  </table>
</section>

<p class="note">※このHTMLは確認用の出力です。基準mdの更新は必ず運用者が行います（自動書換なし）。最新の差分検知の生ログは ops/patrol-report.md を参照。</p>
</body></html>`;

const desktop = path.join(process.env.USERPROFILE || process.env.HOME || ".", "Desktop");
const outPath = path.join(desktop, `農産物輸出ナビ_更新対象マップ_${today}.html`);
fs.writeFileSync(outPath, html, "utf-8");
console.log(`書き出しました: ${outPath}`);
for (const a of ["result", "nav", "tool"] as Area[]) {
  console.log(`${areaMeta[a].title}: 更新対象 ${rows.filter((r) => areasOf(r.file).includes(a)).length}件`);
}
