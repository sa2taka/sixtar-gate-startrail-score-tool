# SIXTAR GATE STARTRAIL Score Management System

音楽ゲーム「SIXTAR GATE STARTRAIL」のスコアを自動的に抽出・管理するための統合システムです。

## 🎮 概要

このシステムは、ゲームのスクリーンショットからOCR技術を使用してスコア情報を自動抽出し、Webアプリケーションで管理・可視化する機能を提供します。

### 主な機能

- **自動スコア抽出**: ゲームのリザルト画面から自動的にスコア情報を抽出
- **スコア管理**: 個人のプレイ履歴を一元管理
- **進捗可視化**: 難易度別クリア状況、スコア推移をグラフで確認
- **データ編集**: 抽出されたデータの確認・修正機能

## 🏗️ システム構成

```
sixtar-gate-startrail-score-tool/
├── score-extractor/        # Go製OCRスコア抽出ツール
├── web/                    # Next.js製管理Webアプリケーション  
├── music-information-scraping/  # 楽曲メタデータ収集ツール
└── projects/               # プロジェクトドキュメント
```

### コンポーネント詳細

#### 1. score-extractor (Go)
- Tesseract OCRを使用したスコア画像解析
- HTTP APIサーバー機能
- リアルタイムファイル監視

#### 2. web (Next.js)
- スコアデータの管理UI
- Google OAuth認証
- PostgreSQLデータベース連携

#### 3. music-information-scraping (TypeScript)
- 公式サイトから楽曲情報を自動収集
- `musicInformation.json`の生成・更新

## 🚀 クイックスタート

### 必要な環境

- **Go** 1.20以上
- **Node.js** 20以上 / **pnpm** 10.12.1
- **PostgreSQL** 14以上
- **Tesseract OCR** 5.0以上（日本語・韓国語パック含む）
- **Google OAuth** クライアント認証情報

### セットアップ手順

#### 1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/sixtar-gate-startrail-score-tool.git
cd sixtar-gate-startrail-score-tool
```

#### 2. Tesseract OCRのインストール

**Windows:**
1. [UB Mannheim](https://github.com/UB-Mannheim/tesseract/wiki)から最新版をダウンロード
2. インストール時に日本語(jpn)と韓国語(kor)の言語パックを選択
3. 環境変数PATHに`C:\Program Files\Tesseract-OCR`を追加

**macOS:**
```bash
brew install tesseract
brew install tesseract-lang  # 全言語パック
```

**Linux:**
```bash
sudo apt-get install tesseract-ocr tesseract-ocr-jpn tesseract-ocr-kor
```

#### 3. score-extractorのセットアップ

```bash
cd score-extractor

# 設定ファイルの準備
cp config.toml.example config.toml
# config.tomlを編集して監視ディレクトリを設定

# ビルド
go build -o score_extractor main.go

# テスト実行
go test ./...
```

#### 4. データベースのセットアップ

```bash
cd web

# Docker Composeで開発用PostgreSQLを起動
docker compose -f docker-compose.dev.yml up -d

# 環境変数の設定
cp .env.example .env.local
# .env.localを編集してデータベース接続情報とGoogle OAuth認証情報を設定
```

#### 5. Webアプリケーションのセットアップ

```bash
# 依存関係のインストール
pnpm install

# Prismaのセットアップ
pnpm prisma-local generate
pnpm prisma-local db push

# 楽曲データの初期化
cd ../music-information-scraping
pnpm install
pnpm tsx index.ts  # musicInformation.jsonを生成

cd ../web
pnpm script scripts/insert-musics.ts  # データベースに楽曲情報を登録
```

#### 6. 開発サーバーの起動

**Terminal 1: score-extractor**
```bash
cd score-extractor
./score_extractor serve --config config.toml
# http://localhost:6433 でAPIサーバーが起動
```

**Terminal 2: Next.js**
```bash
cd web
pnpm dev
# http://localhost:3000 でWebアプリケーションが起動
```

## 📖 使い方

### 基本的なワークフロー

1. **スクリーンショットの保存**
   - ゲームのリザルト画面をスクリーンショット
   - 設定した監視ディレクトリに保存

2. **自動スコア抽出**
   - score-extractorが自動的に画像を解析
   - 抽出されたデータがAPIで提供される

3. **Webアプリでの確認・編集**
   - http://localhost:3000 にアクセス
   - Googleアカウントでログイン
   - 新規スコアの確認ダイアログが表示
   - 必要に応じてデータを修正して保存

4. **進捗の確認**
   - ダッシュボードで統計情報を確認
   - グラフでスコア推移を可視化

## 🛠️ 開発

### プロジェクト構造

```
.
├── CLAUDE.md               # AI開発アシスタント用ガイド
├── biome.json              # コードフォーマッター設定
├── score-extractor/        
│   ├── cmd/                # CLIコマンド実装
│   ├── internal/           # 内部パッケージ
│   │   ├── extract/        # OCR・データ抽出ロジック
│   │   ├── imageproc/      # 画像処理
│   │   ├── music_info/     # 楽曲情報管理
│   │   └── server/         # HTTPサーバー
│   └── testdata/           # テスト用画像
├── web/
│   ├── src/
│   │   ├── app/            # Next.js App Router
│   │   ├── components/     # Reactコンポーネント
│   │   ├── lib/            # ユーティリティ
│   │   └── application/    # ビジネスロジック
│   └── prisma/             # データベーススキーマ
└── projects/               # ドキュメント・仕様書

```

### 開発コマンド

#### score-extractor (Go)
```bash
go test ./...              # 全テスト実行
go test ./internal/extract  # 特定パッケージのテスト
go build                   # ビルド
```

#### web (Next.js)
```bash
pnpm dev                   # 開発サーバー起動（Turbopack）
pnpm build                 # プロダクションビルド
pnpm lint                  # ESLint
pnpm format                # コードフォーマット（Biome）
pnpm prisma-local studio   # Prisma Studio起動
```

### テスト

- **score-extractor**: `testdata/`ディレクトリにテスト用画像を配置
- **web**: React Testing Library / Playwright（予定）

## 🔧 設定

### 環境変数 (web/.env.local)

```bash
# PostgreSQL
POSTGRES_PRISMA_URL=postgresql://user:password@localhost:5432/sixtar_scores?schema=public&pgbouncer=true
POSTGRES_URL_NON_POOLING=postgresql://user:password@localhost:5432/sixtar_scores?schema=public

# NextAuth.js
AUTH_SECRET=your-secret-key  # openssl rand -base64 32
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

### score-extractor設定 (config.toml)

```toml
[api]
port = 6433

[monitoring]
directory = "./screenshots"  # スクリーンショット保存ディレクトリ
```

## 📊 データベーススキーマ

主要なテーブル：

- **User**: ユーザー情報（Google OAuth連携）
- **Music**: 楽曲マスタデータ
- **Chart**: 譜面情報（難易度・ノート数）
- **Result**: プレイ結果データ

詳細は`web/prisma/schema.prisma`を参照してください。
