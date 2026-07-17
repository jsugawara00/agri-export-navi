/** 鮮度区分: A=自動取得 / B=変更検知型(人間確認済み) / C=静的md */
export type Freshness = "A" | "B" | "C";

/** 全contentが必ず持つ鮮度メタデータ */
export interface ContentMeta {
  freshness: Freshness;
  source: string;
  sourceUrl?: string;
  retrievedAt: string;
  reviewedBy?: string;
}

export type CriteriaAxis = "institutional" | "geopolitical" | "logistics";

/** 減点項目（対処案 remedy とナビステップ step_ref を必ず持つ） */
export interface Deduction {
  id: string;
  points: number; // 負の値
  label: string;
  remedy: string;
  stepRef: string; // "apple_taiwan#orchard-registration" または "#logistics-plan"（組み合わせ相対）
}

/** 採点mdファイル1枚分 */
export interface CriteriaDoc {
  axis: CriteriaAxis;
  meta: ContentMeta;
  prohibited: boolean;
  prohibitedReason?: string;
  deductions: Deduction[];
  overview: string;
}

/** ステップに紐づく書類ツール（/projects/[id]/{tool} へのリンク先） */
export type StepTool = "contract" | "invoice" | "logistics" | "bank";

export interface ProcedureStep {
  id: string;
  layer: 1 | 2 | 3;
  title: string;
  /** PDF等の英文出力で使う英語タイトル（任意） */
  titleEn?: string;
  purpose: string;
  /** 対応する書類ツール（任意） */
  tool?: StepTool;
  /** "human-confirm" = 官庁確認ゲート（確認結果の入力なしに完了できない） */
  gate?: string;
  /** ゲートステップで提示する質問リスト（md内の q1, q2, ... から収集） */
  questions: string[];
  /**
   * 先に完了が必要なステップid（md内の requires: a, b）。
   * 真に順番が固定される依存のみ書く。無指定のステップはいつでも先取り着手できる。
   */
  requires: string[];
}

export interface ProcedureDoc {
  meta: ContentMeta;
  steps: ProcedureStep[];
}

export interface CountryDoc {
  id: string;
  meta: ContentMeta;
  nameJa: string;
  route: string;
  population: string;
  currency: string;
  language: string;
  safetyLevel: string;
  safetyNote: string;
  quarantineSummary: string;
  epaSummary: string;
}
