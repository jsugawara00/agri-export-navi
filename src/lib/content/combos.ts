import "server-only";
import { COUNTRIES, ITEMS } from "./catalog";
import { loadCriteriaSet, loadProcedure } from "./loader";
import { computeHurdle } from "@/lib/score/engine";
import { comboKey, type ComboMap } from "./combo-types";

export type { ComboData, ComboMap } from "./combo-types";
export { comboKey } from "./combo-types";

/** 全9組み合わせ分のステップ定義＋判定結果を組み立てる（content/ mdが単一情報源） */
export function buildAllCombos(): ComboMap {
  const map: ComboMap = {};
  for (const item of ITEMS) {
    for (const country of COUNTRIES) {
      const set = loadCriteriaSet(item.id, country.id);
      const procedure = loadProcedure(item.id, country.id);
      map[comboKey(item.id, country.id)] = {
        item: item.id,
        country: country.id,
        itemLabel: item.label,
        countryLabel: country.label,
        steps: procedure.steps,
        result: computeHurdle(set),
        axisMeta: {
          institutional: set.institutional.meta,
          geopolitical: set.geopolitical.meta,
          logistics: set.logistics.meta,
        },
      };
    }
  }
  return map;
}
