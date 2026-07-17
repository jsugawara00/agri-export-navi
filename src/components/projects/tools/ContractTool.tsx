"use client";

import { useState } from "react";
import Link from "next/link";
import ContractPdf from "@/components/pdf/ContractPdf";
import { comboKey, type ComboMap } from "@/lib/content/combo-types";
import {
  CONTRACT_DISCLAIMER_JA,
  CONTRACT_FIELDS,
  contractClauses,
  contractInputKey,
  contractVarsFromInputs,
  type ContractVars,
} from "@/lib/docs/contract";
import { downloadPdf } from "@/lib/pdf/download";
import { contractDraftStatus, updateInputs } from "@/lib/projects/logic";
import { useProject } from "@/components/projects/useProject";
import type { ComboData } from "@/lib/content/combo-types";
import type { Project } from "@/lib/projects/types";
import ToolGuard from "./ToolGuard";
import FieldInput from "./FieldInput";

export default function ContractTool({ id, combos }: { id: string; combos: ComboMap }) {
  const state = useProject(id);
  if (!state.project) return <ToolGuard state={state} />;
  const combo = combos[comboKey(state.project.item, state.project.country)];
  if (!combo) return <p className="mt-6 text-sm text-red-400">基準ファイルが見つかりません。</p>;
  return (
    <ContractForm id={id} project={state.project} combo={combo} persist={state.persist} />
  );
}

function ContractForm({
  id,
  project,
  combo,
  persist,
}: {
  id: string;
  project: Project;
  combo: ComboData;
  persist: (p: Project) => Promise<void>;
}) {
  const [draft, setDraft] = useState<ContractVars>(() =>
    contractVarsFromInputs(project.inputs),
  );
  const [busy, setBusy] = useState(false);

  const { isDraft, outstanding } = contractDraftStatus(
    combo.steps,
    project.progress.completedSteps,
  );

  const saveField = (key: keyof ContractVars) => {
    const stored = project.inputs[contractInputKey(key)] ?? "";
    if (draft[key] === stored) return;
    persist(updateInputs(project, { [contractInputKey(key)]: draft[key] }));
  };

  const handleDownload = async () => {
    setBusy(true);
    try {
      await downloadPdf(
        <ContractPdf
          vars={draft}
          isDraft={isDraft}
          outstanding={outstanding.map((o) => o.titleEn ?? o.id)}
        />,
        `sales-agreement_${project.item}_${project.country}.pdf`,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 space-y-6">
      <p className="text-sm text-dim">
        {combo.itemLabel} × {combo.countryLabel} の英文輸出契約書ひな形です。
        変数欄を入力するとプレビューに反映されます（入力はこの案件に保存されます）。
      </p>

      {isDraft && (
        <div className="rounded-xl border border-amber/40 bg-panel p-4 text-sm">
          <p className="font-semibold text-amber">この契約書はDRAFT（下書き）扱いです</p>
          <p className="mt-1 text-xs leading-relaxed text-dim">
            未完了の確認事項: {outstanding.map((o) => o.title).join("、")}。
            確認ステップが完了するまで、PDFにはDRAFT透かしと未確認事項リストが刷り込まれます。
            先取りで作成しておくこと自体は問題ありません。
          </p>
          <Link href={`/projects/${id}`} className="mt-2 inline-block text-xs text-teal underline">
            確認ステップへ →
          </Link>
        </div>
      )}

      {/* 入力フォーム */}
      <section className="rounded-xl border border-line bg-panel p-4">
        <h2 className="text-sm font-semibold">変数の入力（英数字で入力）</h2>
        <p className="mt-1 text-xs text-dim">
          PDFは英文書類として出力されます。日本語はPDFに表示されないため、各欄は英語・ローマ字で入力してください。
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {CONTRACT_FIELDS.map((f) => (
            <FieldInput
              key={f.key}
              label={f.label}
              placeholder={f.placeholder}
              options={f.options}
              value={draft[f.key]}
              onChange={(v) => setDraft({ ...draft, [f.key]: v })}
              onSave={() => saveField(f.key)}
            />
          ))}
        </div>
      </section>

      {/* プレビュー（変数ハイライト） */}
      <section className="rounded-xl border border-line bg-panel p-4">
        <h2 className="text-sm font-semibold">プレビュー（変数箇所をハイライト表示）</h2>
        <div className="mt-3 space-y-3 rounded-lg bg-background/60 p-4 text-[13px] leading-relaxed">
          <p className="text-center text-sm font-bold tracking-widest">SALES AGREEMENT</p>
          {contractClauses().map((clause) => (
            <div key={clause.title}>
              <p className="text-xs font-bold text-dim">{clause.title}</p>
              <p>
                {clause.segments.map((seg, i) =>
                  typeof seg === "string" ? (
                    <span key={i}>{seg}</span>
                  ) : draft[seg.var] ? (
                    <mark key={i} className="rounded bg-teal/20 px-1 text-teal">
                      {draft[seg.var]}
                    </mark>
                  ) : (
                    <mark key={i} className="rounded bg-amber/20 px-1 text-amber">
                      [未入力: {CONTRACT_FIELDS.find((f) => f.key === seg.var)?.label}]
                    </mark>
                  ),
                )}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="text-center">
        <button
          onClick={handleDownload}
          disabled={busy}
          className="rounded-lg bg-teal px-8 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "生成中…" : isDraft ? "PDFをダウンロード（DRAFT透かし付き）" : "PDFをダウンロード"}
        </button>
        <p className="mx-auto mt-3 max-w-xl text-[11px] leading-relaxed text-dim/80">
          {CONTRACT_DISCLAIMER_JA}（この文言はPDFにも英文で明記されます）
        </p>
      </div>
    </div>
  );
}
