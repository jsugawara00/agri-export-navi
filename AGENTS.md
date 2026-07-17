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

## 作業ログ

- 2026-07-17: Phase 1 完了。content雛形（3品目×3カ国＋国情勢3＋航路2＋procedures9＋
  国概要3＋自治体・乙仲・銀行チェックリスト雛形）、採点エンジン＋テスト20件、
  地球儀トップ（検索→回転→ズーム2.6/900ms→フェード→遷移）、結果画面
  （ハードル指数＋内訳パネル＋鮮度バッジ＋禁止分岐＋CTAプレビュー）。
  Phase 2（Firebase Auth/Firestore・案件保存・ナビ画面）は未着手。
