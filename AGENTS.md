<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 農産物輸出ナビ（Toika Export Navigator）

詳細は `docs/企画書_v1.0.md`・`docs/指示書_v1.0.md` を参照。判断に迷ったら企画書の設計原則へ。

## 絶対原則（違反不可）

1. AIは断定しない。「最終確認は植物防疫所等へ」の文言を必ず添える
2. 判断基準はコードに埋め込まない。採点表・手順定義は `content/` のmdが単一情報源
3. 「輸出可能性◯%」という確率表現は実装しない。100点からの決定論的減点方式
4. スコア計算にLLMを使わない（mdパース＋加減算のみ）。LLMは文面生成に限定
5. 禁止品目は点数を出さず「輸出不可」と事実として区別表示
6. 全情報に鮮度メタデータ（freshness A/B/C・source・retrieved_at）＋UIバッジ
7. Three.js等3Dライブラリ禁止（地球儀はCanvas 2D点描）／自由入力禁止／メール自動送信禁止

## 構成

- `content/criteria/{institutional,geopolitical,logistics}/` — 採点md（減点項目）
- `content/procedures/{item}_{country}.md` — ステップ定義（step_refの解決先）
- `src/lib/content/` — frontmatter/減点項目/ステップのパーサ＋ローダ＋バリデーション
- `src/lib/score/engine.ts` — 採点エンジン（純関数）。グレード A:90+/B:75+/C:60+/D:40+/E:<40
- `src/components/globe/` — Canvas 2D点描地球儀（landmask.ts は72×36のRLEランドマスク）
- `tests/` — vitest（`npm test`）。禁止分岐/減点合算/グレード境界/step_ref整合

## 実装メモ（指示書からの具体化）

- step_ref は `{item}_{country}#{stepId}` 形式。国情勢・物流など品目非依存のmdでは
  `#{stepId}`（当該組み合わせのproceduresへの相対参照）を許可
- ステップidは `step-3` のような連番でなく意味名（例 `orchard-registration`）。
  相対参照を全proceduresで解決できるよう、共通ステップ（gov-confirm /
  insurance-check / logistics-plan / bank-check 等）を全ファイルに置く
- 国→航路の対応は `content/countries/{country}.md` frontmatter の `route:` が持つ
- content/ の数値はデモ用初期整備値（りんご×台湾=78点Bは企画書の代表例に一致させた）

## Phase 2 実装メモ

- 案件ストアは `src/lib/projects/store.ts` の `resolveStore(uid)` で解決:
  Firebase未設定（NEXT_PUBLIC_FIREBASE_* 空）→ localStorage のローカル保存モード、
  設定済み＋ログイン→ Firestore、設定済み＋未ログイン→ null（UIでログイン誘導）
- 案件操作は `src/lib/projects/logic.ts` の純関数（履歴追記・ゲート検証込み）。
  官庁確認ゲート（procedures mdの `gate: human-confirm`＋`q1..qN` 質問リスト）は
  確認結果テキスト未入力だと完了できない
- ハードル指数は判定時点のスナップショットを案件に保存。基準md更新で現在値と
  差が出たら「再判定しますか？」バナー表示（無断で数字を差し替えない）
- ステップは直列ではなく依存関係（mdの `requires: a, b`）で管理。依存は真に順番が
  固定される所のみ（例: 園地登録→検疫証明、施設登録→輸出前検査）。依存のない
  ステップ（contract-draft / docs-prepare 等）はいつでも先取り着手できる。
  UIの「いま着手できるステップ」= 未完了かつ依存充足の全件（並行作業を可視化）
- 契約書は「ひな形作成（contract-draft・層1）」と「締結（層3・範囲外）」を分離。
  Phase 3のPDF生成では確認系ステップ未完了の間はDRAFT透かし＋未確認リストを
  刷り込む方針（書類自体に警告を背負わせる）
- クライアントへは `buildAllCombos()`（server-only）の結果をpropsで渡す。
  型と `comboKey` は client からも使うため `combo-types.ts` に分離

## Phase 3 実装メモ

- PDFは @react-pdf/renderer（指示書の第一候補を採用）。標準フォントのため
  **PDF本文は英文**（輸出書類の実務準拠）。日本語をPDFに載せる場合は
  Noto Sans JP等のフォント埋め込み（数MB）が必要 — リメイク時の検討課題
- 契約書PDF: `contractDraftStatus()` でゲート未完了なら DRAFT透かし＋
  未確認事項リスト（mdの title_en）を刷り込む。法的助言でない旨の英文
  ディスクレーマを全出力に印字
- 契約書テンプレは `src/lib/docs/contract.ts` の Segment 配列（固定文字列＋変数参照）。
  UIプレビュー（変数ハイライト）とPDFが同一定義を描画する
- 書類入力は project.inputs に `doc:` プレフィックスで保存（contract/invoice/
  logistics/mail）。港選定は `doc:logistics:port`
- 乙仲リストは forwarders/{port}.md（**掲載はデモ用の例示**。実運用時は税関公表
  一覧から整備）。港の選択肢は municipalities/yamagata.md の `ports:` が持つ
- メール下書きはテンプレート差し込み（`src/lib/docs/mail.ts`・決定論的）。
  Claude APIによる文面生成はAPIキー設定後の拡張ポイント。送信機能は作らない

## Phase 4 実装メモ

- 巡回は `npm run patrol`（tsx実行）。フロー: 情報源フェッチ→正規化→ハッシュ比較
  →変化あれば `ops/review-queue/` に確認キューmdを起票。**content/への自動書換は
  実装していない・してはならない**（反映はキューのチェックリストに沿って人間が行う）
- 鮮度上限（区分A:30日/B:90日/C:365日）は `content/ops/patrol.md` frontmatterが
  単一情報源。巡回コアの純関数は `src/lib/ops/patrol.ts`（テスト済み）
- `/ops` は運用者向け読み取り専用コンソール（pendingキュー＋鮮度テーブル）。
  公開運用時はアクセス制限が必要（未実装）
- スナップショット（ops/snapshots/）はgitignore。キューとレポートは追跡する
- 同一source_urlを見る複数mdは1フェッチにまとめ、pendingキューがある間は再起票しない
- 巡回の定期実行（cron等）は運用パターンが見えてから導入する（企画書13章の方針）

## 地域情報の変更検知（infoSnapshot）

- 案件保存時に `buildInfoSnapshot()`（src/lib/projects/info.ts）で国概要6項目＋
  ハードル指数＋軸別減点項目を project.infoSnapshot に保存
- ナビ画面で現在値と `diffInfoSnapshot()` 比較 → 差分があれば「輸出に関わる情報に
  変更があります。確認をお願いします」バナー＋ /projects/[id]/info へ誘導
- /projects/[id]/info（地域情報・判定内訳）: ナビから常設リンク。変更カードは
  `.changed-glow`（アンバー脈動）＋「変更あり」バッジ＋「保存時: 旧値」併記
- スナップショット更新はユーザーの「確認しました」操作のみ（acknowledgeInfo、
  履歴 info-ack）。ハードル指数の再判定とは独立（点数は無断で差し替えない）
- 旧バージョンで作った案件（infoSnapshot空）は差分なし扱い＋基準記録ボタンを表示

## 作業ログ

- 2026-07-17: Phase 1 完了。content雛形（3品目×3カ国＋国情勢3＋航路2＋procedures9＋
  国概要3＋自治体・乙仲・銀行チェックリスト雛形）、採点エンジン＋テスト20件、
  地球儀トップ（検索→回転→ズーム2.6/900ms→フェード→遷移）、結果画面
  （ハードル指数＋内訳パネル＋鮮度バッジ＋禁止分岐＋CTAプレビュー）。
- 2026-07-17: Phase 2 完了。Firebase Auth(Google)/Firestore対応＋ローカル保存
  フォールバック、案件保存（スナップショット・履歴）、案件一覧、ナビ画面
  （現在地バー・準備完成度%・3層バッジ・官庁確認ゲート・リキャップ・今日のTODO・
  内訳のハードル解消反映・再判定バナー・バイヤーメモ）。テスト34件。
  Firestoreセキュリティルールの整備とE2Eテストは未着手（Firebase実接続が前提）。
  Phase 3（PDF生成・乙仲リスト・メール下書き）は未着手。
- 2026-07-17: ステップ依存関係（requires）＋contract-draftステップを追加。
  「今日のTODO」を「いま着手できるステップ」（依存充足の未完了全件）に変更し、
  返事待ち中の先取り作業（契約書ドラフト・書類準備）を可視化。依存未達は
  ロック表示＋完了不可（StepLockedError）。テスト37件。
- 2026-07-17: ステップメモ（150文字・一行表示→展開編集）と、着手できる
  ステップからのジャンプ（スクロール＋ハイライト）を追加。テスト40件。
- 2026-07-17: Phase 3 完了。英文契約書ひな形（変数ハイライト・DRAFT透かし・
  未確認リスト刷り込み）、インボイス/PL（共有フォーム→PDF 2種）、港選定
  （最寄り＋東京の2択）→乙仲リスト→相談メール下書き（コピーのみ・送信なし）、
  銀行チェックリスト画面。ステップの tool: からツールへリンク。テスト49件。
- 2026-07-17: Phase 4 完了。区分B巡回スクリプト（npm run patrol）: 鮮度チェック＋
  情報源の差分検知＋確認キュー起票（自動書換なし）。/ops運用コンソール。
  実フェッチで5情報源のスナップショット取得と、擬似変更→キュー起票→resolved
  の一連の運用フローを検証済み。テスト58件。区分Aの都度取得（検索時API取得）は
  安定した公的データソース選定が必要なため未実装（静的md＋巡回でカバー）。
- 2026-07-17: 実ブラウザ全体検証（Playwright・50項目PASS）。手順を
  .claude/skills/verify/SKILL.md に記録。地域情報ページ＋変更検知
  （infoSnapshot比較・変更カードの脈動ハイライト・確認操作で解除）を追加。
  全ステップにツール導線（専用4ツール＋content/guides/の15ガイド）。テスト65件。
- 次回（完成に向けた候補）: ①Vercelデプロイ（外から触れるデモ化。Firebase使う
  なら環境変数設定）②ガイド・content文面の推敲 ③トップ/結果画面の演出磨き込み
  ④READMEのデモ手順整備 ⑤（任意）/opsのアクセス制限、日本語PDFフォント検討。
