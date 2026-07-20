"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DotGlobe, { type FlyTarget } from "@/components/globe/DotGlobe";
import {
  BEEF_ITEM,
  COUNTRIES,
  OTHER_ITEM,
  VISIBLE_COUNTRIES,
  VISIBLE_ITEMS,
} from "@/lib/content/catalog";

export default function Home() {
  const router = useRouter();
  const [item, setItem] = useState("");
  const [country, setCountry] = useState("");
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null);

  const isOther = item === OTHER_ITEM.id;
  const isBeef = item === BEEF_ITEM.id;
  const canSearch = item !== "" && !isOther && !isBeef && country !== "" && !flyTarget;

  const handleSearch = () => {
    if (!canSearch) return;
    const c = COUNTRIES.find((c) => c.id === country)!;
    setFlyTarget({ lat: c.lat, lng: c.lng });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <p className="text-sm tracking-widest text-dim">
          <span className="font-semibold text-foreground">Toika</span>
          <span className="mx-2">|</span>農産物輸出ナビ
        </p>
        <div className="flex items-center gap-4">
          <Link href="/projects" className="text-xs text-teal underline">
            保存した案件
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-wide sm:text-4xl">
            調べる数ヶ月を、確かめる数分に。
          </h1>
          <p className="mt-3 text-sm text-dim sm:text-base">
            その一箱を、世界の食卓へ
          </p>
        </div>

        <div className="relative h-[52vmin] w-[52vmin] min-h-64 min-w-64">
          <DotGlobe
            flyTarget={flyTarget}
            onDone={() => router.push(`/result?item=${item}&country=${country}`)}
          />
        </div>

        <div
          className="flex w-full max-w-2xl flex-col items-center gap-4"
          style={{
            opacity: flyTarget ? 0 : 1,
            transition: "opacity 400ms ease-out",
          }}
        >
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <select
              value={item}
              onChange={(e) => setItem(e.target.value)}
              className="flex-1 rounded-lg border border-line bg-panel px-4 py-3 text-sm focus:border-teal focus:outline-none"
              aria-label="品目を選択"
            >
              <option value="">品目を選択</option>
              {VISIBLE_ITEMS.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.label}
                </option>
              ))}
              <option value={OTHER_ITEM.id}>{OTHER_ITEM.label}</option>
            </select>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="flex-1 rounded-lg border border-line bg-panel px-4 py-3 text-sm focus:border-teal focus:outline-none"
              aria-label="輸出先の国・地域を選択"
            >
              <option value="">輸出先の国・地域を選択</option>
              {VISIBLE_COUNTRIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleSearch}
              disabled={!canSearch}
              className="rounded-lg bg-teal px-6 py-3 text-sm font-semibold text-background transition disabled:opacity-30 sm:whitespace-nowrap"
            >
              調べる
            </button>
          </div>

          {isBeef && (
            <div className="rise w-full rounded-lg border border-amber/40 bg-panel p-4 text-sm leading-relaxed text-dim">
              {BEEF_ITEM.message}
            </div>
          )}
          {isOther && (
            <div className="rise w-full rounded-lg border border-line bg-panel p-4 text-sm leading-relaxed text-dim">
              その他の品目は個別にご相談を承ります。現在は米・りんご・ラ・フランスを
              中心にご案内しています。他の品目・輸出先の追加や、貴自治体・貴社の
              特産品を盛り込んだ再設計のご相談は、下記の相談窓口からお寄せください。
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-line px-6 py-5 text-center">
        <p className="mx-auto max-w-2xl text-xs leading-relaxed text-dim">
          現在は山形県産の米・りんご・ラ・フランス × 台湾・香港・米国を中心に
          ご案内しています。他の品目・輸出先（山形県産の主要8品目・10の国・地域まで
          整備済み）の追加や、貴自治体・貴社の特産品を盛り込んだ再設計のご相談を承ります。
          <a href="mailto:info@toika.jp" className="ml-2 text-teal underline">
            ご相談はこちら
          </a>
        </p>
        <p className="mt-2 text-[11px] text-dim/70">
          検疫・制度情報の最終確認は植物防疫所等の公的機関へお願いします。
        </p>
      </footer>
    </div>
  );
}
