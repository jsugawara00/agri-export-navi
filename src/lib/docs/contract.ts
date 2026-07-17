/**
 * 英文輸出契約書ひな形のテンプレート定義。
 * UIプレビュー（変数ハイライト）とPDF出力の両方がこの定義を描画する。
 * ※ 一般的なひな形であり法的助言ではない（出力物にも明記する）。
 */

export interface ContractVars {
  sellerName: string;
  sellerAddress: string;
  buyerName: string;
  buyerAddress: string;
  productDesc: string;
  quantity: string;
  unitPrice: string;
  currency: string;
  totalAmount: string;
  incoterms: string;
  portLoading: string;
  portDischarge: string;
  shipmentDate: string;
  paymentTerms: string;
}

export const CONTRACT_FIELDS: {
  key: keyof ContractVars;
  label: string;
  placeholder: string;
  options?: string[];
}[] = [
  { key: "sellerName", label: "売主（あなた）", placeholder: "Yamada Farm Co., Ltd." },
  { key: "sellerAddress", label: "売主住所", placeholder: "1-2-3 Sakura, Yamagata, Japan" },
  { key: "buyerName", label: "買主（バイヤー）", placeholder: "Taipei Fruits Trading Ltd." },
  { key: "buyerAddress", label: "買主住所", placeholder: "No.100, Sec.1, Taipei, Taiwan" },
  { key: "productDesc", label: "品名（英語）", placeholder: "Fresh Japanese Apples (Fuji), Yamagata origin" },
  { key: "quantity", label: "数量", placeholder: "500 cartons (approx. 5,000 kg)" },
  { key: "unitPrice", label: "単価", placeholder: "25.00 per carton" },
  { key: "currency", label: "通貨", placeholder: "USD", options: ["USD", "JPY", "TWD", "HKD"] },
  { key: "totalAmount", label: "合計金額", placeholder: "12,500.00" },
  {
    key: "incoterms",
    label: "インコタームズ",
    placeholder: "FOB",
    options: ["FOB", "CIF", "CFR", "EXW"],
  },
  { key: "portLoading", label: "積出港", placeholder: "Port of Sakata, Japan" },
  { key: "portDischarge", label: "仕向港", placeholder: "Port of Kaohsiung, Taiwan" },
  { key: "shipmentDate", label: "船積期限", placeholder: "On or before 30 November 2026" },
  {
    key: "paymentTerms",
    label: "支払条件",
    placeholder: "T/T advance",
    options: [
      "100% T/T in advance",
      "Irrevocable L/C at sight",
      "30% T/T advance, 70% before shipment",
    ],
  },
];

/** テンプレート本文の断片: 固定文字列 or 変数参照 */
export type Segment = string | { var: keyof ContractVars };

export interface Clause {
  title: string;
  segments: Segment[];
}

export function contractClauses(): Clause[] {
  const v = (key: keyof ContractVars): Segment => ({ var: key });
  return [
    {
      title: "PARTIES",
      segments: [
        "This Sales Agreement (the “Agreement”) is made between ",
        v("sellerName"),
        ", having its principal place of business at ",
        v("sellerAddress"),
        " (the “Seller”), and ",
        v("buyerName"),
        ", having its principal place of business at ",
        v("buyerAddress"),
        " (the “Buyer”).",
      ],
    },
    {
      title: "1. PRODUCT AND QUANTITY",
      segments: [
        "The Seller agrees to sell and the Buyer agrees to purchase: ",
        v("productDesc"),
        ", in the quantity of ",
        v("quantity"),
        ".",
      ],
    },
    {
      title: "2. PRICE",
      segments: [
        "Unit price: ",
        v("currency"),
        " ",
        v("unitPrice"),
        ", ",
        v("incoterms"),
        " ",
        v("portLoading"),
        ". Total contract amount: ",
        v("currency"),
        " ",
        v("totalAmount"),
        ".",
      ],
    },
    {
      title: "3. DELIVERY",
      segments: [
        "Shipment shall be made from ",
        v("portLoading"),
        " to ",
        v("portDischarge"),
        ", ",
        v("shipmentDate"),
        ". Partial shipment and transshipment are subject to mutual written agreement.",
      ],
    },
    {
      title: "4. PAYMENT",
      segments: ["Payment terms: ", v("paymentTerms"), "."],
    },
    {
      title: "5. INSPECTION AND QUARANTINE",
      segments: [
        "The Seller shall obtain the phytosanitary certificate and any other export certificates required by the competent Japanese authorities. The Buyer shall be responsible for import permits and procedures required in the country of destination.",
      ],
    },
    {
      title: "6. FORCE MAJEURE",
      segments: [
        "Neither party shall be liable for failure to perform its obligations caused by events beyond its reasonable control, including natural disasters, war, or governmental restrictions.",
      ],
    },
    {
      title: "7. GOVERNING LAW AND DISPUTES",
      segments: [
        "This Agreement shall be governed by the laws of Japan. Any dispute shall first be settled through good-faith negotiation between the parties.",
      ],
    },
  ];
}

export const CONTRACT_DISCLAIMER_EN =
  "This document is a general template for reference only and does not constitute legal advice. Consult JETRO or qualified legal counsel before signing.";

export const CONTRACT_DISCLAIMER_JA =
  "本書は一般的なひな形であり法的助言ではありません。締結前にJETRO等の専門窓口へご相談ください。";

/** project.inputs のキー（doc: プレフィックスで書類用と分かるようにする） */
export const contractInputKey = (key: keyof ContractVars) => `doc:contract:${key}`;

export function contractVarsFromInputs(inputs: Record<string, string>): ContractVars {
  const out = {} as ContractVars;
  for (const f of CONTRACT_FIELDS) {
    out[f.key] = inputs[contractInputKey(f.key)] ?? "";
  }
  return out;
}
