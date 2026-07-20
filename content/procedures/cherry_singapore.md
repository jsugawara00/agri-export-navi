---
freshness: C
source: 植物防疫所・JETRO公表資料をもとに手動整備
retrieved_at: 2026-07-19
---

## ステップ

- id: export-conditions
  layer: 1
  title: 輸出条件の全体像を確認する
  purpose: この品目×相手国で必要な条件と、収穫期の集中を最初に把握し、抜け漏れを防ぐため
- id: pesticide-check
  layer: 2
  title: 使用農薬を相手国基準と照合する
  purpose: 残留農薬基準への適合を出荷前に確認するため
- id: gov-confirm
  layer: 2
  title: 植物防疫所に最新条件を電話で確認する
  title_en: Confirm the latest export requirements with the Plant Protection Station
  purpose: 最新の検疫条件を公的窓口に直接確認し、思い込みを排除するため
  gate: human-confirm
  q1: 品目と輸出先を伝え、現行の検疫条件・必要な検査に変更がないか
  q2: 植物検疫証明書等の申請窓口と、検査の申込み時期はいつか
  q3: 事前登録（施設等）の要否と期限に変更がないか
- id: phytosanitary-cert
  layer: 2
  title: 植物検疫証明書の検査を受ける
  purpose: 相手国の検疫要件を満たしていることを公的に証明するため
- id: labeling-prep
  layer: 2
  title: 食品表示ラベルを準備する
  purpose: 相手国の食品表示要件（英文表示等）を満たすため
- id: insurance-check
  layer: 2
  title: 貿易保険・海上保険を検討する
  purpose: 輸送中・情勢起因の損害に備え、保険でリスクを移転するため
- id: logistics-plan
  layer: 2
  title: 港・輸送スケジュールを乙仲と相談する
  purpose: 日持ちが特に短いため、航空便を軸に輸送日数と鮮度保持を確定するため
  tool: logistics
- id: contract-draft
  layer: 1
  title: 英文契約書のひな形を作成する
  purpose: 取引条件のたたき台を早めに用意し、バイヤーとの認識合わせを進めるため（締結は層3・本アプリの範囲外）
  tool: contract
- id: docs-prepare
  layer: 1
  title: インボイス等の書類を準備する
  purpose: 通関に必要な書類を漏れなく揃えるため
  tool: invoice
- id: bank-check
  layer: 2
  title: 銀行の外為窓口に決済方式を相談する
  purpose: L/C・前払い等の決済方式のリスクを事前に確認するため
  tool: bank
