---
freshness: B
source: 植物防疫所 輸出入条件詳細情報（精米・米国）
source_url: https://www.maff.go.jp/pps/
retrieved_at: 2026-07-17
reviewed_by: Jump
---

## 概要

米国向け精米は輸出可能。FDAの食品安全規制（施設登録・事前通知）と
残留農薬・重金属に関する確認が中心となる。
本ファイルはデモ用の初期整備値であり、最終確認は植物防疫所等の公的機関へ。

## 減点項目

- id: fda-registration
  points: -6
  label: FDA施設登録と事前通知（Prior Notice）が必要
  remedy: FDAの施設登録を行い、出荷ごとの事前通知の運用を確認する
  step_ref: rice_usa#fda-registration
- id: pesticide-tolerance
  points: -5
  label: 残留農薬（トレランス）基準への適合確認が必要
  remedy: 使用農薬リストを米国基準と照合し、必要なら検査データを準備する
  step_ref: rice_usa#pesticide-tolerance
- id: heavy-metal
  points: -4
  label: 重金属（カドミウム等）の検査データを求められることが多い
  remedy: 公的検査機関で重金属の分析データを取得し、バイヤーに提示できるようにする
  step_ref: rice_usa#heavy-metal-test
