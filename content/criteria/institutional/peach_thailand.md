---
freshness: C
source: 植物防疫所 輸出入条件詳細情報・山形県・JETRO公表資料をもとに手動整備
source_url: https://www.maff.go.jp/pps/
retrieved_at: 2026-07-19
---

## 概要

タイ向けももは、生産園地登録・植物検疫証明書に加え、タイ保健省告示に
基づく選果・こん包施設の証明書（山形県が発行）が必要。さらに日持ちの
短さに起因する輸送計画が論点となる。都道府県が関与する手続きを含むため、
県の窓口との早めの段取りが要る。
本情報は運用者が整備した目安であり、最終確認は植物防疫所・県の窓口へ。

## 減点項目

- id: orchard-registration
  points: -10
  label: 生産園地登録が必要
  remedy: 県の窓口経由で輸出用園地の登録を申請する
  step_ref: peach_thailand#orchard-registration
- id: prefecture-facility-cert
  points: -8
  label: タイ向けは県による選果・こん包施設の証明書が必要
  remedy: 山形県 農産物販路開拓・輸出推進課に施設証明の申請手順・時期を確認し、申請する
  step_ref: peach_thailand#prefecture-facility-cert
- id: phytosanitary-cert
  points: -5
  label: 植物検疫証明書が必要
  remedy: 輸出前に植物防疫所の検査を受け、植物検疫証明書の交付を受ける
  step_ref: peach_thailand#phytosanitary-cert
- id: perishability
  points: -5
  label: 日持ちが短く、輸送日数・輸送手段の制約が大きい（航空便が選択肢になる）
  remedy: 乙仲と輸送日数を確認し、海上（定温）と航空便の両案で出荷計画を立てる
  step_ref: peach_thailand#logistics-plan
