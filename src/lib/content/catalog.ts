/**
 * 対象スコープ（v1.1: 8品目×10仕向地）。
 * 判断基準そのものではなく「プルダウンに何を出すか」というUIスコープ定義。
 * 採点基準・手順は content/ 配下のmdが単一情報源。
 * mdが未整備の組み合わせは検索結果で「情報整備中」と表示される
 * （combos.ts が準備済みコンボのみを組み立てる）。
 */

/** 日持ち区分（短＝航空便が実務上の選択肢になる） */
export type Perishability = "短" | "中" | "長";

export const ITEMS = [
  { id: "rice", label: "米", perishability: "長" },
  { id: "apple", label: "りんご", perishability: "中" },
  { id: "la-france", label: "ラ・フランス", perishability: "中" },
  { id: "peach", label: "もも", perishability: "短" },
  { id: "persimmon", label: "柿", perishability: "中" },
  { id: "grape", label: "ぶどう", perishability: "短" },
  { id: "melon", label: "メロン", perishability: "中" },
  { id: "cherry", label: "さくらんぼ", perishability: "短" },
] as const;

export const OTHER_ITEM = {
  id: "other",
  label: "その他の品目（対応のご相談）",
} as const;

/**
 * 牛肉は動物検疫所の所管で植物検疫と制度体系が別のため未対応
 * （docs/backlog.md 参照）。プルダウンには表示し、選択時は専用メッセージを出す。
 */
export const BEEF_ITEM = {
  id: "beef",
  label: "牛肉（動物検疫対象・準備中）",
  message:
    "牛肉・食肉類は動物検疫所の所管となり、植物検疫とは手続体系が異なります。" +
    "本サイトでは現在対応準備中です。動物検疫所または農林水産省の輸出支援窓口にご相談ください。",
} as const;

export const COUNTRIES = [
  { id: "taiwan", label: "台湾", lat: 23.7, lng: 121.0 },
  { id: "hongkong", label: "香港", lat: 22.3, lng: 114.2 },
  { id: "usa", label: "米国", lat: 39.8, lng: -98.6 },
  { id: "singapore", label: "シンガポール", lat: 1.35, lng: 103.8 },
  { id: "canada", label: "カナダ", lat: 56.1, lng: -106.3 },
  { id: "eu", label: "欧州（EU）", lat: 50.1, lng: 9.2 },
  { id: "malaysia", label: "マレーシア", lat: 4.2, lng: 102.0 },
  { id: "thailand", label: "タイ", lat: 15.9, lng: 101.0 },
  { id: "australia", label: "オーストラリア", lat: -25.3, lng: 133.8 },
  {
    id: "china",
    label: "中国",
    lat: 35.0,
    lng: 105.0,
    notice:
      "中国は日本産食品に対する輸入規制が短期間で変更された経緯がある地域です。" +
      "最新の規制状況を必ず植物防疫所・税関等の公的機関でご確認ください。",
  },
] as const;

export type ItemId = (typeof ITEMS)[number]["id"];
export type CountryId = (typeof COUNTRIES)[number]["id"];

export function isItemId(v: string): v is ItemId {
  return ITEMS.some((i) => i.id === v);
}

export function isCountryId(v: string): v is CountryId {
  return COUNTRIES.some((c) => c.id === v);
}

export function itemLabel(id: ItemId): string {
  return ITEMS.find((i) => i.id === id)!.label;
}

export function itemOf(id: ItemId) {
  return ITEMS.find((i) => i.id === id)!;
}

export function countryOf(id: CountryId) {
  return COUNTRIES.find((c) => c.id === id)!;
}

/** 国・地域の注意書き（中国の情勢変動など。無ければundefined） */
export function countryNotice(id: CountryId): string | undefined {
  const c = COUNTRIES.find((c) => c.id === id);
  return c && "notice" in c ? (c.notice as string) : undefined;
}
