---
freshness: C
source: 植物防疫所 輸出入条件詳細情報・JETRO公表資料をもとに手動整備（雛形）
source_url: https://www.maff.go.jp/pps/
retrieved_at: 2026-07-19
---

## 概要

香港向けさくらんぼは、香港側の植物検疫のハードルが比較的低いとされる一方、
日持ちが特に短く輸送手段が航空便に事実上限られること、収穫期が短期間に
集中することが、輸出を難しくする要因として表れる。
数量や採算を断定するものではなく、確認すべき制約を可視化するための
整備値（雛形）である。最終確認は植物防疫所等の公的機関へ。

## 減点項目

- id: importer-procedure
  points: -3
  label: 輸入者側の食品輸入手続き・表示の確認が必要
  remedy: バイヤーと香港側の要件（表示・輸入手続き）を事前に擦り合わせる
  step_ref: cherry_hongkong#importer-confirm
- id: perishability
  points: -8
  label: 日持ちが特に短く、輸送手段が航空便に事実上限られる
  remedy: 乙仲・航空フォワーダーと予冷・定温輸送や便の確保を早期に相談し、鮮度保持と納期を両立させる計画を立てる
  step_ref: cherry_hongkong#logistics-plan
- id: harvest-window
  points: -4
  label: 収穫期が短期間に集中し、検疫・輸送・商談の段取りが限られる
  remedy: 収穫期から逆算し、検査枠・輸送手配・商談を前年のうちから並行して準備する
  step_ref: cherry_hongkong#export-conditions
