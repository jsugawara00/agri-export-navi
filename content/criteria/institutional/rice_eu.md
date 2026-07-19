---
freshness: C
source: 植物防疫所 輸出入条件詳細情報・JETRO公表資料をもとに手動整備（雛形）
source_url: https://www.maff.go.jp/pps/
retrieved_at: 2026-07-19
---

## 概要

EU向け精米は山形県からの輸出実績がある仕向地（県統計では欧州向けは
ほぼ全量が米・R6は100tに倍増）。EUの残留農薬・汚染物質基準への適合と、
仕向け国の表示要件、日EU協定の特恵利用可否の確認が主な論点。
本サイトでは県統計の区分に合わせEUを一括で扱う。仕向け国が確定したら
当該国向けの条件を必ず確認すること。
本ファイルは初期整備値（雛形）であり、最終確認は植物防疫所等の公的機関へ。

## 減点項目

- id: eu-standards
  points: -5
  label: EUの残留農薬・汚染物質基準への適合確認が必要
  remedy: 使用農薬の記録を整理し、EU基準との照合を出荷前に行う（必要に応じ分析データを準備）
  step_ref: rice_eu#pesticide-check
- id: member-state-variation
  points: -3
  label: 表示・運用が仕向け国により異なる（仕向け国確定後の再確認が必要）
  remedy: 仕向け国が確定したら、当該国の表示言語・追加要件をJETRO・バイヤー経由で確認する
  step_ref: rice_eu#labeling-prep
- id: tariff-epa-check
  points: -2
  label: 日EU協定特恵の適用可否・原産地申告要件の確認が必要
  remedy: 対象品目か・自己申告の要件をJETRO・税関の公表資料で確認する
  step_ref: rice_eu#tariff-epa
