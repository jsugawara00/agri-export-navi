"use client";

import { useState } from "react";
import FreshnessBadge from "@/components/FreshnessBadge";
import { comboKey, type ComboMap } from "@/lib/content/combo-types";
import type { PortDoc } from "@/lib/content/loader";
import { buildForwarderMail } from "@/lib/docs/mail";
import { updateInputs } from "@/lib/projects/logic";
import { useProject } from "@/components/projects/useProject";
import ToolGuard from "./ToolGuard";
import FieldInput from "./FieldInput";

const PORT_KEY = "doc:logistics:port";
const MAIL_KEYS = {
  quantity: "doc:mail:quantity",
  timing: "doc:mail:timing",
  senderName: "doc:mail:senderName",
  contact: "doc:mail:contact",
} as const;

/** 港選定（最寄り港＋東京港の2択方式）→乙仲リスト→相談メール下書き */
export default function LogisticsTool({
  id,
  combos,
  ports,
}: {
  id: string;
  combos: ComboMap;
  ports: PortDoc[];
}) {
  const state = useProject(id);
  const { project, persist } = state;
  const [copied, setCopied] = useState(false);
  const [mailDraft, setMailDraft] = useState<Record<string, string> | null>(null);

  const guard = <ToolGuard state={state} />;
  if (!project) return guard;

  const combo = combos[comboKey(project.item, project.country)];
  const selectedPortId = project.inputs[PORT_KEY] ?? "";
  const selectedPort = ports.find((p) => p.id === selectedPortId) ?? null;

  const mailVals =
    mailDraft ??
    Object.fromEntries(
      Object.entries(MAIL_KEYS).map(([k, key]) => [k, project.inputs[key] ?? ""]),
    );

  const selectPort = (portId: string) => {
    persist(updateInputs(project, { [PORT_KEY]: portId }));
  };

  const saveMailField = (k: keyof typeof MAIL_KEYS) => {
    const stored = project.inputs[MAIL_KEYS[k]] ?? "";
    if (mailVals[k] === stored) return;
    persist(updateInputs(project, { [MAIL_KEYS[k]]: mailVals[k] }));
  };

  const mail =
    combo && selectedPort
      ? buildForwarderMail({
          itemLabel: combo.itemLabel,
          countryLabel: combo.countryLabel,
          portLabel: selectedPort.nameJa,
          quantity: mailVals.quantity,
          timing: mailVals.timing,
          senderName: mailVals.senderName,
          contact: mailVals.contact,
        })
      : null;

  const copyMail = async () => {
    if (!mail) return;
    await navigator.clipboard.writeText(`件名: ${mail.subject}\n\n${mail.body}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const nearestPorts = ports.filter((p) => p.nearest);
  const tokyoPorts = ports.filter((p) => !p.nearest);

  return (
    <div className="mt-4 space-y-6">
      <p className="text-sm text-dim">
        最寄り港と東京港の2択方式で比較し、港を選ぶと乙仲リストと相談メールの下書きが出ます。
      </p>

      {/* 港選定 */}
      <section className="rounded-xl border border-line bg-panel p-4">
        <h2 className="text-sm font-semibold">港を選ぶ</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-dim">最寄り港（山形から）</p>
            <div className="mt-2 space-y-2">
              {nearestPorts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => selectPort(p.id)}
                  className={`block w-full rounded-lg border px-3 py-2 text-left text-sm transition ${selectedPortId === p.id ? "border-teal bg-teal/10 text-teal" : "border-line hover:border-teal/50"}`}
                >
                  {p.nameJa}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-dim">航路・便数で選ぶなら</p>
            <div className="mt-2 space-y-2">
              {tokyoPorts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => selectPort(p.id)}
                  className={`block w-full rounded-lg border px-3 py-2 text-left text-sm transition ${selectedPortId === p.id ? "border-teal bg-teal/10 text-teal" : "border-line hover:border-teal/50"}`}
                >
                  {p.nameJa}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 乙仲リスト */}
      {selectedPort && (
        <section className="rise rounded-xl border border-line bg-panel p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold">{selectedPort.nameJa}の乙仲（通関・海貨業者）</h2>
            <FreshnessBadge meta={selectedPort.meta} />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-dim">{selectedPort.overview}</p>
          <ul className="mt-3 space-y-2">
            {selectedPort.forwarders.map((f) => (
              <li key={f.id} className="rounded-lg border border-line bg-background/60 p-3">
                <p className="text-sm font-medium">{f.name}</p>
                <p className="mt-0.5 text-xs text-dim">{f.note}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* メール下書き */}
      {selectedPort && (
        <section className="rise rounded-xl border border-line bg-panel p-4">
          <h2 className="text-sm font-semibold">相談メール下書き</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <FieldInput
              label="数量（予定）"
              placeholder="例: りんご 500ケース（約5トン）"
              value={mailVals.quantity}
              onChange={(v) => setMailDraft({ ...mailVals, quantity: v })}
              onSave={() => saveMailField("quantity")}
            />
            <FieldInput
              label="希望時期"
              placeholder="例: 2026年11月中の船積み"
              value={mailVals.timing}
              onChange={(v) => setMailDraft({ ...mailVals, timing: v })}
              onSave={() => saveMailField("timing")}
            />
            <FieldInput
              label="お名前・屋号"
              placeholder="例: 山田農園 山田太郎"
              value={mailVals.senderName}
              onChange={(v) => setMailDraft({ ...mailVals, senderName: v })}
              onSave={() => saveMailField("senderName")}
            />
            <FieldInput
              label="連絡先"
              placeholder="例: 090-XXXX-XXXX / mail@example.com"
              value={mailVals.contact}
              onChange={(v) => setMailDraft({ ...mailVals, contact: v })}
              onSave={() => saveMailField("contact")}
            />
          </div>
          {mail && (
            <>
              <div className="mt-4 rounded-lg bg-background/60 p-3">
                <p className="text-xs text-dim">件名</p>
                <p className="text-sm">{mail.subject}</p>
                <p className="mt-3 text-xs text-dim">本文</p>
                <pre className="mt-1 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {mail.body}
                </pre>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={copyMail}
                  className="rounded-lg bg-teal px-6 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
                >
                  {copied ? "コピーしました ✓" : "件名と本文をコピー"}
                </button>
                <p className="text-[11px] leading-relaxed text-dim/80">
                  送信機能はありません。内容をご自身で確認・補正のうえ、
                  ご自身のメールからお送りください（層2: 実行はあなた）。
                </p>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
