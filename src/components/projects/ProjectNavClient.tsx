"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import FreshnessBadge from "@/components/FreshnessBadge";
import { comboKey, type ComboData, type ComboMap } from "@/lib/content/combo-types";
import type { ProcedureStep } from "@/lib/content/types";
import { buildInfoSnapshot, diffInfoSnapshot } from "@/lib/projects/info";
import {
  GateNotConfirmedError,
  STEP_MEMO_MAX,
  StepLockedError,
  actionableSteps,
  isStepRefResolved,
  recap,
  rejudge,
  toggleStep,
  updateMemo,
  updateStepMemo,
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
  onMemo,
  highlighted,
}: {
  step: ProcedureStep;
  project: Project;
  /** 未完了の依存ステップ名（あればロック表示） */
  missingTitles: string[];
  onToggle: (step: ProcedureStep, confirmText?: string) => Promise<void>;
  onMemo: (step: ProcedureStep, memo: string) => Promise<void>;
  /** 「いま着手できるステップ」からジャンプした直後のハイライト */
  highlighted: boolean;
}) {
  const done = project.progress.completedSteps.includes(step.id);
  const locked = !done && missingTitles.length > 0;
  const [confirmText, setConfirmText] = useState(project.inputs[step.id] ?? "");
  const [error, setError] = useState("");
  const memo = project.stepMemos[step.id] ?? "";
  const [memoEditing, setMemoEditing] = useState(false);
  const [memoDraft, setMemoDraft] = useState("");
  const badge = LAYER_BADGE[step.layer];

  const saveMemo = async () => {
    setMemoEditing(false);
    const next = memoDraft.trim().slice(0, STEP_MEMO_MAX);
    if (next !== memo) {
      await onMemo(step, next);
    }
  };

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
      id={`step-${step.id}`}
      className={`rounded-xl border p-4 transition-shadow duration-500 scroll-mt-24 ${done ? "border-teal/40 bg-teal/5" : "border-line bg-panel"} ${locked ? "opacity-70" : ""} ${highlighted ? "ring-2 ring-teal/70" : ""}`}
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

          {/* 全ステップにツール導線: 専用ツールがあればそちら、なければステップガイド */}
          <Link
            href={
              step.tool
                ? `/projects/${project.id}/${step.tool}`
                : `/projects/${project.id}/guide/${step.id}`
            }
            className="mt-2 inline-block text-xs text-teal underline decoration-dotted underline-offset-4"
          >
            このステップのツールを開く →
          </Link>

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

          {/* ステップメモ: 一行表示（あふれは…省略）→クリックで展開編集 */}
          {memoEditing ? (
            <div className="mt-2">
              <textarea
                value={memoDraft}
                onChange={(e) => setMemoDraft(e.target.value.slice(0, STEP_MEMO_MAX))}
                onBlur={saveMemo}
                autoFocus
                rows={3}
                maxLength={STEP_MEMO_MAX}
                placeholder="このステップのメモ（担当者名・電話した日・気づき等）"
                className="w-full rounded border border-line bg-background/60 px-2 py-1.5 text-xs leading-relaxed focus:border-teal focus:outline-none"
              />
              <p className="text-right text-[10px] text-dim/70">
                {memoDraft.length} / {STEP_MEMO_MAX}
              </p>
            </div>
          ) : (
            <button
              onClick={() => {
                setMemoDraft(memo);
                setMemoEditing(true);
              }}
              className="mt-1.5 block w-full truncate text-left text-xs"
              title={memo || "メモを追加"}
            >
              {memo ? (
                <span className="text-dim">📝 {memo}</span>
              ) : (
                <span className="text-dim/50">＋ メモを追加</span>
              )}
            </button>
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
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const jumpToStep = (stepId: string) => {
    document
      .getElementById(`step-${stepId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightId(stepId);
    window.setTimeout(() => setHighlightId(null), 1600);
  };

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

  const handleMemo = async (step: ProcedureStep, memo: string) => {
    await persist(updateStepMemo(project, step.id, memo));
  };

  // 基準mdが更新されてスナップショットと差が出た場合のみ再判定を提案（無断で差し替えない）
  const current = combo.result;
  const changed =
    current.status === "scored" &&
    (current.score !== project.hurdle.score || current.grade !== project.hurdle.grade);

  // 地域情報・減点内訳の変更検知（保存時スナップショットとの比較）
  const infoChanges = diffInfoSnapshot(
    project.infoSnapshot,
    buildInfoSnapshot(combo.countryDoc, combo.result),
  );

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
          <Link
            href={`/projects/${project.id}/info`}
            className="text-xs text-teal underline decoration-dotted underline-offset-4"
          >
            地域情報・判定内訳を見る →
          </Link>
        </div>
      </div>

      {/* 輸出に関わる情報の変更検知（保存時スナップショットとの差分） */}
      {infoChanges.length > 0 && (
        <div className="rounded-xl border border-amber/50 bg-panel p-4 text-sm">
          <p className="font-semibold text-amber">
            ⚠ 輸出に関わる情報に変更があります（{infoChanges.length}件）。確認をお願いします
          </p>
          <p className="mt-1 text-xs text-dim">
            変更: {infoChanges.map((c) => c.label).join("、")}
          </p>
          <Link
            href={`/projects/${project.id}/info`}
            className="mt-2 inline-block rounded border border-amber px-4 py-1.5 text-xs font-semibold text-amber transition hover:bg-amber/10"
          >
            地域情報で変更点を確認する →
          </Link>
        </div>
      )}

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
          <h2 className="text-sm font-semibold">いま着手できるステップ（着手中のステップ）</h2>
          <p className="mt-1 text-xs text-dim">
            順番は自由です。確認の返事待ちの間に、契約書や書類の準備を先取りできます。
            クリックでそのステップへ移動します。
          </p>
          <ul className="mt-2 space-y-1.5">
            {actionable.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => jumpToStep(t.id)}
                  className="group flex w-full items-center gap-2 rounded px-1 py-0.5 text-left text-sm hover:bg-background/60"
                >
                  <span className="text-teal">→</span>
                  <span className="underline decoration-dotted underline-offset-4 group-hover:text-teal">
                    {t.title}
                  </span>
                  <span
                    className={`rounded border px-1.5 py-0.5 text-[10px] ${LAYER_BADGE[t.layer].cls}`}
                  >
                    {LAYER_BADGE[t.layer].label}
                  </span>
                </button>
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
              onMemo={handleMemo}
              highlighted={highlightId === s.id}
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
                {h.action === "step-memo-update" && `ステップメモ更新: ${h.stepId}`}
                {h.action === "hurdle-rejudge" && "ハードル指数を再判定"}
                {h.action === "info-ack" && "地域情報の変更を確認"}
                {h.action === "inputs-update" && "書類の入力値を更新"}
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
