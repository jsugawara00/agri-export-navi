---
freshness: C
source: 植物防疫所 輸出入条件詳細情報・JETRO公表資料をもとに手動整備
source_url: https://www.maff.go.jp/pps/
retrieved_at: 2026-07-19
---

## 概要

香港向けぶどうは少量ながら単価の高い品目。香港は植物検疫のハードルが
比較的低いとされるが、日持ちの短さに起因する輸送計画と、食品表示・
輸入者側手続きの確認が論点。
本情報は運用者が整備した目安であり、最終確認は植物防疫所等の公的機関へ。

## 減点項目

- id: importer-procedure
  points: -3
  label: 輸入者側の食品輸入手続き・表示の確認が必要
  remedy: バイヤーと香港側の要件（表示・輸入手続き）を事前に擦り合わせる
  step_ref: grape_hongkong#importer-confirm
- id: perishability
  points: -5
  label: 日持ちが短く、輸送日数・輸送手段の制約が大きい（航空便が選択肢になる）
  remedy: 乙仲と輸送日数を確認し、海上（定温）と航空便の両案で出荷計画を立てる
  step_ref: grape_hongkong#logistics-plan
