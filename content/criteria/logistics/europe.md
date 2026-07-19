---
freshness: C
source: 一般公開の航路情報をもとに手動整備（定期見直し）
retrieved_at: 2026-07-19
---

## 概要

日本〜欧州航路。航海日数が長く、経路（スエズ運河経由・喜望峰経由等）は
情勢により変わることがある。輸送日数・スケジュールの変動に留意する。

## 減点項目

- id: long-transit
  points: -5
  label: 航海日数が長い長距離航路
  remedy: 品目の日持ちと輸送日数を乙仲に確認し、必要ならリーファー（定温）輸送や航空便を検討する
  step_ref: #logistics-plan
- id: route-volatility
  points: -3
  label: 経路・スケジュールが情勢により変動することがある
  remedy: 出荷時期に余裕を持たせ、乙仲と最新の経路・所要日数を事前に確認する
  step_ref: #logistics-plan
