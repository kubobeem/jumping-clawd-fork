# Jumping Clawd

Jumping Clawd は [WXT](https://wxt.dev/) で構築されたブラウザ拡張機能のミニゲームです。任意の Web ページ上にオーバーレイとして起動するか、スタンドアロンのタブでゲームを開くことができます。

## 多言語対応

Jumping Clawd は **英語**、**日本語**、**中文（簡体字）** に対応しています。言語はブラウザの言語設定に基づいて自動的に選択されます。

翻訳ファイルは `public/_locales/` に格納されています。

| ディレクトリ | 言語 |
|------------|------|
| `_locales/en/` | English |
| `_locales/ja/` | 日本語 |
| `_locales/zh_CN/` | 中文（简体） |

新しい言語を追加するには、`public/_locales/` の下に新しいディレクトリ（例：韓国語なら `ko/`）を作成し、既存のロケールファイルと同じメッセージキーを持つ `messages.json` ファイルを配置してください。

## 動作環境

- Node.js `>=20.12.0`（WXT `0.20.26` の要件）
- npm（`package-lock.json` で依存関係をロック）
- Chromium 系ブラウザ または Firefox（開発用拡張機能の読み込みに使用）

依存関係のインストール:

```bash
npm install
```

インストール後、WXT が `postinstall` フックで `.wxt/` の型定義とランタイムファイルを自動生成します。このディレクトリは生成物であり、コミット対象ではありません。

## 遊び方・操作方法

### ゲームの目的

Clawd を操作してプラットフォーム間をジャンプし、高みを目指します。天井（トップスパイク）と床（ボトムスパイク）に挟まれたステージで、いかに長く生き延びて高いスコアを獲得するかが勝負です。

### 基本操作

| 操作 | 説明 |
|------|------|
| **Space 長押し** | ジャンプのチャージ（離すとジャンプ） |
| **Space を離す** | チャージ量に応じてジャンプ |

### ゲームモード

Jumping Clawd には2つのゲームモードがあります。

**カジュアルモード**（`Ctrl + ,` で開始）

- クラシックなジャンプアクション
- プラットフォーム間をジャンプしてスコアを伸ばす
- 天井と床のスパイクに当たるとゲームオーバー

**チャレンジモード**（`Ctrl + .` で開始）

- 時間経過とともに床（ボトムスパイク）が上昇してくる
- 逃げ場が徐々に狭まる中でハイスコアを目指す
- より緊張感のある難易度

**Auto Play**（`Ctrl + A` でON/OFF切り替え）

- ゲーム内で自動プレイモードをON/OFFできます
- コンピュータが自動でプレイする様子を観察できます

**ゲームの終了**: `Esc` キーでオーバーレイを終了します。

### 表示モード

- **オーバーレイモード**: 現在見ているWebページの上にゲームが重なって表示されます。ページの背景が透けて見えます。
- **スタンドアロンタブ**: 新しい空白のタブでゲームが開きます。

### スコアとランキング

- ジャンプを重ねるごとにスコアが加算されます
- ゲームオーバー時にスコアをランキングに送信できます
- ランキングは Supabase を使用して管理されています

## インストール方法

### ビルド済みパッケージからインストール

1. [Releases](https://github.com/あなたのリポジトリ/releases) から最新の `.zip` ファイルをダウンロードします
   - Chrome / Chromium: `jumping-clawd-0.2.0-chrome.zip`
   - Firefox: `jumping-clawd-0.2.0-firefox.zip`
2. ブラウザの拡張機能管理画面を開きます
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Firefox: `about:addons`
3. **デベロッパーモード**（Chrome/Edgeの場合）を有効にします
4. 「パッケージ化されていない拡張機能を読み込む」（Chrome/Edge）または「ファイルからアドオンをインストール」（Firefox）でダウンロードしたzipを選択します

### ソースコードからビルド

```bash
# 依存関係のインストール
npm install

# Chrome用ビルド
npm run build

# Firefox用ビルド
npm run build:firefox

# ZIPパッケージの作成
npm run zip        # Chrome用
npm run zip:firefox # Firefox用
```

## プロジェクト構成

```
jumping-clawd-fork/
├── wxt.config.ts              # 拡張機能マニフェスト設定（権限、アイコン、ショートカット、リソース）
├── tsconfig.json               # TypeScript設定
├── package.json                # 依存関係とスクリプト
├── AGENTS.md                   # AIエージェント用の開発メモ
│
├── entrypoints/                # 拡張機能のエントリーポイント
│   ├── background.ts           # バックグラウンドスクリプト（ショートカットキー処理）
│   ├── game.html               # ゲームページHTML（オーバーレイとスタンドアロンの両方で使用）
│   ├── mascot-content.ts       # マスコット用コンテンツスクリプト
│   └── page-game-overlay.ts    # ページオーバーレイスクリプト（iframe生成、メッセージ通信）
│
├── src/
│   ├── extension/              # 拡張機能側の共通ロジック
│   │   ├── open-game.ts        # ゲーム起動戦略（オーバーレイ/スタンドアロン）
│   │   ├── open-mascot.ts      # マスコット起動処理
│   │   ├── backdrop-blur.ts    # 背景ブラー設定の保存/読み込み
│   │   └── messages.ts         # メッセージ型定義
│   │
│   ├── game/                   # ゲームロジック
│   │   ├── config.js           # ゲームパラメータ設定
│   │   ├── app.js              # ゲームステートマシン、入力処理、衝突判定、スコアリング
│   │   ├── clawd-motion.js     # キャラクターアニメーション
│   │   ├── leaderboard.js      # Supabase連携のランキング機能
│   │   └── styles.css          # ゲームスタイル
│   │
│   └── mascot/                 # Clawdマスコット機能（v0.2.0 新機能）
│       ├── types.ts            # 型定義
│       ├── renderer.ts         # 描画エンジン
│       ├── behaviors.ts        # 行動パターン（追従、ランダム移動、バウンド）
│       ├── styles.ts           # スタイル定義
│       └── interactions.ts     # インタラクション処理（なでなで、ドラッグ）
│
├── public/
│   ├── icon/                   # 拡張機能アイコン
│   └── _locales/               # 多言語翻訳ファイル
│       ├── en/messages.json
│       ├── ja/messages.json
│       └── zh_CN/messages.json
│
├── components/
│   └── counter.ts              # WXTサンプルコンポーネント
│
└── assets/                     # ビルド生成アセット
```

## 開発環境セットアップ

### 開発サーバーの起動

```bash
# Chrome/Chromium 開発モード
npm run dev

# Firefox 開発モード
npm run dev:firefox
```

`npm run dev` を実行すると、WXT が拡張機能をビルドし、ブラウザが起動します。開発中はコードの変更が自動で反映されます。

### 型チェック

```bash
npm run compile
```

### ビルド・パッケージング

```bash
# 本番ビルド
npm run build          # Chrome用
npm run build:firefox  # Firefox用

# ZIPパッケージの作成（公開用）
npm run zip            # Chrome用
npm run zip:firefox    # Firefox用
```

### 開発の注意点

`AGENTS.md` に記載の通り、開発中は `npm run dev` を使用して動作確認を行います。プルリクエスト前など、必要に応じて型チェック（`npm run compile`）とビルド（`npm run build`）を実行してください。

## カスタマイズ方法

### ゲームパラメータの調整

`src/game/config.js` で以下のパラメータを調整できます。

- プラットフォーム間の距離
- ジャンプのタイミングと速度
- キャラクターサイズ
- スパイク（天井・床）の高さ
- チャージメーターの設定
- チャレンジモードの難易度パラメータ（床の上昇速度など）

### アニメーションの調整

`src/game/clawd-motion.js` で Clawd のジャンプポーズ、ストレッチ、スミア（残像）、腕のアニメーションを調整できます。

### スタイルの変更

`src/game/styles.css` でステージ、キャラクター、プラットフォーム、スパイク、ゲームオーバーパネルのスタイルを変更できます。

### ランキング（リーダーボード）の設定

`src/game/leaderboard.js` で Supabase の設定を変更できます。

- REST APIのURL
- 公開可能キー（publishable key）
- テーブルフィールド

変更時には `wxt.config.ts` の `host_permissions` も併せて更新してください。また、Supabase 側の RLS（Row Level Security）ポリシーも適切に設定する必要があります。

### 新しい言語の追加

1. `public/_locales/` の下に新しいディレクトリを作成（例：`ko/`）
2. 既存のロケールファイルを参考に `messages.json` を作成
3. 全てのメッセージキーをカバーする

## Git管理について

### コミットすべきファイル

- `package.json`, `package-lock.json`
- `wxt.config.ts`, `tsconfig.json`
- `entrypoints/`, `src/`, `public/`, `assets/`, `components/`
- `AGENTS.md`, `readmeja.md`, `release-notes.md`

### コミットしないファイル（.gitignore で除外済み）

- `node_modules/` - 依存関係（`npm install` で復元）
- `.wxt/` - WXTのビルド生成物
- `.output/` - 出力ファイル
- `out/` - 出力ファイル
- `.env*` - 環境変数ファイル
- `.DS_Store` - macOSのメタデータ

## フォークについて

本プロジェクトは Jumping Clawd のフォークです。フォーク元からの主な変更点は以下の通りです。

- 多言語対応（日本語・中国語の追加）
- Clawd Browser Mascot 機能の追加（v0.2.0）
- UIのローカライズ
- バグ修正と改善

詳細な変更履歴は [release-notes.md](./release-notes.md) を参照してください。
