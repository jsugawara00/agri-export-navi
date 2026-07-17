---
freshness: B
source: 植物防疫所 輸出入条件詳細情報（西洋なし・香港）
source_url: https://www.maff.go.jp/pps/
retrieved_at: 2026-07-17
reviewed_by: Jump
---

## 概要

香港向けラ・フランスは植物検疫証明書が原則不要で、ハードルが低い組み合わせ。
追熟特性があるため温度管理に留意する。
本ファイルはデモ用の初期整備値であり、最終確認は植物防疫所等の公的機関へ。

## 減点項目

- id: importer-procedure
  points: -2
  label: 輸入者側の食品輸入手続きの確認が必要
  remedy: バイヤー（輸入者）に香港側の輸入手続きの担当と要件を確認する
  step_ref: la-france_hongkong#importer-confirm
- id: cold-chain
  points: -2
  label: 追熟特性に合わせた温度管理が必要
  remedy: 予冷とリーファー輸送の温度帯を乙仲・輸送業者と確認する
  step_ref: #logistics-plan
