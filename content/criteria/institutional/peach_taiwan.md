---
freshness: C
source: 植物防疫所 輸出入条件詳細情報・JETRO公表資料をもとに手動整備
source_url: https://www.maff.go.jp/pps/
retrieved_at: 2026-07-19
---

## 概要

台湾向けももは山形県の輸出実績3位の主力品目（R6: 137t・主力仕向地は台湾）。
生果実のため生産園地登録・植物検疫証明書等の検疫条件と、日持ちの短さに
起因する輸送計画が主な論点。
本ファイルは運用者が整備した目安であり、最終確認は植物防疫所等の公的機関へ。

## 減点項目

- id: orchard-registration
  points: -10
  label: 生産園地登録が必要
  remedy: 県の窓口経由で輸出用園地の登録を申請する
  step_ref: peach_taiwan#orchard-registration
- id: phytosanitary-cert
  points: -5
  label: 植物検疫証明書が必要
  remedy: 輸出前に植物防疫所の検査を受け、植物検疫証明書の交付を受ける
  step_ref: peach_taiwan#phytosanitary-cert
- id: perishability
  points: -5
  label: 日持ちが短く、輸送日数・輸送手段の制約が大きい（航空便が選択肢になる）
  remedy: 乙仲と輸送日数を確認し、海上（定温）と航空便の両案で出荷計画を立てる
  step_ref: peach_taiwan#logistics-plan
