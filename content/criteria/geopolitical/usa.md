---
freshness: A
source: 外務省 海外安全ホームページ（危険情報）
source_url: https://www.anzen.mofa.go.jp/
retrieved_at: 2026-07-17
---

## 概要

外務省の危険情報は現在レベル指定なし（本土）。通商政策・関税措置の変動と
為替変動をリスク要因として扱う。

## 減点項目

- id: tariff-policy
  points: -4
  label: 通商政策・関税措置の変動リスク
  remedy: 出荷前に最新の関税率をJETRO等で確認し、価格条件に反映する
  step_ref: #gov-confirm
- id: fx-volatility
  points: -2
  label: 為替変動リスク
  remedy: 決済通貨と為替リスクの分担を契約時に取り決める
  step_ref: #bank-check
