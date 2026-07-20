---
freshness: C
source: 植物防疫所 輸出入条件詳細情報・JETRO公表資料をもとに手動整備
source_url: https://www.maff.go.jp/pps/
retrieved_at: 2026-07-19
---

## 概要

シンガポール向けさくらんぼは、検疫・食品表示への対応に加え、日持ちが特に
短く輸送手段が航空便に事実上限られること、収穫期が短期間に集中することが、
輸出を難しくする要因として表れる。輸送距離が東アジア向けより長いため、
鮮度保持の計画がとりわけ重要となる。
数量や採算を断定するものではなく、確認すべき制約を可視化するための
運用者が整備した目安である。最終確認は植物防疫所等の公的機関へ。

## 減点項目

- id: phytosanitary-cert
  points: -5
  label: 植物検疫証明書が必要
  remedy: 輸出前に植物防疫所の検査を受け、植物検疫証明書の交付を受ける
  step_ref: cherry_singapore#phytosanitary-cert
- id: pesticide
  points: -3
  label: 残留農薬基準への適合確認が必要
  remedy: 使用農薬の記録を整理し、相手国基準との照合を出荷前に行う
  step_ref: cherry_singapore#pesticide-check
- id: labeling
  points: -2
  label: 食品表示（英文）の準備が必要
  remedy: シンガポールの食品表示要件を確認し、英文ラベルを準備する
  step_ref: cherry_singapore#labeling-prep
- id: perishability
  points: -8
  label: 日持ちが特に短く、輸送手段が航空便に事実上限られる
  remedy: 乙仲・航空フォワーダーと予冷・定温輸送や便の確保を早期に相談し、鮮度保持と納期を両立させる計画を立てる
  step_ref: cherry_singapore#logistics-plan
- id: harvest-window
  points: -4
  label: 収穫期が短期間に集中し、検疫・輸送・商談の段取りが限られる
  remedy: 収穫期から逆算し、検査枠・輸送手配・商談を前年のうちから並行して準備する
  step_ref: cherry_singapore#export-conditions
