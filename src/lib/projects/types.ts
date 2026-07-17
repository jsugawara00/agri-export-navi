import type { CountryId, ItemId } from "@/lib/content/catalog";
import type { Grade } from "@/lib/score/engine";

/** 案件の状態変更履歴（トレーサビリティ。指示書 絶対原則7） */
export interface HistoryEntry {
  at: number; // epoch ms
  action:
    | "create"
    | "step-complete"
    | "step-uncomplete"
    | "memo-update"
    | "step-memo-update"
    | "inputs-update"
    | "hurdle-rejudge"
    | "info-ack";
  stepId?: string;
}

/** 判定時点のハードル指数スナップショット（mdが更新されても無断で差し替えない） */
export interface HurdleSnapshot {
  score: number;
  grade: Grade;
  snapshotAt: string; // ISO日付
}

/** Firestore projects/{projectId} と同形（ローカル保存モードでも共通） */
export interface Project {
  id: string;
  uid: string | null; // ローカル保存モードでは null
  item: ItemId;
  country: CountryId;
  buyerMemo: string;
  createdAt: number;
  updatedAt: number;
  hurdle: HurdleSnapshot;
  progress: {
    completedSteps: string[];
    completionPct: number;
  };
  /** 書類用入力値・官庁確認結果など（キーはステップid等） */
  inputs: Record<string, string>;
  /** ステップごとの自由メモ（キーはステップid。1件あたり最大150文字） */
  stepMemos: Record<string, string>;
  /** 判定時点の地域情報・減点内訳のスナップショット（変更検知用） */
  infoSnapshot: Record<string, string>;
  history: HistoryEntry[];
}
