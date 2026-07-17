"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import FreshnessBadge from "@/components/FreshnessBadge";
import { comboKey, type ComboData, type ComboMap } from "@/lib/content/combo-types";
import type { ProcedureStep } from "@/lib/content/types";
import {
  GateNotConfirmedError,
  StepLockedError,
  actionableSteps,
  isStepRefResolved,
  recap,
  rejudge,
  toggleStep,
  updateMemo,
} from "@/lib/projects/logic";
import { resolveStore, type ProjectStore } from "@/lib/projects/store";
import type { Project } from "@/lib/projects/types";

const LAYER_BADGE: Record<number, { label: string; cls: string }> = {
  1: { label: "層1 システムで完結", cls: "border-teal/50 text-teal" },
  2: { label: "層2 下書きあり・実行はあなた", cls: "border-amber/50 text-amber" },
  3: { label: "層3 このアプリの範囲外", cls: "border-dim/50 text-dim" },
};

const AXIS_LABEL: Record<string, string> = {
  institutional: "制度要因",
  geopolitical: "国情勢要因",
  logistics: "物流経路要因",
};

function StepItem({
  step,
  project,
  missingTitles,
  onToggle,
}: {
  step: ProcedureStep;
  project: Project;
  /** 未完了の依存ステップ名（あればロック表示） */
  missingTitles: string[];
  onToggle: (step: ProcedureStep, confirmText?: string) => Promise<void>;
}) {
  const done = project.progress.completedSteps.includes(step.id);
  const locked = !done && missingTitles.length > 0;
  const [confirmText, setConfirmText] = useState(project.inputs[step.id] ?? "");
  const [error, setError] = useState("");
  const badge = LAYER_BADGE[step.layer];

  const handleToggle = async () => {
    setError("");
    try {
      await onToggle(step, confirmText);
    } catch (e) {
      if (e instanceof GateNotConfirmedError) {
        setError("確認結果を入力してから完了にしてください（人間確認ゲート）");
      } else if (e instanceof StepLockedError) {
        setError("先に依存するステップを完了してください");
      } else {
        setError(String(e));
      }
    }
  };

  return (
    <li
      className={`rounded-xl border p-4 ${done ? "border-teal/40 bg-teal/5" : "border-line bg-panel"} ${locked ? "opacity-70" : ""}`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={done}
          disabled={locked}
          onChange={handleToggle}
          className="mt-1 h-4 w-4 accent-[#8fd4b8] disabled:opacity-40"
          aria-label={`${step.title} を${done ? "未完了" : "完了"}にする`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className={`text-sm font-medium ${done ? "text-teal" : ""}`}>{step.title}</p>
            <span className={`rounded border px-1.5 py-0.5 text-[10px] ${badge.cls}`}>
              {badge.label}
            </span>
          </div>
          {/* 「何のためにやるか」一行説明（常設） */}
          <p className="mt-1 text-xs leading-relaxed text-dim">{step.purpose}</p>

          {locked && (
            <p className="mt-2 text-xs text-amber">
              🔒 先に「{missingTitles.join("」「")}」を完了すると着手できます
            </p>
          )}

          {step.gate && !done && !locked && (
            <div className="mt-3 rounded-lg border border-amber/30 bg-background/60 p-3">
              <p className="text-xs font-semibold text-amber">
                確認電話の質問リスト（結果を入力するまで次へ進めません）
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-dim">
                {step.questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
              <textarea
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="確認した結果を記録（例: 7/17に◯◯防疫所へ確認。条件変更なし）"
                rows={2}
                className="mt-2 w-full rounded border border-line bg-panel px-2 py-1.5 text-xs focus:border-teal focus:outline-none"
              />
            </div>
          )}
          {step.gate && done && project.inputs[step.id] && (
            <p className="mt-2 rounded bg-background/60 px-2 py-1.5 text-xs text-dim">
              確認結果: {project.inputs[step.id]}
            </p>
          )}
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </div>
      </div>
    </li>
  );
}

export default function ProjectNavClient({
  id,
  combos,
}: {
  id: string;
  combos: ComboMap;
}) {
  const { enabled, user, loading, signIn } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [memoDraft, setMemoDraft] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const uid = user?.uid ?? null;
  const store: ProjectStore | null = useMemo(
    () => (loading ? null : resolveStore(uid)),
    [loading, uid],
  );

  useEffect(() => {
    if (!store) return;
    let alive = true;
    store.get(id).then((p) => {
      if (!alive) return;
      if (p) setProject(p);
      else setNotFound(true);
    });
    return () => {
      alive = false;
    };
  }, [store, id]);

  if (loading) return <p className="text-sm text-dim">読み込み中…</p>;

  if (enabled && !user) {
    return (
      <div>
        <p className="text-sm text-dim">この案件を開くにはログインが必要です。</p>
        <button
          onClick={() => signIn()}
          className="mt-3 rounded-lg border border-teal px-6 py-2.5 text-sm font-semibold text-teal hover:bg-teal/10"
        >
          Googleでログイン
        </button>
      </div>
    );
  }

  if (notFound) {
    return (
      <p className="text-sm text-dim">
        案件が見つかりません。
        <Link href="/projects" className="ml-1 text-teal underline">
          案件一覧へ戻る
        </Link>
      </p>
    );
  }

  if (!project || !store) return <p className="text-sm text-dim">読み込み中…</p>;

  const key = comboKey(project.item, project.country);
  const combo: ComboData | undefined = combos[key];
  if (!combo) {
    return <p className="text-sm text-red-400">この案件の基準ファイルが見つかりません（{key}）。</p>;
  }

  const steps = combo.steps;
  const completed = project.progress.completedSteps;
  const { last, next } = recap(steps, completed);
  const actionable = actionableSteps(steps, completed);
  const pct = project.progress.completionPct;
  const missingTitlesOf = (step: ProcedureStep) =>
    step.requires
      .filter((r) => !completed.includes(r))
      .map((r) => steps.find((s) => s.id === r)?.title ?? r);

  const persist = async (updated: Project) => {
    setProject(updated);
    await store.save(updated);
  };

  const handleToggle = async (step: ProcedureStep, confirmText?: string) => {
    await persist(toggleStep(project, step, steps, confirmText));
  };

  // 基準mdが更新されてスナップショットと差が出た場合のみ再判定を提案（無断で差し替えない）
  const current = combo.result;
  const changed =
    current.status === "scored" &&
    (current.score !== project.hurdle.score || current.grade !== project.hurdle.grade);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-dim">案件ナビゲーション</p>
        <h1 className="mt-1 text-2xl font-bold">
          {combo.itemLabel} × {combo.countryLabel}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="underline decoration-dotted"
          >
            難易度{project.hurdle.grade}（{project.hurdle.score}点・
            {project.hurdle.snapshotAt}時点）
          </button>
          {store.mode === "local" && (
            <span className="rounded border border-dim/40 px-1.5 py-0.5 text-[10px] text-dim">
              ローカル保存モード
            </span>
          )}
        </div>
      </div>

      {changed && current.status === "scored" && (
        <div className="rounded-xl border border-amber/40 bg-panel p-4 text-sm">
          <p className="text-amber">
            判定基準が更新されています（現在の基準では 難易度{current.grade}・
            {current.score}点）。再判定しますか？
          </p>
          <button
            onClick={() =>
              persist(
                rejudge(project, {
                  score: current.score,
                  grade: current.grade,
                  snapshotAt: new Date().toISOString().slice(0, 10),
                }),
              )
            }
            className="mt-2 rounded border border-amber px-4 py-1.5 text-xs font-semibold text-amber hover:bg-amber/10"
          >
            再判定してスナップショットを更新する
          </button>
        </div>
      )}

      {/* 内訳パネル: ステップ完了に応じて「ハードル解消済み」を反映 */}
      {showBreakdown && current.status === "scored" && (
        <div className="rise rounded-xl border border-line bg-panel p-4">
          <h2 className="text-sm font-semibold">減点内訳と解消状況</h2>
          <ul className="mt-3 space-y-2">
            {current.breakdown.map((b) => {
              const resolved = isStepRefResolved(b.stepRef, key, completed);
              return (
                <li
                  key={`${b.axis}-${b.id}`}
                  className={`rounded-lg border p-3 ${resolved ? "border-teal/40 bg-teal/5" : "border-line bg-background/60"}`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm">
                      <span className="mr-2 text-[10px] text-dim">{AXIS_LABEL[b.axis]}</span>
                      {b.label}
                    </p>
                    <p className="text-sm font-semibold text-amber">{b.points}点</p>
                  </div>
                  <p className="mt-1 text-xs text-dim">対処案: {b.remedy}</p>
                  <p className={`mt-1 text-[11px] ${resolved ? "text-teal" : "text-dim/70"}`}>
                    {resolved ? "✓ ハードル解消済み" : "未対応"}
                  </p>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <FreshnessBadge meta={combo.axisMeta.institutional} />
            <FreshnessBadge meta={combo.axisMeta.geopolitical} />
            <FreshnessBadge meta={combo.axisMeta.logistics} />
          </div>
        </div>
      )}

      {/* あなたの現在地（準備完成度はハードル指数と混ぜない別軸の数字） */}
      <div className="rounded-xl border border-line bg-panel p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold">あなたの現在地</h2>
          <p className="text-sm">
            準備完成度 <span className="text-lg font-bold text-teal">{pct}%</span>
          </p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
          <div
            className="h-full rounded-full bg-teal transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-dim">
          {completed.length} / {steps.length} ステップ完了
        </p>
        {/* 再開時リキャップ */}
        <p className="mt-3 rounded-lg bg-background/60 px-3 py-2 text-sm leading-relaxed">
          {last
            ? `前回は「${last.title}」まで完了。`
            : "まだ完了したステップはありません。"}
          {next ? `次は「${next.title}」です。` : "すべてのステップが完了しました！"}
        </p>
      </div>

      {/* いま着手できるステップ（依存が満たされた未完了。並行の先取りもここに並ぶ） */}
      {actionable.length > 0 && (
        <div className="rounded-xl border border-line bg-panel p-4">
          <h2 className="text-sm font-semibold">いま着手できるステップ</h2>
          <p className="mt-1 text-xs text-dim">
            順番は自由です。確認の返事待ちの間に、契約書や書類の準備を先取りできます。
          </p>
          <ul className="mt-2 space-y-1.5">
            {actionable.map((t) => (
              <li key={t.id} className="flex items-center gap-2 text-sm">
                <span className="text-teal">→</span>
                <span>{t.title}</span>
                <span
                  className={`rounded border px-1.5 py-0.5 text-[10px] ${LAYER_BADGE[t.layer].cls}`}
                >
                  {LAYER_BADGE[t.layer].label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* バイヤーメモ */}
      <div className="rounded-xl border border-line bg-panel p-4">
        <h2 className="text-sm font-semibold">バイヤーメモ</h2>
        <textarea
          value={memoDraft ?? project.buyerMemo}
          onChange={(e) => setMemoDraft(e.target.value)}
          onBlur={() => {
            if (memoDraft !== null && memoDraft !== project.buyerMemo) {
              persist(updateMemo(project, memoDraft));
            }
            setMemoDraft(null);
          }}
          placeholder="商談相手・数量・希望時期などのメモ"
          rows={2}
          className="mt-2 w-full rounded border border-line bg-background/60 px-3 py-2 text-sm focus:border-teal focus:outline-none"
        />
      </div>

      {/* ステップリスト */}
      <div>
        <h2 className="text-sm font-semibold">ステップ</h2>
        <ul className="mt-3 space-y-3">
          {steps.map((s) => (
            <StepItem
              key={s.id}
              step={s}
              project={project}
              missingTitles={missingTitlesOf(s)}
              onToggle={handleToggle}
            />
          ))}
        </ul>
      </div>

      {/* 層3の明示宣言 */}
      <div className="rounded-xl border border-line bg-panel p-4 text-xs leading-relaxed text-dim">
        <p className="font-semibold">このアプリが関与しない領域（層3）</p>
        <p className="mt-1">
          価格交渉・契約締結そのもの、送金の実行、検疫の実地検査、園地登録の実地対応は
          本アプリの範囲外です。契約・法務はJETRO等の専門窓口へご相談ください。
        </p>
      </div>

      {/* 履歴（トレーサビリティ） */}
      <div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-xs text-dim underline decoration-dotted"
        >
          変更履歴を{showHistory ? "閉じる" : "表示"}（{project.history.length}件）
        </button>
        {showHistory && (
          <ul className="mt-2 space-y-1 text-xs text-dim">
            {[...project.history].reverse().map((h, i) => (
              <li key={i}>
                {new Date(h.at).toLocaleString("ja-JP")} —{" "}
                {h.action === "create" && "案件を作成"}
                {h.action === "step-complete" && `ステップ完了: ${h.stepId}`}
                {h.action === "step-uncomplete" && `ステップ取り消し: ${h.stepId}`}
                {h.action === "memo-update" && "メモを更新"}
                {h.action === "hurdle-rejudge" && "ハードル指数を再判定"}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-center text-[11px] leading-relaxed text-dim/80">
        検疫・制度情報の最終確認は植物防疫所等の公的機関へお願いします。
      </p>
    </div>
  );
}
