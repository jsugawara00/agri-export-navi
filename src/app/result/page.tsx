import Link from "next/link";
import { redirect } from "next/navigation";
import FreshnessBadge from "@/components/FreshnessBadge";
import HurdleCard from "@/components/result/HurdleCard";
import NavCta from "@/components/result/NavCta";
import {
  countryOf,
  isCountryId,
  isItemId,
  itemLabel,
} from "@/lib/content/catalog";
import { loadCriteriaSet } from "@/lib/content/loader";
import { computeHurdle } from "@/lib/score/engine";
import type { ContentMeta } from "@/lib/content/types";

function Card({
  title,
  children,
  meta,
  delay,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  meta: ContentMeta;
  delay: number;
  className?: string;
}) {
  return (
    <section
      className={`rise rounded-xl border border-line bg-panel p-4 ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <h2 className="text-xs font-semibold text-dim">{title}</h2>
      <div className="mt-1.5 text-sm leading-relaxed">{children}</div>
      <div className="mt-3">
        <FreshnessBadge meta={meta} />
      </div>
    </section>
  );
}

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<{ item?: string; country?: string }>;
}) {
  const params = await searchParams;
  const item = params.item ?? "";
  const countryId = params.country ?? "";
  if (!isItemId(item) || !isCountryId(countryId)) {
    redirect("/");
  }

  const set = loadCriteriaSet(item, countryId);
  const result = computeHurdle(set);
  const country = set.country;
  const countryLabel = countryOf(countryId).label;

  // riseIn 500ms を60ms段差で順次出現させる
  let delayIndex = 0;
  const nextDelay = () => 60 * delayIndex++;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm tracking-widest text-dim hover:text-foreground">
          <span className="font-semibold text-foreground">Toika</span>
          <span className="mx-2">|</span>農産物輸出ナビ
        </Link>
        <Link href="/" className="text-xs text-teal underline">
          条件を変えて調べ直す
        </Link>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 pb-12">
        <p
          className="rise text-xs text-dim"
          style={{ animationDelay: `${nextDelay()}ms` }}
        >
          検索結果
        </p>
        <h1
          className="rise mt-1 text-2xl font-bold sm:text-3xl"
          style={{ animationDelay: `${nextDelay()}ms` }}
        >
          {itemLabel(item)} × {countryLabel}
        </h1>

        {/* 可否は事実、点数は難易度。禁止品目は点数を出さない */}
        <div className="rise mt-5" style={{ animationDelay: `${nextDelay()}ms` }}>
          {result.status === "prohibited" ? (
            <section className="rounded-xl border border-red-400/40 bg-panel p-5">
              <h2 className="text-2xl font-bold text-red-400">輸出不可</h2>
              <p className="mt-2 text-sm leading-relaxed">{result.reason}</p>
              <div className="mt-3">
                <FreshnessBadge meta={set.institutional.meta} />
              </div>
            </section>
          ) : (
            <HurdleCard
              score={result.score}
              grade={result.grade}
              summary={result.summary}
              breakdown={result.breakdown}
              axisMeta={{
                institutional: set.institutional.meta,
                geopolitical: set.geopolitical.meta,
                logistics: set.logistics.meta,
              }}
            />
          )}
        </div>

        {result.status === "scored" && set.institutional.overview && (
          <div className="mt-4">
            <Card
              title="この組み合わせの概要"
              meta={set.institutional.meta}
              delay={nextDelay()}
            >
              {set.institutional.overview}
            </Card>
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card title="人口" meta={country.meta} delay={nextDelay()}>
            {country.population}
          </Card>
          <Card title="通貨" meta={country.meta} delay={nextDelay()}>
            {country.currency}
          </Card>
          <Card title="言語" meta={country.meta} delay={nextDelay()}>
            {country.language}
          </Card>
          <Card
            title={`治安（外務省 危険情報レベル: ${country.safetyLevel}）`}
            meta={country.meta}
            delay={nextDelay()}
            className="sm:col-span-2 lg:col-span-3"
          >
            {country.safetyNote}
          </Card>
          <Card
            title="検疫概要"
            meta={country.meta}
            delay={nextDelay()}
            className="sm:col-span-2 lg:col-span-2"
          >
            {country.quarantineSummary}
          </Card>
          <Card title="EPA・関税" meta={country.meta} delay={nextDelay()}>
            {country.epaSummary}
          </Card>
        </div>

        <div
          className="rise mt-8"
          style={{ animationDelay: `${nextDelay()}ms` }}
        >
          <NavCta />
        </div>

        <p
          className="rise mt-6 text-center text-[11px] leading-relaxed text-dim/80"
          style={{ animationDelay: `${nextDelay()}ms` }}
        >
          本結果はデモ用に整備した基準ファイルに基づく目安であり、AIによる断定ではありません。
          <br />
          検疫・制度情報の最終確認は植物防疫所等の公的機関へお願いします。
        </p>
      </main>
    </div>
  );
}
