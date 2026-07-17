import type { ProcedureStep } from "@/lib/content/types";
import type { CountryId, ItemId } from "@/lib/content/catalog";
import type { HurdleSnapshot, Project } from "./types";

/**
 * 案件操作の純関数群（ストア実装から独立。ユニットテスト対象）。
 * 準備完成度%はステップ完了で上がる進捗であり、ハードル指数とは別の数字
 * （企画書 中核設計①: 2軸の数字を混ぜない）。
 */

export function completionPct(completedSteps: string[], totalSteps: number): number {
  if (totalSteps <= 0) return 0;
  const done = completedSteps.length;
  return Math.round(Math.min(1, done / totalSteps) * 100);
}

export function createProject(args: {
  id: string;
  uid: string | null;
  item: ItemId;
  country: CountryId;
  hurdle: HurdleSnapshot;
  infoSnapshot?: Record<string, string>;
  now?: number;
}): Project {
  const now = args.now ?? Date.now();
  return {
    id: args.id,
    uid: args.uid,
    item: args.item,
    country: args.country,
    buyerMemo: "",
    createdAt: now,
    updatedAt: now,
    hurdle: args.hurdle,
    progress: { completedSteps: [], completionPct: 0 },
    inputs: {},
    stepMemos: {},
    infoSnapshot: args.infoSnapshot ?? {},
    history: [{ at: now, action: "create" }],
  };
}

/**
 * 地域情報の変更をユーザーが確認した際にスナップショットを更新する。
 * 自動では更新しない（確認は明示操作のみ。ハードル指数の再判定とは別）。
 */
export function acknowledgeInfo(
  project: Project,
  snapshot: Record<string, string>,
  now?: number,
): Project {
  const at = now ?? Date.now();
  return {
    ...project,
    infoSnapshot: snapshot,
    updatedAt: at,
    history: [...project.history, { at, action: "info-ack" }],
  };
}

/** ステップメモの最大文字数（保存容量と一覧性のための上限） */
export const STEP_MEMO_MAX = 150;

/** ステップごとの自由メモを更新する（150文字に切り詰め。空なら削除） */
export function updateStepMemo(
  project: Project,
  stepId: string,
  memo: string,
  now?: number,
): Project {
  const at = now ?? Date.now();
  const trimmed = memo.trim().slice(0, STEP_MEMO_MAX);
  const stepMemos = { ...project.stepMemos };
  if (trimmed) {
    stepMemos[stepId] = trimmed;
  } else {
    delete stepMemos[stepId];
  }
  return {
    ...project,
    stepMemos,
    updatedAt: at,
    history: [...project.history, { at, action: "step-memo-update", stepId }],
  };
}

export class GateNotConfirmedError extends Error {
  constructor(stepId: string) {
    super(`ステップ ${stepId} は確認結果の入力なしに完了できません（人間確認ゲート）`);
  }
}

export class StepLockedError extends Error {
  constructor(
    stepId: string,
    public readonly missing: string[],
  ) {
    super(`ステップ ${stepId} は依存ステップ（${missing.join(", ")}）の完了が先に必要です`);
  }
}

/** requires（真の依存）がすべて完了していれば着手可能 */
export function isStepAvailable(step: ProcedureStep, completedSteps: string[]): boolean {
  return step.requires.every((r) => completedSteps.includes(r));
}

/**
 * ステップ完了/取り消しのトグル。
 * 官庁確認ゲート（gate付きステップ）は確認結果テキスト未入力での完了を拒否する。
 */
export function toggleStep(
  project: Project,
  step: ProcedureStep,
  allSteps: ProcedureStep[],
  confirmText?: string,
  now?: number,
): Project {
  const at = now ?? Date.now();
  const completed = project.progress.completedSteps.includes(step.id);
  let completedSteps: string[];
  const inputs = { ...project.inputs };

  if (completed) {
    completedSteps = project.progress.completedSteps.filter((s) => s !== step.id);
  } else {
    if (!isStepAvailable(step, project.progress.completedSteps)) {
      throw new StepLockedError(
        step.id,
        step.requires.filter((r) => !project.progress.completedSteps.includes(r)),
      );
    }
    if (step.gate && !(confirmText ?? "").trim()) {
      throw new GateNotConfirmedError(step.id);
    }
    if (step.gate && confirmText) {
      inputs[step.id] = confirmText.trim();
    }
    completedSteps = [...project.progress.completedSteps, step.id];
  }

  return {
    ...project,
    inputs,
    updatedAt: at,
    progress: {
      completedSteps,
      completionPct: completionPct(completedSteps, allSteps.length),
    },
    history: [
      ...project.history,
      { at, action: completed ? "step-uncomplete" : "step-complete", stepId: step.id },
    ],
  };
}

/** 書類用入力値（inputs）をまとめて更新する */
export function updateInputs(
  project: Project,
  patch: Record<string, string>,
  now?: number,
): Project {
  const at = now ?? Date.now();
  return {
    ...project,
    inputs: { ...project.inputs, ...patch },
    updatedAt: at,
    history: [...project.history, { at, action: "inputs-update" }],
  };
}

/**
 * 契約書がドラフト扱いかどうか: 官庁確認ゲート（gate付きステップ）が
 * 1つでも未完了なら true。未完了ゲートの一覧も返す（PDFに刷り込む用）。
 */
export function contractDraftStatus(
  steps: ProcedureStep[],
  completedSteps: string[],
): { isDraft: boolean; outstanding: ProcedureStep[] } {
  const outstanding = steps.filter((s) => s.gate && !completedSteps.includes(s.id));
  return { isDraft: outstanding.length > 0, outstanding };
}

export function updateMemo(project: Project, memo: string, now?: number): Project {
  const at = now ?? Date.now();
  return {
    ...project,
    buyerMemo: memo,
    updatedAt: at,
    history: [...project.history, { at, action: "memo-update" }],
  };
}

/** 基準md更新後の再判定（ユーザーが明示的に選んだときだけスナップショットを更新） */
export function rejudge(project: Project, hurdle: HurdleSnapshot, now?: number): Project {
  const at = now ?? Date.now();
  return {
    ...project,
    hurdle,
    updatedAt: at,
    history: [...project.history, { at, action: "hurdle-rejudge" }],
  };
}

/**
 * step_ref（"apple_taiwan#orchard-registration" または "#logistics-plan"）が
 * 完了済みステップに対応するか（=ハードル解消済みか）を判定する。
 */
export function isStepRefResolved(
  stepRef: string,
  comboKey: string,
  completedSteps: string[],
): boolean {
  const [refFile, stepId] = stepRef.split("#");
  if (!stepId) return false;
  if (refFile && refFile !== comboKey) return false;
  return completedSteps.includes(stepId);
}

/** 再開時リキャップ: 「前回は◯◯まで完了。次は◯◯です」 */
export function recap(
  steps: ProcedureStep[],
  completedSteps: string[],
): { last: ProcedureStep | null; next: ProcedureStep | null } {
  const done = steps.filter((s) => completedSteps.includes(s.id));
  const next = steps.find((s) => !completedSteps.includes(s.id)) ?? null;
  const last = done.length > 0 ? done[done.length - 1] : null;
  return { last, next };
}

/**
 * いま着手できるステップ: 未完了かつ依存（requires）が満たされたもの全部。
 * 返事待ちの間に先取りできる並行作業がそのまま並ぶ（直列のTODOにしない）。
 */
export function actionableSteps(
  steps: ProcedureStep[],
  completedSteps: string[],
): ProcedureStep[] {
  return steps.filter(
    (s) => !completedSteps.includes(s.id) && isStepAvailable(s, completedSteps),
  );
}
