---
freshness: C
source: 植物防疫所 輸出入条件詳細情報・JETRO公表資料をもとに手動整備
source_url: https://www.maff.go.jp/pps/
retrieved_at: 2026-07-19
---

## 概要

シンガポール向け精米は山形県からの輸出実績がある仕向地。植物検疫の
ハードルは比較的低いとされるが、米は輸入管理の対象とされており、
輸入者側の登録・ライセンスの要否確認が重要。
本ファイルは運用者が整備した目安であり、最終確認は植物防疫所等の公的機関へ。

## 減点項目

- id: importer-license
  points: -5
  label: 米は輸入管理の対象（輸入者側の登録・ライセンス要否の確認が必要）
  remedy: バイヤーが必要な登録・ライセンスを持つか、要否も含めて確認する
  step_ref: rice_singapore#importer-license-check
- id: labeling
  points: -2
  label: 食品表示（英文）の準備が必要
  remedy: シンガポールの食品表示要件を確認し、英文ラベルを準備する
  step_ref: rice_singapore#labeling-prep
- id: pesticide
  points: -3
  label: 残留農薬基準への適合確認が必要
  remedy: 使用農薬の記録を整理し、相手国基準との照合を出荷前に行う
  step_ref: rice_singapore#pesticide-check
