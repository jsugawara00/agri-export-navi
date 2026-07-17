import { describe, expect, it } from "vitest";
import {
  CONTRACT_FIELDS,
  contractClauses,
  contractInputKey,
  contractVarsFromInputs,
} from "@/lib/docs/contract";
import { computeAmount } from "@/lib/docs/invoice";
import { buildForwarderMail } from "@/lib/docs/mail";
import { contractDraftStatus, createProject, updateInputs } from "@/lib/projects/logic";
import type { ProcedureStep } from "@/lib/content/types";

describe("契約書テンプレート", () => {
  it("全条項の変数参照が定義済みフィールドに対応している", () => {
    const keys = new Set(CONTRACT_FIELDS.map((f) => f.key));
    for (const clause of contractClauses()) {
      for (const seg of clause.segments) {
        if (typeof seg !== "string") {
          expect(keys.has(seg.var), `${clause.title} の変数 ${seg.var}`).toBe(true);
        }
      }
    }
  });

  it("inputsから変数を復元できる（未入力は空文字）", () => {
    const inputs = { [contractInputKey("sellerName")]: "Yamada Farm" };
    const vars = contractVarsFromInputs(inputs);
    expect(vars.sellerName).toBe("Yamada Farm");
    expect(vars.buyerName).toBe("");
  });
});

describe("DRAFT判定（contractDraftStatus）", () => {
  const steps: ProcedureStep[] = [
    { id: "a", layer: 1, title: "A", purpose: "p", questions: [], requires: [] },
    {
      id: "gov-confirm",
      layer: 2,
      title: "防疫所確認",
      titleEn: "Confirm with PPS",
      purpose: "p",
      gate: "human-confirm",
      questions: ["q"],
      requires: [],
    },
  ];

  it("ゲート未完了ならDRAFT扱いで未確認リストを返す", () => {
    const r = contractDraftStatus(steps, ["a"]);
    expect(r.isDraft).toBe(true);
    expect(r.outstanding.map((o) => o.id)).toEqual(["gov-confirm"]);
  });

  it("ゲート完了でDRAFTが外れる", () => {
    const r = contractDraftStatus(steps, ["gov-confirm"]);
    expect(r.isDraft).toBe(false);
    expect(r.outstanding).toEqual([]);
  });
});

describe("インボイス合計計算", () => {
  it("数量×単価を計算する", () => {
    expect(computeAmount("500", "25.00")).toBe("12,500.00");
    expect(computeAmount("1,000", "2.5")).toBe("2,500.00");
  });
  it("数値でなければ空文字（勝手に数字を作らない）", () => {
    expect(computeAmount("500ケース", "25")).toBe("");
    expect(computeAmount("", "25")).toBe("");
  });
});

describe("乙仲相談メール下書き", () => {
  it("案件データが件名と本文に差し込まれる", () => {
    const mail = buildForwarderMail({
      itemLabel: "りんご",
      countryLabel: "台湾",
      portLabel: "酒田港",
      quantity: "500ケース",
      timing: "11月中",
      senderName: "山田太郎",
      contact: "090-0000-0000",
    });
    expect(mail.subject).toContain("りんご");
    expect(mail.subject).toContain("台湾");
    expect(mail.subject).toContain("酒田港");
    expect(mail.body).toContain("500ケース");
    expect(mail.body).toContain("山田太郎");
  });

  it("未入力項目はプレースホルダになる", () => {
    const mail = buildForwarderMail({
      itemLabel: "米",
      countryLabel: "香港",
      portLabel: "東京港",
      quantity: "",
      timing: "",
      senderName: "",
      contact: "",
    });
    expect(mail.body).toContain("（数量未定・ご相談）");
    expect(mail.body).toContain("（お名前）");
  });
});

describe("updateInputs", () => {
  it("inputsをマージ更新し履歴が残る", () => {
    let p = createProject({
      id: "p1",
      uid: null,
      item: "apple",
      country: "taiwan",
      hurdle: { score: 78, grade: "B", snapshotAt: "2026-07-17" },
      now: 1000,
    });
    p = updateInputs(p, { "doc:contract:sellerName": "Yamada Farm" }, 2000);
    p = updateInputs(p, { "doc:logistics:port": "sakata" }, 3000);
    expect(p.inputs["doc:contract:sellerName"]).toBe("Yamada Farm");
    expect(p.inputs["doc:logistics:port"]).toBe("sakata");
    expect(p.history.at(-1)).toEqual({ at: 3000, action: "inputs-update" });
  });
});
