import type { ContentMeta } from "@/lib/content/types";

const STYLE: Record<string, string> = {
  A: "border-teal/50 text-teal",
  B: "border-amber/50 text-amber",
  C: "border-dim/50 text-dim",
};

const LABEL: Record<string, string> = {
  A: "区分A 自動取得",
  B: "区分B 人間確認済",
  C: "区分C 静的整備",
};

/** 全情報カードに付ける鮮度バッジ（区分＋取得日＋情報源） */
export default function FreshnessBadge({ meta }: { meta: ContentMeta }) {
  return (
    <span
      className={`inline-flex max-w-full flex-wrap items-center gap-x-2 rounded border px-2 py-0.5 text-[10px] leading-relaxed ${STYLE[meta.freshness]}`}
      title={`情報源: ${meta.source}（${meta.retrievedAt}時点）`}
    >
      <span className="font-semibold">{LABEL[meta.freshness]}</span>
      <span>{meta.retrievedAt}時点</span>
      <span className="truncate opacity-80">{meta.source}</span>
    </span>
  );
}
