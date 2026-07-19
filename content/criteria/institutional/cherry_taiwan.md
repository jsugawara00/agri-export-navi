---
freshness: C
source: 植物防疫所 輸出入条件詳細情報・JETRO公表資料をもとに手動整備（雛形）
source_url: https://www.maff.go.jp/pps/
retrieved_at: 2026-07-19
---

## 概要

台湾向けさくらんぼは山形県を代表する品目でありながら、輸出量は少なく
推移している（県統計でR5の2tからR6は1tへ）。検疫要件そのものは他の果実と
大きく変わらないが、日持ちが特に短く輸送手段が航空便に事実上限られること、
収穫期が短期間に集中することが、輸出を難しくする要因として表れる。
数量が伸びない背景を採算面から断定するものではなく、確認すべき制約を
可視化するための整備値（雛形）である。最終確認は植物防疫所等の公的機関へ。

## 減点項目

- id: orchard-registration
  points: -10
  label: 生産園地登録が必要
  remedy: 県の窓口経由で輸出用園地の登録を申請する
  step_ref: cherry_taiwan#orchard-registration
- id: phytosanitary-cert
  points: -5
  label: 植物検疫証明書が必要
  remedy: 輸出前に植物防疫所の検査を受け、植物検疫証明書の交付を受ける
  step_ref: cherry_taiwan#phytosanitary-cert
- id: perishability
  points: -8
  label: 日持ちが特に短く、輸送手段が航空便に事実上限られる
  remedy: 乙仲・航空フォワーダーと予冷・定温輸送や便の確保を早期に相談し、鮮度保持と納期を両立させる計画を立てる
  step_ref: cherry_taiwan#logistics-plan
- id: harvest-window
  points: -4
  label: 収穫期が短期間に集中し、検疫・輸送・商談の段取りが限られる
  remedy: 収穫期から逆算し、園地登録・検査枠・輸送手配・商談を前年のうちから並行して準備する
  step_ref: cherry_taiwan#export-conditions
