import type { CountryId, ItemId } from "./catalog";
import type { ScoreResult } from "@/lib/score/engine";
import type { ContentMeta, CriteriaAxis, ProcedureStep } from "./types";

/**
 * サーバで組み立ててクライアント（ナビ画面・案件一覧）へ渡す、
 * 組み合わせごとのステップ定義＋判定結果。クライアントからも参照するため
 * server-only の combos.ts から分離している。
 */
export interface ComboData {
  item: ItemId;
  country: CountryId;
  itemLabel: string;
  countryLabel: string;
  steps: ProcedureStep[];
  result: ScoreResult;
  axisMeta: Record<CriteriaAxis, ContentMeta>;
}

export type ComboMap = Record<string, ComboData>;

export function comboKey(item: ItemId, country: CountryId): string {
  return `${item}_${country}`;
}
