---
name: verify
description: このリポジトリ（農産物輸出ナビ）の起動と全動線の動作確認手順
---

# 動作確認の手順

## 起動

```bash
npm run dev   # http://localhost:3000（初回コンパイルは各ページ数秒〜30秒）
```

- ポート3000が塞がっている場合は先に解放する（PowerShell）:
  `Get-NetTCPConnection -LocalPort 3000 -State Listen | % { Stop-Process -Id $_.OwningProcess -Force }`
- バックグラウンド起動したタスクをkillしてもNode子プロセスが残りやすい。
  ゾンビ状態のサーバは「Jest worker ... exceptions」でSSRが壊れるので必ず殺して再起動する

## 駆動（実ブラウザ）

Playwrightで駆動する（依存に入れていない）: `npm i --no-save playwright`
（Chromiumは `npx playwright install chromium`。インストール済みキャッシュあり）

- スクリプトは**プロジェクト直下**に置いて `node xxx.mjs` で実行（scratchpadからだとplaywrightを解決できない）
- クリップボード検証には `context.grantPermissions(["clipboard-read","clipboard-write"], {origin})` が必要
- PDFダウンロードは `page.waitForEvent("download")` で取れる。サイズ目安:
  契約書 約4.5KB / インボイス 約3KB / PL 約2.8KB（これ未満でも中身をReadで確認してから判断）

## 確認すべき主要動線

1. トップ: 地球儀描画（陸=ティール/日本=アンバー）、その他品目→相談案内で検索不可
2. 検索: りんご×台湾=B78 / りんご×香港=A92 / りんご×米国=D58（内訳4項目に対処案）
3. 保存→ナビ: ローカル保存モード、ゲート（gov-confirm）は未入力拒否、
   依存ロック（園地登録→検疫証明）、メモ150字、内訳の解消反映は
   台湾なら園地登録完了時点で1件のみが正
4. ツール: 契約書はゲート未完了でDRAFT透かし（PDF内に確認: 透かし＋OUTSTANDINGボックス）、
   インボイス合計自動計算、港選択→乙仲→メール差し込み
5. /ops: 鮮度テーブル15行＋キュー件数
6. 不正URL: /result?item=foo&country=bar → トップへリダイレクト
