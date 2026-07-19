"use client";

import Link from "next/link";
import FreshnessBadge from "@/components/FreshnessBadge";
import { comboKey, type ComboMap } from "@/lib/content/combo-types";
import { buildInfoSnapshot, diffInfoSnapshot, type InfoChange } from "@/lib/projects/info";
import { acknowledgeInfo } from "@/lib/projects/logic";
import { useProject } from "@/components/projects/useProject";
import ToolGuard from "@/components/projects/tools/ToolGuard";
import type { ContentMeta } from "@/lib/content/types";

function InfoCard({
  title,
  value,
  meta,
  change,
  className = "",
}: {
  title: string;
  value: string;
  meta: ContentMeta;
  change?: InfoChange;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-line bg-panel p-4 ${change ? "changed-glow" : ""} ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xs font-semibold text-dim">{title}</h2>
        {change && (
          <span className="rounded bg-amber/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber">
            変更あり
          </span>
        )}
      </div>
      <p className="mt-1.5 text-sm leading-relaxed">{value}</p>
      {change && change.saved && (
        <p className="mt-2 rounded bg-background/60 px-2 py-1.5 text-xs text-dim">
          保存時: {change.saved}
        </p>
      )}
      <div className="mt-3">
        <FreshnessBadge meta={meta} />
      </div>
    </section>
  );
}

/** 案件に紐づく地域情報ページ。保存時スナップショットとの差分をハイライトする */
export default function InfoView({ id, combos }: { id: string; combos: ComboMap }) {
  const state = useProject(id);
  const { project, persist } = state;
  if (!project) return <ToolGuard state={state} />;

  const combo = combos[comboKey(project.item, project.country)];
  if (!combo) return <p className="mt-6 text-sm text-red-400">基準ファイルが見つかりません。</p>;

  const country = combo.countryDoc;
  const current = buildInfoSnapshot(country, combo.result);
  const changes = diffInfoSnapshot(project.infoSnapshot, current);
  const changeOf = (key: string) => changes.find((c) => c.key === key);
  const hasBaseline = Object.keys(project.infoSnapshot).length > 0;

  const axes = [
    ["breakdown:institutional", "制度要因の減点項目", combo.axisMeta.institutional],
    ["breakdown:geopolitical", "国情勢要因の減点項目", combo.axisMeta.geopolitical],
    ["breakdown:logistics", "物流経路要因の減点項目", combo.axisMeta.logistics],
  ] as const;

  return (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-dim">
        {combo.itemLabel} × {combo.countryLabel} の地域情報と判定内訳（現在の基準ファイルに基づく表示）。
      </p>

      {changes.length > 0 && (
        <div className="rounded-xl border border-amber/50 bg-panel p-4">
          <p className="text-sm font-semibold text-amber">
            案件保存時から {changes.length} 件の情報が変更されています
          </p>
          <ul className="mt-2 list-disc pl-5 text-xs leading-relaxed text-dim">
            {changes.map((c) => (
              <li key={c.key}>{c.label}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs leading-relaxed text-dim">
            光っているカードが変更箇所です。内容を確認のうえ、下の「確認しました」を
            押すと注意喚起が解除されます（ハードル指数の点数更新は案件ナビの
            「再判定」から行います。無断では差し替えません）。
          </p>
          <button
            onClick={() => persist(acknowledgeInfo(project, current))}
            className="mt-3 rounded-lg border border-amber px-5 py-2 text-xs font-semibold text-amber transition hover:bg-amber/10"
          >
            変更を確認しました（最新の情報を基準にする）
          </button>
        </div>
      )}

      {!hasBaseline && (
        <div className="rounded-xl border border-line bg-panel p-4 text-xs leading-relaxed text-dim">
          この案件には保存時の情報スナップショットがありません（旧バージョンで作成）。
          <button
            onClick={() => persist(acknowledgeInfo(project, current))}
            className="ml-2 text-teal underline"
          >
            現在の情報を基準として記録する
          </button>
        </div>
      )}

      <InfoCard
        title={`輸出ハードル指数（保存時: 難易度${project.hurdle.grade}・${project.hurdle.score}点・${project.hurdle.snapshotAt}時点）`}
        value={current["hurdle:score"]}
        meta={combo.axisMeta.institutional}
        change={changeOf("hurdle:score")}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoCard title="人口" value={country.population} meta={country.meta} change={changeOf("country:population")} />
        <InfoCard title="通貨" value={country.currency} meta={country.meta} change={changeOf("country:currency")} />
        <InfoCard title="言語" value={country.language} meta={country.meta} change={changeOf("country:language")} />
        <InfoCard
          title={`治安（外務省 危険情報レベル: ${country.safetyLevel}）`}
          value={country.safetyNote}
          meta={country.meta}
          change={changeOf("country:safety")}
          className="sm:col-span-2 lg:col-span-3"
        />
        <InfoCard
          title="検疫概要"
          value={country.quarantineSummary}
          meta={country.meta}
          change={changeOf("country:quarantine")}
          className="sm:col-span-2 lg:col-span-2"
        />
        <InfoCard title="EPA・関税" value={country.epaSummary} meta={country.meta} change={changeOf("country:epa")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-1">
        {axes.map(([key, label, meta]) => (
          <InfoCard
            key={key}
            title={label}
            value={current[key] || "（減点項目なし）"}
            meta={meta}
            change={changeOf(key)}
          />
        ))}
      </div>

      <p className="text-center text-[11px] leading-relaxed text-dim/80">
        本表示は運用者が整備した基準ファイルに基づく目安です。
        検疫・制度情報の最終確認は植物防疫所等の公的機関へお願いします。
      </p>

      <p className="text-center">
        <Link href={`/projects/${id}`} className="text-xs text-teal underline">
          ← 案件ナビへ戻る
        </Link>
      </p>
    </div>
  );
}
