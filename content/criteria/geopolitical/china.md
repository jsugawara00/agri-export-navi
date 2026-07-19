---
freshness: A
source: 外務省 海外安全ホームページ／農林水産省 輸出関連情報
source_url: https://www.anzen.mofa.go.jp/
retrieved_at: 2026-07-19
---

## 概要

中国は日本産食品に対する輸入規制が短期間で変更された経緯がある
（2023年8月の水産物輸入の全面停止、2025年6月の条件付き一部再開、
2025年11月の再停止など）。山形県統計でもR5に282t（ほぼ全量が米）の
実績があった一方、R6は実績ゼロとなっている。
最新の規制状況を必ず植物防疫所・税関等の公的機関で確認すること。

## 減点項目

- id: import-restriction-volatility
  points: -25
  label: 輸入規制が短期間で変更された経緯がある（変動リスク大）
  remedy: 契約前・出荷前の両時点で最新の輸入規制を植物防疫所・JETROに確認し、契約書に規制変動時の取り決めを盛り込む
  step_ref: #gov-confirm
- id: regulatory-change
  points: -5
  label: 制度運用の変更リスク
  remedy: 出荷前に最新の輸入規制をJETRO・現地輸入者経由で確認する
  step_ref: #gov-confirm
