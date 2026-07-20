---
freshness: B
source: 植物防疫所 輸出入条件詳細情報（西洋なし・台湾）
source_url: https://www.maff.go.jp/pps/
retrieved_at: 2026-07-17
reviewed_by: Jump
---

## 概要

台湾向けラ・フランス（西洋なし）は輸出可能。りんごと同様に生産園地登録と
植物検疫証明書が必要。追熟特性があるため温度管理にも留意する。
本情報は運用者が整備した目安であり、最終確認は植物防疫所等の公的機関へ。

## 減点項目

- id: orchard-registration
  points: -10
  label: 生産園地登録が必要
  remedy: 県の窓口経由で輸出用園地の登録を申請する
  step_ref: la-france_taiwan#orchard-registration
- id: phytosanitary-cert
  points: -5
  label: 植物検疫証明書が必要
  remedy: 輸出前に植物防疫所の検査を受け、植物検疫証明書の交付を受ける
  step_ref: la-france_taiwan#phytosanitary-cert
- id: cold-chain
  points: -2
  label: 追熟特性に合わせた温度管理が必要
  remedy: 予冷とリーファー輸送の温度帯を乙仲・輸送業者と確認する
  step_ref: #logistics-plan
