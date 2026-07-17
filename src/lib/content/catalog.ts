/**
 * 対象スコープ（山形3品目×3カ国）。
 * 判断基準そのものではなく「プルダウンに何を出すか」というUIスコープ定義。
 * 採点基準・手順は content/ 配下のmdが単一情報源。
 */
export const ITEMS = [
  { id: "rice", label: "米" },
  { id: "apple", label: "りんご" },
  { id: "la-france", label: "ラ・フランス" },
] as const;

export const OTHER_ITEM = {
  id: "other",
  label: "その他の品目（対応のご相談）",
} as const;

export const COUNTRIES = [
  { id: "taiwan", label: "台湾", lat: 23.7, lng: 121.0 },
  { id: "hongkong", label: "香港", lat: 22.3, lng: 114.2 },
  { id: "usa", label: "米国", lat: 39.8, lng: -98.6 },
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

export function countryOf(id: CountryId) {
  return COUNTRIES.find((c) => c.id === id)!;
}
