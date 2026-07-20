---
freshness: B
source: 植物防疫所 輸出入条件詳細情報（精米・台湾）
source_url: https://www.maff.go.jp/pps/
retrieved_at: 2026-07-17
reviewed_by: Jump
---

## 概要

台湾向け精米は輸出可能。植物検疫証明書に加え、台湾独自の残留農薬基準への
適合確認と、関税割当制度（割当外は高関税）への留意が必要。
本情報は運用者が整備した目安であり、最終確認は植物防疫所等の公的機関へ。

## 減点項目

- id: phytosanitary-cert
  points: -4
  label: 植物検疫証明書が必要
  remedy: 輸出前に植物防疫所の検査を受け、植物検疫証明書の交付を受ける
  step_ref: rice_taiwan#phytosanitary-cert
- id: pesticide-standard
  points: -5
  label: 台湾独自の残留農薬基準への適合確認が必要
  remedy: 使用農薬リストを台湾基準と照合し、必要に応じて検査データを準備する
  step_ref: rice_taiwan#pesticide-standard
- id: tariff-quota
  points: -6
  label: 関税割当制度の対象（割当外は高関税）
  remedy: 輸入者側の割当枠の有無と適用関税率を確認し、採算計画に反映する
  step_ref: rice_taiwan#tariff-quota
