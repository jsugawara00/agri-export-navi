"use client";

import { useState } from "react";
import InvoicePdf from "@/components/pdf/InvoicePdf";
import PackingListPdf from "@/components/pdf/PackingListPdf";
import { comboKey, type ComboMap } from "@/lib/content/combo-types";
import {
  INVOICE_FIELDS,
  computeAmount,
  invoiceInputKey,
  invoiceVarsFromInputs,
  type InvoiceVars,
} from "@/lib/docs/invoice";
import { downloadPdf } from "@/lib/pdf/download";
import { updateInputs } from "@/lib/projects/logic";
import { useProject } from "@/components/projects/useProject";
import type { ComboData } from "@/lib/content/combo-types";
import type { Project } from "@/lib/projects/types";
import ToolGuard from "./ToolGuard";
import FieldInput from "./FieldInput";

export default function InvoiceTool({ id, combos }: { id: string; combos: ComboMap }) {
  const state = useProject(id);
  if (!state.project) return <ToolGuard state={state} />;
  const combo = combos[comboKey(state.project.item, state.project.country)] ?? null;
  return <InvoiceForm project={state.project} combo={combo} persist={state.persist} />;
}

function InvoiceForm({
  project,
  combo,
  persist,
}: {
  project: Project;
  combo: ComboData | null;
  persist: (p: Project) => Promise<void>;
}) {
  const [draft, setDraft] = useState<InvoiceVars>(() =>
    invoiceVarsFromInputs(project.inputs),
  );
  const [busy, setBusy] = useState<"" | "invoice" | "pl">("");
  const amount = computeAmount(draft.quantity, draft.unitPrice);

  const saveField = (key: keyof InvoiceVars) => {
    const stored = project.inputs[invoiceInputKey(key)] ?? "";
    if (draft[key] === stored) return;
    persist(updateInputs(project, { [invoiceInputKey(key)]: draft[key] }));
  };

  const handleDownload = async (kind: "invoice" | "pl") => {
    setBusy(kind);
    try {
      if (kind === "invoice") {
        await downloadPdf(
          <InvoicePdf vars={draft} />,
          `invoice_${project.item}_${project.country}.pdf`,
        );
      } else {
        await downloadPdf(
          <PackingListPdf vars={draft} />,
          `packing-list_${project.item}_${project.country}.pdf`,
        );
      }
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="mt-4 space-y-6">
      <p className="text-sm text-dim">
        {combo ? `${combo.itemLabel} × ${combo.countryLabel} の` : ""}
        インボイス（送り状）とパッキングリストを、同じ入力から出力します。
        入力はこの案件に保存されます。
      </p>

      <section className="rounded-xl border border-line bg-panel p-4">
        <h2 className="text-sm font-semibold">入力（英数字で入力）</h2>
        <p className="mt-1 text-xs text-dim">
          PDFは英文書類として出力されます。日本語はPDFに表示されないため、各欄は英語・ローマ字で入力してください。
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {INVOICE_FIELDS.map((f) => (
            <FieldInput
              key={f.key}
              label={f.plOnly ? `${f.label}（PL用）` : f.label}
              placeholder={f.placeholder}
              options={f.options}
              value={draft[f.key]}
              onChange={(v) => setDraft({ ...draft, [f.key]: v })}
              onSave={() => saveField(f.key)}
            />
          ))}
        </div>
        <p className="mt-3 text-right text-sm">
          合計金額（自動計算）:{" "}
          <span className="font-semibold text-teal">
            {amount ? `${draft.currency || ""} ${amount}` : "数量と単価を入力すると表示"}
          </span>
        </p>
      </section>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => handleDownload("invoice")}
          disabled={busy !== ""}
          className="rounded-lg bg-teal px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-50"
        >
          {busy === "invoice" ? "生成中…" : "インボイスPDF"}
        </button>
        <button
          onClick={() => handleDownload("pl")}
          disabled={busy !== ""}
          className="rounded-lg border border-teal px-6 py-3 text-sm font-semibold text-teal transition hover:bg-teal/10 disabled:opacity-50"
        >
          {busy === "pl" ? "生成中…" : "パッキングリストPDF"}
        </button>
      </div>
      <p className="text-center text-[11px] text-dim/80">
        記載内容は通関前に乙仲・通関業者の確認を受けてください。
      </p>
    </div>
  );
}
