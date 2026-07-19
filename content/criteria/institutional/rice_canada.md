---
freshness: C
source: 植物防疫所 輸出入条件詳細情報・JETRO公表資料をもとに手動整備（雛形）
source_url: https://www.maff.go.jp/pps/
retrieved_at: 2026-07-19
---

## 概要

カナダ向け精米は山形県からの輸出実績がある仕向地（県統計ではカナダ向けは
ほぼ全量が米）。カナダの食品規制（食品検査庁の要件・表示等）への対応と、
CPTPPの特恵利用可否の確認が主な論点。
本ファイルは初期整備値（雛形）であり、最終確認は植物防疫所等の公的機関へ。

## 減点項目

- id: food-regulation
  points: -4
  label: カナダの食品規制（表示・規格等）への適合確認が必要
  remedy: JETRO・バイヤー経由でカナダの食品規制・表示要件を確認する
  step_ref: rice_canada#labeling-prep
- id: pesticide
  points: -3
  label: 残留農薬基準への適合確認が必要
  remedy: 使用農薬の記録を整理し、相手国基準との照合を出荷前に行う
  step_ref: rice_canada#pesticide-check
- id: tariff-epa-check
  points: -2
  label: CPTPP特恵の適用可否・原産地申告要件の確認が必要
  remedy: 対象品目か・自己申告の要件をJETRO・税関の公表資料で確認する
  step_ref: rice_canada#tariff-epa
