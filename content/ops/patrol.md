---
freshness: C
source: Toika運用ルール（手動整備）
retrieved_at: 2026-07-17
stale_days_A: 30
stale_days_B: 90
stale_days_C: 365
---

## 巡回・鮮度の運用ルール

- 区分A（自動取得）: 取得日から30日を超えたら鮮度警告。Phase 4以降で都度取得へ移行
- 区分B（変更検知型）: 90日を超えたら再確認を推奨。巡回で情報源の変化を検知したら
  確認キューに積む（**mdの自動書き換えは禁止。反映は必ず運用者が行う**）
- 区分C（静的md）: 365日を目安に定期見直し

## 巡回の流れ

1. `npm run patrol` — 情報源ページを取得し、前回スナップショットと比較
2. 変化があれば `ops/review-queue/` に確認キューmdが作られる
3. 運用者が情報源を確認し、必要なら基準mdを更新（retrieved_at・reviewed_byも更新）
4. キューmdの status を resolved に変更して完了
