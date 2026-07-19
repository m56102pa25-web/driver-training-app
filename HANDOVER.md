# 引き継ぎメモ — ジャパンフーズ物流 乗務員業務ガイドアプリ

最終更新: 2026-07-18（新人研修用PDF作成まで完了）

## アプリ概要
- **種類**: 単一HTMLファイルのPWA（Progressive Web App）
- **URL**: https://m56102pa25-web.github.io/driver-training-app/
- **リポジトリ**: https://github.com/m56102pa25-web/driver-training-app
- **ホスティング**: GitHub Pages（pushすれば1〜2分で自動反映）
- **主なファイル**: `index.html`（本体）、`sw.js`（Service Worker）、`hero.jpg`（会社概要の画像）、`manifest.json`

## 現在の実装状態（動作確認済み）

### デザイン仕様
- 白ベース、アクセントカラー：`#007AFF`（iOSブルー）
- フォント：Noto Sans JP
- ヘッダー：白背景・青い小テキスト（会社名）＋黒太字「業務ガイド」＋🔍検索ボタン
- タブバー：角丸8pxの四角いタグスタイル（選択中→青塗り白文字、未選択→グレー）
- コンテンツ：白カード＋ステップ番号バッジ

### UI機能
- **ヘッダー固定**: `.app`のflexレイアウトで実現（`position: sticky`は使っていない）
- **横スワイプ**: CSS `scroll-snap-type: x mandatory` によるネイティブスクロール
- **タブとスワイプの同期**: scrollイベント＋デバウンス80msで同期
- **アコーディオン**: steps typeの各タブで、タイトルのみ表示→タップで展開。タブ切替時に自動リセット（閉じる）
- **検索機能**: ヘッダー🔍→全タブ横断キーワード検索、結果タップでジャンプ＆自動展開
- **起動演出**: 白画面フェードイン→ヒーロー画像が顔アップから高速ズームアウト（`transform-origin: 68% 28%` が顔の位置）
- **ピンチズーム有効**（ただしiPhoneのホーム画面アプリモードではApple仕様で効かない。Safari/Mac/Androidでは有効）

### タブ一覧（11個）
| id | ラベル | type | 状態 |
|---|---|---|---|
| company | 会社概要 | company | 完成（ヒーロー画像・リンク・緊急連絡先あり） |
| checkin | 出勤時 | steps | 完成 |
| inspection | 車両点検準備 | steps | 完成 |
| loading | 荷積み | steps | 完成 |
| departure | 出発前 | steps | 完成 |
| delivery | 納品時 | steps | 完成 |
| unloading | 空卸し | steps | 完成 |
| checkout | 退勤時 | steps | 完成 |
| accident | 事故時の対応 | steps | プレースホルダー（材料あり・未実装） |
| illness | 体調不良時 | steps | プレースホルダー（材料あり・未実装） |
| **extra** | 社内安全ルール | steps | 01〜03まで追記済み（続きあり） |

**注意: 社内安全ルールタブのidは `safety` ではなく `extra`**（コード内検索時に間違えやすい）

### 社内安全ルール（extraタブ）の追記状況
| no | タイトル | 元資料 | 状態 |
|---|---|---|---|
| 01 | 安全スローガン「止まれ・待て・譲れ・近づくな」 | 止まれ・待て・譲れ・近づくな　についての教育.pdf | ✅ 実装済み |
| 02 | 後退時降車確認（8ポイント、①三角コーンが最重要） | 後退事故防止教育.pptx | ✅ 実装済み |
| 03 | 大地震が発生した時の初動対応（【運転中】【運転中以外】【営業所への連絡】の3ブロック） | ②大地震が発生した時の初動対応手順書（ドライバー用）...pdf | ✅ 実装済み（2026-07-18） |
| 04〜 | ユーザーがファイルを順次フォルダに入れて指示する方式 | — | 未定 |

**追記の進め方（確立済みの手順）**:
1. ユーザーが資料ファイルを作業フォルダに入れて「入れたよ」と言う
2. 資料を読んで要点を01〜03と同じ形式でまとめて提案（**タイトルと内容のみ、注意欄なし**。項目間は`\n\n`で空行区切り）
3. ユーザーのGOサインを待ってから実装（構成の修正指示が入ることが多い）
4. sw.jsのバージョン+1 → commit → push

### 会社概要タブ
- ヒーロー画像 `hero.jpg`（外部ファイル、GPT Image 2生成のJFLイラスト）
- 埼玉営業所リンク：`https://www.jf-logistics.jp/saitama/`
- 緊急連絡先：04-2955-0311（埼玉営業所）

### Service Worker
- キャッシュ名: `jfl-guide-v25`（**変更時は必ず+1する**）
- 方式: ネットワーク優先（最新版を即反映、オフライン時はキャッシュで動作）

---

## コードの重要ポイント

### CSS（index.html内）
```css
/* フレックスレイアウト（ヘッダー固定の核心） */
.app { display: flex; flex-direction: column; height: 100%; }
.sticky-top { flex-shrink: 0; }

/* 横スワイプ */
.panels-wrapper {
  flex: 1; display: flex;
  overflow-x: auto; scroll-snap-type: x mandatory;
  overscroll-behavior-x: contain;
}
.panel { flex-shrink: 0; width: 100%; scroll-snap-align: start; overflow-y: auto; }

/* アコーディオン */
.step-content { display: none; }
.step-card.open .step-content { display: block; }
.step-card.open .step-chevron { transform: rotate(180deg); }

/* 起動演出 */
.company-hero { transform-origin: 68% 28%; animation: heroIn 0.8s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
.splash { position: fixed; inset: 0; background: #fff; z-index: 100; animation: splashOut 0.7s ease 0.1s both; }
```

### JS（index.html内）の主要関数
- `renderTabBar()` / `renderContent(tab, target)` / `renderAllPanels()`
- `switchTab(id)`: タブ切替（アコーディオンリセット含む）
- `closeAccordion(tabId)`: 指定タブのアコーディオンを全閉じ
- 検索: `SEARCH_INDEX`構築、`closeSearch()`、`highlight()`、`goToResult(tabId, stepIdx)`

### ステップデータ形式
```javascript
{ no: '01', title: 'タイトル', desc: '説明文（\n\nで空行区切り）', point?: '補足', caution?: '注意' }
```
※ 社内安全ルールでは point / caution は使わない方針（ユーザー指示）

---

## 新人研修用PDF（2026-07-18作成）
- `業務ガイド_新人研修用.pdf` — アプリの全stepsタブ（会社概要以外の10章）をアプリ風デザイン（白ベース＋青アクセント）でA4化したもの。新人乗務員向け配布資料
- 生成ツール: `make_pdf_html.js`（プロジェクト直下、**コミットしない**）
  - 使い方: `node make_pdf_html.js <出力先フォルダ>` → `pdf-source.html` が生成される → headless Chromeの `--print-to-pdf` でPDF化
  - index.htmlのTABSデータを自動抽出するので、アプリ更新後に再実行すれば常に最新版PDFが作れる
- 注意: PDF内の「事故時の対応」「体調不良時」章はアプリ同様プレースホルダー内容。正式版反映後に再生成が必要

## 今後の予定（未実装）
1. **事故時の対応タブ**: 材料 `事故時の対応.txt` がフォルダに準備済み（未読・未実装）
2. **体調不良時タブ**: 材料 `jomu_taichofuryo_manual.txt` あり（内容確認済み・未実装）
3. **社内安全ルール04以降**: ユーザーが資料を順次提供予定
4. **パスワード認証**: 社員配布時に実装予定（現在ベータ版なので不要とユーザー明言）
5. **文字サイズ切替ボタン**: iPhoneアプリモードでピンチズームが効かない代替案として提案済み（指示があれば実装）

---

## デプロイ手順
```bash
git add index.html sw.js   # 変更したファイルを追加
git commit -m "変更内容のメモ"
git push origin main
# → 1〜2分でGitHub Pagesに反映
```
※ `sw.js`のキャッシュ番号（現在v25）を毎回+1すること
※ 資料ファイル（PDF・txt・pptx）はコミットしない（ローカル参照用）

---

## ユーザーとの作業スタイル（重要）
- 応答は常に日本語。プログラミング初心者なので専門用語には短い説明を添える
- **可否を尋ねる段階では作業せず、GOサインを待つ**（構成案を見せて承認をもらってから実装）
- 音声入力のため誤変換が多い（文脈から意図を汲む）
- 実機（iPhone）で確認するスタイル。公開後は「アプリを開き直せば反映される」と伝える
- 数十秒以上かかる処理は目安時間を先に伝える

---

## 過去に解決した問題（再発時の参考）
| 問題 | 原因 | 解決策 |
|---|---|---|
| ヘッダーが固定されない | `overflow-x: hidden`がiOS Safariで`position: sticky`を無効化 | flexレイアウトに変更 |
| タブ切替時に画面が上下にバウンス | `-webkit-overflow-scrolling: touch` | 削除 |
| スワイプとタブが連動しない | JSスワイプハンドラとCSSの競合 | JSハンドラ削除、scroll-snapのみで管理 |
| index.htmlがReadで読めない | （解決済み）以前はbase64画像で巨大だった | 現在は画像分離済みで普通に読める（39KB） |
| Downloadsフォルダのファイルが読めない | MacのセキュリティでClaudeからアクセス不可 | ユーザーに作業フォルダへ入れてもらう |
| プレビューでアニメーションが進まない | プレビュー環境は`visibilityState: hidden`でCSSアニメの時計が止まる | `anim.currentTime`を手動で進めて検証 |
| SSL証明書警告 | jf-logistics.jpの証明書の一時的な問題 | アプリ側は無関係、時間が経てば自動解決 |
