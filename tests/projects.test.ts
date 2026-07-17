import { describe, expect, it } from "vitest";
import {
  GateNotConfirmedError,
  completionPct,
  createProject,
  isStepRefResolved,
  recap,
  rejudge,
  todayTodos,
  toggleStep,
} from "@/lib/projects/logic";
import type { ProcedureStep } from "@/lib/content/types";

const steps: ProcedureStep[] = [
  { id: "export-conditions", layer: 1, title: "条件確認", purpose: "全体像把握", questions: [] },
  {
    id: "gov-confirm",
    layer: 2,
    title: "防疫所へ確認",
    purpose: "最新条件の確認",
    gate: "human-confirm",
    questions: ["条件に変更はないか"],
  },
  { id: "logistics-plan", layer: 2, title: "輸送相談", purpose: "納期両立", questions: [] },
  { id: "docs-prepare", layer: 1, title: "書類準備", purpose: "通関書類", questions: [] },
];

function newProject() {
  return createProject({
    id: "p1",
    uid: null,
    item: "apple",
    country: "taiwan",
    hurdle: { score: 78, grade: "B", snapshotAt: "2026-07-17" },
    now: 1000,
  });
}

describe("案件ロジック", () => {
  it("作成時は完成度0%で履歴にcreateが残る", () => {
    const p = newProject();
    expect(p.progress.completionPct).toBe(0);
    expect(p.history).toEqual([{ at: 1000, action: "create" }]);
  });

  it("ステップ完了で完成度が上がり、履歴が残る", () => {
    let p = newProject();
    p = toggleStep(p, steps[0], steps, undefined, 2000);
    expect(p.progress.completedSteps).toEqual(["export-conditions"]);
    expect(p.progress.completionPct).toBe(25);
    expect(p.history.at(-1)).toEqual({
      at: 2000,
      action: "step-complete",
      stepId: "export-conditions",
    });
  });

  it("完了済みステップの再トグルで取り消しになる", () => {
    let p = newProject();
    p = toggleStep(p, steps[0], steps);
    p = toggleStep(p, steps[0], steps);
    expect(p.progress.completedSteps).toEqual([]);
    expect(p.progress.completionPct).toBe(0);
    expect(p.history.at(-1)?.action).toBe("step-uncomplete");
  });

  it("官庁確認ゲートは確認結果未入力だと完了できない", () => {
    const p = newProject();
    expect(() => toggleStep(p, steps[1], steps)).toThrow(GateNotConfirmedError);
    expect(() => toggleStep(p, steps[1], steps, "   ")).toThrow(GateNotConfirmedError);
  });

  it("官庁確認ゲートは確認結果を入力すると完了でき、inputsに記録される", () => {
    let p = newProject();
    p = toggleStep(p, steps[1], steps, "7/17に確認。条件変更なし");
    expect(p.progress.completedSteps).toEqual(["gov-confirm"]);
    expect(p.inputs["gov-confirm"]).toBe("7/17に確認。条件変更なし");
  });

  it("再判定はスナップショットを更新し履歴を残す", () => {
    let p = newProject();
    p = rejudge(p, { score: 80, grade: "B", snapshotAt: "2026-08-01" }, 3000);
    expect(p.hurdle.score).toBe(80);
    expect(p.history.at(-1)).toEqual({ at: 3000, action: "hurdle-rejudge" });
  });
});

describe("completionPct", () => {
  it("0ステップなら0%", () => {
    expect(completionPct([], 0)).toBe(0);
  });
  it("端数は四捨五入", () => {
    expect(completionPct(["a"], 3)).toBe(33);
    expect(completionPct(["a", "b"], 3)).toBe(67);
  });
});

describe("step_ref解消判定", () => {
  it("絶対参照は組み合わせ一致かつ完了済みで解消", () => {
    expect(
      isStepRefResolved("apple_taiwan#orchard-registration", "apple_taiwan", [
        "orchard-registration",
      ]),
    ).toBe(true);
    expect(
      isStepRefResolved("apple_taiwan#orchard-registration", "apple_usa", [
        "orchard-registration",
      ]),
    ).toBe(false);
  });
  it("相対参照(#stepId)は完了済みステップidで解消", () => {
    expect(isStepRefResolved("#logistics-plan", "rice_usa", ["logistics-plan"])).toBe(true);
    expect(isStepRefResolved("#logistics-plan", "rice_usa", [])).toBe(false);
  });
});

describe("リキャップとTODO", () => {
  it("未着手なら last=null, next=先頭ステップ", () => {
    const r = recap(steps, []);
    expect(r.last).toBeNull();
    expect(r.next?.id).toBe("export-conditions");
  });
  it("途中なら最後に完了したステップと次のステップを返す", () => {
    const r = recap(steps, ["export-conditions", "gov-confirm"]);
    expect(r.last?.id).toBe("gov-confirm");
    expect(r.next?.id).toBe("logistics-plan");
  });
  it("全完了なら next=null", () => {
    const r = recap(
      steps,
      steps.map((s) => s.id),
    );
    expect(r.next).toBeNull();
  });
  it("今日のTODOは未完了の先頭から最大3件", () => {
    expect(todayTodos(steps, ["export-conditions"]).map((s) => s.id)).toEqual([
      "gov-confirm",
      "logistics-plan",
      "docs-prepare",
    ]);
  });
});
