"use client";

import { useState } from "react";
import FreshnessBadge from "@/components/FreshnessBadge";
import { comboKey, type ComboMap } from "@/lib/content/combo-types";
import { itemOf, isItemId } from "@/lib/content/catalog";
import type { PortDoc, RouteDoc } from "@/lib/content/loader";
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

/**
 * 港・出荷ルート選定（v1.1: 全候補を実データ付きで併記・酒田港先頭固定）
 * →乙仲リスト→相談メール下書き。
 * 表示順以外で特定の港を有利に見せる加工はしない（数値と出典のみ）。
 */
export default function LogisticsTool({
  id,
  combos,
  ports,
  routes,
}: {
  id: string;
  combos: ComboMap;
  ports: PortDoc[];
  routes: RouteDoc[];
}) {
  const state = useProject(id);
  const { project, persist } = state;
  const [copied, setCopied] = useState(false);
  const [mailDraft, setMailDraft] = useState<Record<string, string> | null>(null);

  const guard = <ToolGuard state={state} />;
  if (!project) return guard;

  const combo = combos[comboKey(project.item, project.country)];
  const selectedPortId = project.inputs[PORT_KEY] ?? "";
  const selectedRoute = routes.find((r) => r.id === selectedPortId) ?? null;
  const selectedPort = ports.find((p) => p.id === selectedPortId) ?? null;

  // 日持ちの短い品目は航空便を海上輸送と並べて表示する（v1.1 3.6）
  const perishability = isItemId(project.item) ? itemOf(project.item).perishability : "中";
  const visibleRoutes =
    perishability === "短" ? routes : routes.filter((r) => r.mode === "sea");

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
    combo && selectedRoute
      ? buildForwarderMail({
          itemLabel: combo.itemLabel,
          countryLabel: combo.countryLabel,
          portLabel: selectedRoute.nameJa,
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

  return (
    <div className="mt-4 space-y-6">
      <p className="text-sm text-dim">
        出荷ルートの候補を一覧で比較し、選ぶと乙仲リストと相談メールの下書きが出ます。
        各項目は公表情報の事実のみを記載しています（データ未整備の港は「情報整備中」）。
        {perishability === "短" &&
          " この品目は日持ちが短いため、航空便も候補に表示しています。"}
      </p>

      {/* ルート選定（全候補併記・表示順固定） */}
      <section className="rounded-xl border border-line bg-panel p-4">
        <h2 className="text-sm font-semibold">出荷ルートを選ぶ</h2>
        <div className="mt-3 space-y-2">
          {visibleRoutes.map((r) => (
            <button
              key={r.id}
              onClick={() => selectPort(r.id)}
              className={`block w-full rounded-lg border px-3 py-2.5 text-left transition ${selectedPortId === r.id ? "border-teal bg-teal/10" : "border-line hover:border-teal/50"}`}
            >
              <span className="flex flex-wrap items-center gap-2">
                <span className={`text-sm font-medium ${selectedPortId === r.id ? "text-teal" : ""}`}>
                  {r.mode === "air" ? "【航空】" : ""}
                  {r.nameJa}
                </span>
                {r.portType && (
                  <span className="rounded bg-background/60 px-1.5 py-0.5 text-[10px] text-dim">
                    {r.portType}
                  </span>
                )}
                {r.pending && (
                  <span className="rounded bg-amber/15 px-1.5 py-0.5 text-[10px] text-amber">
                    取扱実績データ整備中
                  </span>
                )}
                {r.referral && (
                  <span className="rounded bg-teal/15 px-1.5 py-0.5 text-[10px] text-teal">
                    定期航路検索サイトで確認
                  </span>
                )}
                {r.airlineInquiry && (
                  <span className="rounded bg-teal/15 px-1.5 py-0.5 text-[10px] text-teal">
                    各航空会社へ要問合せ
                  </span>
                )}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-dim">
                {r.airlineInquiry ? (
                  <>
                    {r.routeNote}
                    {r.localNote && `／${r.localNote}`}
                  </>
                ) : r.pending ? (
                  <>便数・航路形態・実績は要調査（推測値は表示しません）。{r.localNote}</>
                ) : r.referral ? (
                  <>
                    {r.routeNote}
                    {r.localNote && `／${r.localNote}`}
                  </>
                ) : (
                  <>
                    {r.routeNote}／便数: {r.serviceFrequency}
                    {r.frequencyAsOf && `（${r.frequencyAsOf}時点）`}
                    ／リードタイム: {r.leadTime}
                    {r.localNote && `／${r.localNote}`}
                  </>
                )}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 選択ルートの詳細（実データのある港のみ・数値と出典のみ） */}
      {selectedRoute && !selectedRoute.pending && !selectedRoute.referral && selectedRoute.cargoRecord && (
        <section className="rise rounded-xl border border-line bg-panel p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold">{selectedRoute.nameJa}の取扱実績（公的統計）</h2>
            <FreshnessBadge meta={selectedRoute.meta} />
          </div>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-xs leading-relaxed text-dim">
            {selectedRoute.cargoRecord}
          </pre>
          {selectedRoute.portalUrl && (
            <p className="mt-3 text-xs leading-relaxed text-dim">
              なお、最新の定期コンテナ航路情報は{" "}
              <a
                href={selectedRoute.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal underline"
              >
                {selectedRoute.portalLabel ?? "運航元の公式サイト"}
              </a>
              {" "}にてご確認ください。
            </p>
          )}
        </section>
      )}

      {/* サイト活用の港（航路・便数が多く個別掲載しきれない港は一次サイトへ誘導） */}
      {selectedRoute && selectedRoute.referral && (
        <section className="rise rounded-xl border border-teal/40 bg-panel p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold">{selectedRoute.nameJa}の定期航路を調べる</h2>
            <FreshnessBadge meta={selectedRoute.meta} />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-dim">
            {selectedRoute.nameJa}は航路・便数が非常に多く、本サイトで個別便を網羅
            できません。推測値を並べる代わりに、公式の定期航路検索／入出港予定サイトで
            最新情報をご確認ください。
          </p>
          {selectedRoute.portalUrl && (
            <a
              href={selectedRoute.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
            >
              {selectedRoute.portalLabel ?? "定期航路情報サイトを開く"} →
            </a>
          )}
        </section>
      )}

      {/* 航空便（各航空会社へ問い合わせの案内。便・料金は変動が大きく巡回になじまない） */}
      {selectedRoute && selectedRoute.airlineInquiry && (
        <section className="rise rounded-xl border border-teal/40 bg-panel p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold">{selectedRoute.nameJa}からの航空便について</h2>
            <FreshnessBadge meta={selectedRoute.meta} />
          </div>
          <p className="mt-2 text-sm leading-relaxed text-dim">
            エア便（国際航空貨物）をご利用の場合は、各空港で国際貨物便の取扱いのある
            各航空会社へお問い合わせください。便・スペース・料金は航空会社および混載業者
            （フォワーダー）により異なり、頻繁に変動するため、本サイトでは個別便を
            掲載していません。
          </p>
        </section>
      )}

      {/* 乙仲リスト */}
      {selectedRoute && selectedPort && (
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
          <p className="mt-3 text-[11px] leading-relaxed text-dim/80">
            以下は公表情報に基づく一覧（五十音順）であり、特定業者の推奨を意味しません。
            最新の通関業者は税関「通関業者一覧」・日本通関業連合会の検索システムでも確認できます。
          </p>
        </section>
      )}

      {/* 乙仲リスト未整備の港・空港 */}
      {selectedRoute && !selectedPort && (
        <section className="rise rounded-xl border border-line bg-panel p-4">
          <h2 className="text-sm font-semibold">{selectedRoute.nameJa}の乙仲（通関・海貨業者）</h2>
          <p className="mt-2 text-xs leading-relaxed text-dim">
            通関業者（乙仲）の個別掲載は行っていません。特定業者の推奨を避けるため、
            通関業者は次の公的・業界の公表情報からお探しください。
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <a
                href="https://www.customs.go.jp/tsukangyousha/index.htm"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal underline"
              >
                税関「通関業者一覧」
              </a>
            </li>
            <li>
              <a
                href="https://search.tsukangyo.or.jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal underline"
              >
                日本通関業連合会 通関業者検索システム
              </a>
            </li>
          </ul>
        </section>
      )}

      {/* メール下書き */}
      {selectedRoute && (
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
