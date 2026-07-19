import Link from "next/link";
import { redirect } from "next/navigation";
import FreshnessBadge from "@/components/FreshnessBadge";
import HurdleCard from "@/components/result/HurdleCard";
import SaveCta from "@/components/result/SaveCta";
import {
  countryNotice,
  countryOf,
  isCountryId,
  isItemId,
  itemLabel,
} from "@/lib/content/catalog";
import { comboPrepared, loadCriteriaSet, loadExportRecord, loadRetailPrice } from "@/lib/content/loader";
import { buildInfoSnapshot } from "@/lib/projects/info";
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

  // v1.1: mdが未整備の組み合わせは採点せず「情報整備中」を明示する
  // （空欄や推測値を表示しない。実績がないことは輸出不可を意味しない）
  if (!comboPrepared(item, countryId)) {
    const notice = countryNotice(countryId);
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
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 pb-16">
          <p className="text-sm text-dim">
            {itemLabel(item)} × {countryOf(countryId).label}
          </p>
          <h1 className="mt-2 text-2xl font-bold">この組み合わせは情報整備中です</h1>
          <div className="rise mt-6 w-full rounded-xl border border-line bg-panel p-5 text-sm leading-relaxed text-dim">
            <p>
              検疫条件・手続きの確認が済んでいないため、ハードル指数を表示していません。
              未確認の情報を推測で表示しない方針のためです。
            </p>
            <p className="mt-3">
              <span className="font-semibold text-foreground">
                情報が無いことは、輸出できないことを意味しません。
              </span>
              整備のご要望があればお気軽にお知らせください — 優先して整備します
              （2〜3日を目安）。お急ぎの場合は植物防疫所・JETROへ直接ご相談ください。
            </p>
          </div>
          {notice && (
            <div className="rise mt-4 w-full rounded-xl border border-amber/40 bg-panel p-5 text-sm leading-relaxed">
              <p className="font-semibold text-amber">この地域についての注意</p>
              <p className="mt-2 text-dim">{notice}</p>
            </div>
          )}
          <Link
            href="/"
            className="mt-8 rounded-lg border border-teal px-6 py-2.5 text-sm font-semibold text-teal hover:bg-teal/10"
          >
            トップへ戻る
          </Link>
        </main>
      </div>
    );
  }

  const set = loadCriteriaSet(item, countryId);
  const result = computeHurdle(set);
  const country = set.country;
  const countryLabel = countryOf(countryId).label;
  // 県統計の実績は参考表示のみ（可否判定・点数には一切使用しない）
  const record = loadExportRecord(item, countryId);
  // 海外現地の小売相場（参考表示・年1回見直し。日々変動するため時点を明記）
  const price = loadRetailPrice(item, countryId);

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
        <div className="flex items-center gap-4">
          <Link href="/projects" className="text-xs text-teal underline">
            保存した案件
          </Link>
          <Link href="/" className="text-xs text-teal underline">
            条件を変えて調べ直す
          </Link>
        </div>
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

        {countryNotice(countryId) && (
          <div
            className="rise mt-4 rounded-xl border border-amber/40 bg-panel p-4 text-sm leading-relaxed"
            style={{ animationDelay: `${nextDelay()}ms` }}
          >
            <p className="font-semibold text-amber">この地域についての注意</p>
            <p className="mt-1.5 text-dim">{countryNotice(countryId)}</p>
          </div>
        )}

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

        {/* 実績は「前例」の参考情報。可否判定・点数には使用しない（v1.1 絶対原則） */}
        <div className="mt-4">
          <Card
            title="県内輸出実績（山形県統計・参考情報）"
            meta={record.meta}
            delay={nextDelay()}
          >
            {record.note ? (
              <>
                {record.note}。
                <span className="text-xs text-dim">
                  ※実績は前例の参考情報であり、可否判定・ハードル指数には使用していません。
                </span>
              </>
            ) : (
              <>
                この組み合わせの県内実績データはありません。
                <span className="text-xs text-dim">
                  ※実績がないことは輸出不可を意味しません（可否は検疫条件に基づきます）。
                </span>
              </>
            )}
          </Card>
        </div>

        <div className="mt-4">
          <Card
            title={`海外現地の小売相場（参考${price?.asOf ? `・${price.asOf}` : ""}）`}
            meta={price ? price.meta : record.meta}
            delay={nextDelay()}
          >
            {price ? (
              price.japanOnly ? (
                <>
                  {price.body || "現地に同種品の一般的な流通がなく、比較対象の小売相場は設定していません。日本産プレミアム品としての価格はバイヤーとご相談ください。"}
                  <span className="mt-2 block text-xs text-dim">
                    ※本サイトの相場は年1回の見直しです。
                  </span>
                </>
              ) : (
                <>
                  {price.body}
                  <span className="mt-2 block text-xs text-dim">
                    ※上記は参考傾向です。相場は日々変動するため、今日現在の価格はご自身でお調べください。本サイトの相場は年1回の見直しです。
                  </span>
                </>
              )
            ) : (
              <>
                この組み合わせの現地小売相場は情報整備中です。
                <span className="mt-2 block text-xs text-dim">
                  ※相場は日々変動します。最新の価格はJETRO・現地バイヤー等でご確認ください。
                </span>
              </>
            )}
          </Card>
        </div>

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

        {result.status === "scored" && (
          <div
            className="rise mt-8"
            style={{ animationDelay: `${nextDelay()}ms` }}
          >
            <SaveCta
              item={item}
              country={countryId}
              score={result.score}
              grade={result.grade}
              infoSnapshot={buildInfoSnapshot(country, result)}
            />
          </div>
        )}

        <p
          className="rise mt-6 text-center text-[11px] leading-relaxed text-dim/80"
          style={{ animationDelay: `${nextDelay()}ms` }}
        >
          本結果は運用者が整備した基準ファイルに基づく目安であり、AIによる断定ではありません。
          <br />
          検疫・制度情報の最終確認は植物防疫所等の公的機関へお願いします。
        </p>
      </main>
    </div>
  );
}
