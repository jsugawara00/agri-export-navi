---
freshness: B
source: 植物防疫所 輸出入条件詳細情報（西洋なし・米国）
source_url: https://www.maff.go.jp/pps/
retrieved_at: 2026-07-17
reviewed_by: Jump
---

## 概要

米国向けラ・フランスは輸出可能だが、園地・施設登録と体系的防除、輸出前検査、
FDAの食品安全規制など要件が多い。追熟特性があるため温度管理にも留意する。
本ファイルはデモ用の初期整備値であり、最終確認は植物防疫所等の公的機関へ。

## 減点項目

- id: systems-approach
  points: -12
  label: 園地・選果こん包施設の登録と体系的防除が必要
  remedy: 県・植物防疫所経由で園地と施設の登録を申請し、防除記録を整備する
  step_ref: la-france_usa#systems-approach
- id: joint-inspection
  points: -6
  label: 輸出前検査（検査官立会い）が必要
  remedy: 植物防疫所に輸出前検査の日程と要件を確認し、検査枠を確保する
  step_ref: la-france_usa#joint-inspection
- id: fda-registration
  points: -7
  label: FDA施設登録と事前通知（Prior Notice）が必要
  remedy: FDAの施設登録を行い、出荷ごとの事前通知の運用を確認する
  step_ref: la-france_usa#fda-registration
- id: pesticide-tolerance
  points: -6
  label: 残留農薬（トレランス）基準への適合確認が必要
  remedy: 使用農薬リストを米国基準と照合し、必要なら防除体系を見直す
  step_ref: la-france_usa#pesticide-tolerance
- id: cold-chain
  points: -2
  label: 追熟特性に合わせた温度管理が必要
  remedy: 予冷とリーファー輸送の温度帯を乙仲・輸送業者と確認する
  step_ref: #logistics-plan
