/**
 * 区分B巡回スクリプト: 情報源の変更検知＋鮮度チェック。
 *
 *   npm run patrol            # 取得＋差分検知＋鮮度チェック
 *   npm run patrol -- --offline  # 鮮度チェックのみ（ネットワーク不要）
 *
 * 原則: content/ の基準mdには一切書き込まない（自動書換は禁止）。
 * 変化を検知したら ops/review-queue/ に確認キューを積むところまで。
 */
import fs from "node:fs";
import path from "node:path";
import {
  buildQueueItem,
  checkStaleness,
  groupBySource,
  hashText,
  normalizeHtml,
  urlKey,
} from "../src/lib/ops/patrol";
import { collectTargets, loadThresholds } from "../src/lib/ops/targets";
import { OPS_DIR, QUEUE_DIR, SNAPSHOT_DIR, hasPendingFor } from "../src/lib/ops/queue";

const offline = process.argv.includes("--offline");
const today = new Date().toISOString().slice(0, 10);

fs.mkdirSync(QUEUE_DIR, { recursive: true });
fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });

const thresholds = loadThresholds();
const targets = collectTargets();

const lines: string[] = [];
const log = (s: string) => {
  lines.push(s);
  console.log(s);
};

log(`# 巡回レポート（${today} / ${offline ? "オフライン: 鮮度チェックのみ" : "オンライン"}）`);
log("");
log("## 鮮度チェック");
log("");

let staleCount = 0;
for (const t of targets) {
  const r = checkStaleness(t, today, thresholds);
  if (r.isStale) {
    staleCount++;
    log(`- ⚠ STALE ${r.file} — 区分${r.freshness} 取得から${r.staleDays}日（上限${r.limitDays}日）`);
  }
}
if (staleCount === 0) log("- すべて鮮度上限内です");

async function fetchAndDiff() {
  log("");
  log("## 差分検知");
  log("");
  const sources = groupBySource(targets);
  for (const [url, files] of sources) {
    const key = urlKey(url);
    const hashFile = path.join(SNAPSHOT_DIR, `${key}.hash`);
    const textFile = path.join(SNAPSHOT_DIR, `${key}.txt`);
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(15000),
        headers: { "user-agent": "toika-export-navi-patrol/0.1 (content freshness check)" },
      });
      if (!res.ok) {
        log(`- ✗ ERROR ${url} — HTTP ${res.status}`);
        continue;
      }
      const text = normalizeHtml(await res.text());
      const newHash = hashText(text);
      const oldHash = fs.existsSync(hashFile) ? fs.readFileSync(hashFile, "utf-8").trim() : "";

      if (!oldHash) {
        log(`- ○ NEW ${url} — 初回スナップショットを保存（対象md ${files.length}件）`);
      } else if (oldHash === newHash) {
        log(`- ○ UNCHANGED ${url}`);
      } else if (hasPendingFor(url)) {
        log(`- ⚠ CHANGED ${url} — 既にpendingの確認キューがあるため起票をスキップ`);
      } else {
        const item = buildQueueItem({
          detectedAt: today,
          sourceUrl: url,
          files: files.map((f) => f.file),
          oldHash,
          newHash,
          excerpt: text,
        });
        fs.writeFileSync(path.join(QUEUE_DIR, item.filename), item.content);
        log(`- ⚠ CHANGED ${url} — 確認キューを起票: ops/review-queue/${item.filename}`);
      }
      fs.writeFileSync(hashFile, newHash);
      fs.writeFileSync(textFile, text);
    } catch (e) {
      log(`- ✗ ERROR ${url} — ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}

async function main() {
  if (!offline) {
    await fetchAndDiff();
  }
  log("");
  log("---");
  log("反映手順: キューmdのチェックリストに従い、基準mdの更新は必ず運用者が行うこと。");
  const report = `---
generated_at: ${new Date().toISOString()}
mode: ${offline ? "offline" : "online"}
---

${lines.join("\n")}
`;
  fs.writeFileSync(path.join(OPS_DIR, "patrol-report.md"), report);
  console.log(`\nレポートを ops/patrol-report.md に保存しました`);
}

main();
