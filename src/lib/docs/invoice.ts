/**
 * インボイス／パッキングリストの入力項目定義。
 * フォーム入力→PDF出力方式（両書類でフォームを共有する）。
 */

export interface InvoiceVars {
  invoiceNo: string;
  invoiceDate: string;
  exporterName: string;
  exporterAddress: string;
  consigneeName: string;
  consigneeAddress: string;
  portLoading: string;
  portDischarge: string;
  vessel: string;
  incoterms: string;
  currency: string;
  itemDesc: string;
  quantity: string;
  unitPrice: string;
  netWeight: string;
  grossWeight: string;
  marks: string;
}

export const INVOICE_FIELDS: {
  key: keyof InvoiceVars;
  label: string;
  placeholder: string;
  options?: string[];
  /** パッキングリストのみで使う項目 */
  plOnly?: boolean;
}[] = [
  { key: "invoiceNo", label: "インボイス番号", placeholder: "INV-2026-001" },
  { key: "invoiceDate", label: "発行日", placeholder: "17 July 2026" },
  { key: "exporterName", label: "輸出者名", placeholder: "Yamada Farm Co., Ltd." },
  { key: "exporterAddress", label: "輸出者住所", placeholder: "1-2-3 Sakura, Yamagata, Japan" },
  { key: "consigneeName", label: "荷受人（バイヤー）", placeholder: "Taipei Fruits Trading Ltd." },
  { key: "consigneeAddress", label: "荷受人住所", placeholder: "No.100, Sec.1, Taipei, Taiwan" },
  { key: "portLoading", label: "積出港", placeholder: "Port of Sakata, Japan" },
  { key: "portDischarge", label: "仕向港", placeholder: "Port of Kaohsiung, Taiwan" },
  { key: "vessel", label: "本船名（分かれば）", placeholder: "TBD" },
  { key: "incoterms", label: "インコタームズ", placeholder: "FOB", options: ["FOB", "CIF", "CFR", "EXW"] },
  { key: "currency", label: "通貨", placeholder: "USD", options: ["USD", "JPY", "TWD", "HKD"] },
  { key: "itemDesc", label: "品名（英語）", placeholder: "Fresh Japanese Apples (Fuji)" },
  { key: "quantity", label: "数量（カートン数）", placeholder: "500" },
  { key: "unitPrice", label: "単価", placeholder: "25.00" },
  { key: "netWeight", label: "純重量 kg", placeholder: "5000", plOnly: true },
  { key: "grossWeight", label: "総重量 kg", placeholder: "5500", plOnly: true },
  { key: "marks", label: "荷印（Marks & Nos.）", placeholder: "TFT / TAIPEI / C/No.1-500", plOnly: true },
];

export const invoiceInputKey = (key: keyof InvoiceVars) => `doc:invoice:${key}`;

export function invoiceVarsFromInputs(inputs: Record<string, string>): InvoiceVars {
  const out = {} as InvoiceVars;
  for (const f of INVOICE_FIELDS) {
    out[f.key] = inputs[invoiceInputKey(f.key)] ?? "";
  }
  return out;
}

/** 数量×単価が両方数値なら合計を計算（決定論的。それ以外は空文字） */
export function computeAmount(quantity: string, unitPrice: string): string {
  const q = Number(quantity.replaceAll(",", ""));
  const p = Number(unitPrice.replaceAll(",", ""));
  if (!Number.isFinite(q) || !Number.isFinite(p) || quantity.trim() === "" || unitPrice.trim() === "") {
    return "";
  }
  return (q * p).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
