---
freshness: C
source: 植物防疫所・JETRO・香港工業貿易署公表資料をもとに手動整備
retrieved_at: 2026-07-17
---

## ステップ

- id: export-conditions
  layer: 1
  title: 輸出条件の全体像を確認する
  purpose: この品目×相手国で必要な条件を最初に把握し、抜け漏れを防ぐため
- id: rice-importer-confirm
  layer: 2
  title: バイヤーの米穀商登録を確認する
  purpose: 香港側輸入者が米穀商（Rice Stockholder）登録を持つことを確認するため
- id: labeling-prep
  layer: 1
  title: 英文・中文の食品表示ラベルを準備する
  purpose: 香港の食品表示要件を満たすラベルを事前に用意するため
- id: gov-confirm
  layer: 2
  title: 植物防疫所に最新条件を電話で確認する
  purpose: 最新の検疫条件を公的窓口に直接確認し、思い込みを排除するため
  gate: human-confirm
  q1: 品目と輸出先を伝え、現行の検疫条件・必要な検査に変更がないか
  q2: 植物検疫証明書等の申請窓口と、検査の申込み時期はいつか
  q3: 事前登録（園地・施設等）の要否と期限に変更がないか
- id: insurance-check
  layer: 2
  title: 貿易保険・海上保険を検討する
  purpose: 輸送中・情勢起因の損害に備え、保険でリスクを移転するため
- id: logistics-plan
  layer: 2
  title: 港・輸送スケジュールを乙仲と相談する
  purpose: 出荷時期と輸送手段を確定し、鮮度と納期を両立させるため
- id: contract-draft
  layer: 1
  title: 英文契約書のひな形を作成する
  purpose: 取引条件のたたき台を早めに用意し、バイヤーとの認識合わせを進めるため（締結は層3・本アプリの範囲外）
- id: docs-prepare
  layer: 1
  title: インボイス等の書類を準備する
  purpose: 通関に必要な書類を漏れなく揃えるため
- id: bank-check
  layer: 2
  title: 銀行の外為窓口に決済方式を相談する
  purpose: L/C・前払い等の決済方式のリスクを事前に確認するため
