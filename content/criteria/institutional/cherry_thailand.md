---
freshness: C
source: 植物防疫所 輸出入条件詳細情報・山形県・JETRO公表資料をもとに手動整備
source_url: https://www.maff.go.jp/pps/
retrieved_at: 2026-07-19
---

## 概要

タイ向けさくらんぼは、生産園地登録・植物検疫証明書・県の選果こん包施設
証明に加え、日持ちが特に短く輸送手段が航空便に事実上限られること、
収穫期が短期間に集中することが重なる。都道府県が関与する手続きを含み、
段取りの負荷が大きい部類に入るが、これは輸出不可を意味するものではなく、
確認・準備すべき事項が多いという意味である。採算を断定しない運用者が整備した目安。
最終確認は植物防疫所・県の窓口へ。

## 減点項目

- id: orchard-registration
  points: -10
  label: 生産園地登録が必要
  remedy: 県の窓口経由で輸出用園地の登録を申請する
  step_ref: cherry_thailand#orchard-registration
- id: prefecture-facility-cert
  points: -8
  label: タイ向けは県による選果・こん包施設の証明書が必要
  remedy: 山形県 農産物販路開拓・輸出推進課に施設証明の申請手順・時期を確認し、申請する
  step_ref: cherry_thailand#prefecture-facility-cert
- id: phytosanitary-cert
  points: -5
  label: 植物検疫証明書が必要
  remedy: 輸出前に植物防疫所の検査を受け、植物検疫証明書の交付を受ける
  step_ref: cherry_thailand#phytosanitary-cert
- id: perishability
  points: -8
  label: 日持ちが特に短く、輸送手段が航空便に事実上限られる
  remedy: 乙仲・航空フォワーダーと予冷・定温輸送や便の確保を早期に相談し、鮮度保持と納期を両立させる計画を立てる
  step_ref: cherry_thailand#logistics-plan
- id: harvest-window
  points: -4
  label: 収穫期が短期間に集中し、検疫・輸送・商談の段取りが限られる
  remedy: 収穫期から逆算し、園地登録・施設証明・検査枠・輸送手配・商談を前年のうちから並行して準備する
  step_ref: cherry_thailand#export-conditions
