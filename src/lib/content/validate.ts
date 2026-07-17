import { COUNTRIES, ITEMS } from "./catalog";
import {
  loadCountry,
  loadCriteriaSet,
  loadProcedure,
} from "./loader";
import type { CriteriaDoc, ProcedureDoc } from "./types";

/**
 * content/ 配下の整合性バリデーション。
 * - frontmatter必須キー（freshness/source/retrieved_at、区分Bは reviewed_by 必須）
 * - 減点項目の必須フィールド（points は負数、remedy・step_ref 必須）
 * - step_ref がステップ定義（procedures）に実在すること
 */
export function validateAll(): string[] {
  const errors: string[] = [];

  for (const country of COUNTRIES) {
    try {
      loadCountry(country.id);
    } catch (e) {
      errors.push(String(e));
    }
  }

  for (const item of ITEMS) {
    for (const country of COUNTRIES) {
      const comboName = `${item.id}_${country.id}`;
      let set: ReturnType<typeof loadCriteriaSet>;
      let procedure: ProcedureDoc;
      try {
        set = loadCriteriaSet(item.id, country.id);
        procedure = loadProcedure(item.id, country.id);
      } catch (e) {
        errors.push(String(e));
        continue;
      }

      if (procedure.steps.length === 0) {
        errors.push(`procedures/${comboName}.md: ステップが定義されていません`);
      }
      for (const step of procedure.steps) {
        if (!step.id || !step.title || !step.purpose || ![1, 2, 3].includes(step.layer)) {
          errors.push(`procedures/${comboName}.md: ステップ ${step.id || "(id無し)"} の定義が不完全です`);
        }
        if (step.gate && step.questions.length === 0) {
          errors.push(
            `procedures/${comboName}.md: ゲートステップ ${step.id} に質問リスト（q1〜）がありません`,
          );
        }
      }

      const docs: [string, CriteriaDoc][] = [
        [`criteria/institutional/${comboName}.md`, set.institutional],
        [`criteria/geopolitical/${country.id}.md`, set.geopolitical],
        [`criteria/logistics/${set.country.route}.md`, set.logistics],
      ];

      for (const [file, doc] of docs) {
        if (doc.meta.freshness === "B" && !doc.meta.reviewedBy) {
          errors.push(`${file}: 区分Bなのに reviewed_by がありません（人間確認済みの証跡が必要）`);
        }
        if (doc.prohibited) continue;
        for (const d of doc.deductions) {
          if (!d.id) errors.push(`${file}: id のない減点項目があります`);
          if (!Number.isFinite(d.points) || d.points >= 0) {
            errors.push(`${file}: 減点項目 ${d.id} の points は負の数値である必要があります`);
          }
          if (!d.label) errors.push(`${file}: 減点項目 ${d.id} に label がありません`);
          if (!d.remedy) errors.push(`${file}: 減点項目 ${d.id} に remedy（対処案）がありません`);
          if (!d.stepRef) {
            errors.push(`${file}: 減点項目 ${d.id} に step_ref がありません`);
            continue;
          }
          // step_ref解決: "file#step" 形式、"#step" は当該組み合わせの手順に対する相対参照
          const [refFile, stepId] = d.stepRef.split("#");
          if (!stepId) {
            errors.push(`${file}: 減点項目 ${d.id} の step_ref "${d.stepRef}" が不正です（#stepId が必要）`);
            continue;
          }
          if (refFile && refFile !== comboName) {
            errors.push(
              `${file}: 減点項目 ${d.id} の step_ref "${d.stepRef}" が組み合わせ ${comboName} と一致しません`,
            );
            continue;
          }
          if (!procedure.steps.some((s) => s.id === stepId)) {
            errors.push(
              `${file}: 減点項目 ${d.id} の step_ref "${d.stepRef}" に対応するステップが procedures/${comboName}.md にありません`,
            );
          }
        }
      }
    }
  }

  return errors;
}
