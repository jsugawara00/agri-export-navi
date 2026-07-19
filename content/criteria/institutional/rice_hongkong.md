---
freshness: B
source: 植物防疫所 輸出入条件詳細情報（精米・香港）／香港工業貿易署 米穀管理制度
source_url: https://www.maff.go.jp/pps/
retrieved_at: 2026-07-17
reviewed_by: Jump
---

## 概要

香港向け精米は植物検疫のハードルは低いが、香港では米が法定備蓄商品に
指定されており、輸入者（バイヤー）側に米穀商登録が必要。
本情報は初期整備値（雛形）であり、最終確認は植物防疫所等の公的機関へ。

## 減点項目

- id: rice-control-scheme
  points: -5
  label: 米は法定備蓄商品（輸入者に米穀商登録が必要）
  remedy: バイヤーが香港の米穀商（Rice Stockholder）登録を持つか確認する
  step_ref: rice_hongkong#rice-importer-confirm
- id: labeling
  points: -2
  label: 食品表示（英文・中文）の準備が必要
  remedy: 香港の食品表示要件を確認し、英文・中文ラベルを準備する
  step_ref: rice_hongkong#labeling-prep
