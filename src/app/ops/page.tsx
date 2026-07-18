import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { checkStaleness } from "@/lib/ops/patrol";
import { collectTargets, loadThresholds } from "@/lib/ops/targets";
import { listQueueItems, OPS_DIR } from "@/lib/ops/queue";

export const dynamic = "force-dynamic";
export const metadata = { title: "運用コンソール | 農産物輸出ナビ" };

/**
 * 区分B巡回の運用コンソール（運用者向け・読み取り専用）。
 * mdの自動書き換えは行わない。反映は必ず人間が行う。
 */
export default function OpsPage() {
  // 運用者専用: OPS_CONSOLE=1 の環境（手元のdev等）でのみ表示する。
  // 本番（Vercel）には設定しないため404になる。巡回・反映の実務は手元で行う。
  if (process.env.OPS_CONSOLE !== "1") {
    notFound();
  }

  const today = new Date().toISOString().slice(0, 10);
  const thresholds = loadThresholds();
  const targets = collectTargets();
  const staleness = targets
    .map((t) => checkStaleness(t, today, thresholds))
    .sort((a, b) => b.staleDays - a.staleDays);
  const staleItems = staleness.filter((s) => s.isStale);
  const queue = listQueueItems();
  const pending = queue.filter((q) => q.status === "pending");
  const resolved = queue.filter((q) => q.status !== "pending");

  const reportPath = path.join(OPS_DIR, "patrol-report.md");
  const lastReport = fs.existsSync(reportPath)
    ? fs.readFileSync(reportPath, "utf-8").match(/generated_at:\s*(.+)/)?.[1]
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm tracking-widest text-dim hover:text-foreground">
          <span className="font-semibold text-foreground">Toika</span>
          <span className="mx-2">|</span>農産物輸出ナビ
        </Link>
        <p className="text-xs text-dim">運用コンソール（operator）</p>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-12">
        <h1 className="text-2xl font-bold">区分B巡回・確認キュー</h1>
        <p className="mt-2 text-sm leading-relaxed text-dim">
          巡回は <code className="rounded bg-panel px-1.5 py-0.5">npm run patrol</code> で実行します。
          変更を検知しても基準mdは自動で書き換えません — 反映は必ず運用者がキューの
          チェックリストに沿って行います。
          {lastReport && <span className="ml-2">最終巡回: {lastReport}</span>}
        </p>

        {/* 確認キュー */}
        <section className="mt-6 rounded-xl border border-line bg-panel p-4">
          <h2 className="text-sm font-semibold">
            運用者確認キュー
            <span className="ml-2 rounded bg-amber/20 px-2 py-0.5 text-xs text-amber">
              pending {pending.length}
            </span>
            <span className="ml-1 rounded bg-teal/15 px-2 py-0.5 text-xs text-teal">
              resolved {resolved.length}
            </span>
          </h2>
          {pending.length === 0 ? (
            <p className="mt-2 text-sm text-dim">未対応の検知はありません。</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {pending.map((q) => (
                <li key={q.filename} className="rounded-lg border border-amber/40 bg-background/60 p-3">
                  <p className="text-sm font-medium text-amber">
                    変更検知（{q.detectedAt}） — ops/review-queue/{q.filename}
                  </p>
                  <p className="mt-1 break-all text-xs text-dim">情報源: {q.sourceUrl}</p>
                  <p className="mt-1 text-xs text-dim">
                    影響しうるmd: {q.targets.join(" / ")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 鮮度チェック */}
        <section className="mt-4 rounded-xl border border-line bg-panel p-4">
          <h2 className="text-sm font-semibold">
            鮮度チェック（{today}時点）
            {staleItems.length > 0 && (
              <span className="ml-2 rounded bg-amber/20 px-2 py-0.5 text-xs text-amber">
                要確認 {staleItems.length}件
              </span>
            )}
          </h2>
          <p className="mt-1 text-xs text-dim">
            上限: 区分A {thresholds.A}日 / 区分B {thresholds.B}日 / 区分C {thresholds.C}日
            （基準は content/ops/patrol.md）
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-dim">
                <tr className="border-b border-line">
                  <th className="py-1.5 pr-2">ファイル</th>
                  <th className="py-1.5 pr-2">区分</th>
                  <th className="py-1.5 pr-2">取得日</th>
                  <th className="py-1.5 pr-2">経過/上限</th>
                  <th className="py-1.5">状態</th>
                </tr>
              </thead>
              <tbody>
                {staleness.map((s) => (
                  <tr key={s.file} className="border-b border-line/50">
                    <td className="py-1.5 pr-2">{s.file.replace("content/", "")}</td>
                    <td className="py-1.5 pr-2">{s.freshness}</td>
                    <td className="py-1.5 pr-2">{s.retrievedAt}</td>
                    <td className="py-1.5 pr-2">
                      {s.staleDays}日 / {s.limitDays}日
                    </td>
                    <td className={`py-1.5 ${s.isStale ? "text-amber" : "text-teal"}`}>
                      {s.isStale ? "⚠ 要確認" : "OK"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-6 text-[11px] leading-relaxed text-dim/80">
          本画面はデモの運用者向けです。公開運用時はアクセス制限を設けること。
          検疫・制度情報の最終確認は植物防疫所等の公的機関へ。
        </p>
      </main>
    </div>
  );
}
