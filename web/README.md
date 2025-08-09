# SIXTAR GATE STARTRAIL Score Management Web Application

Next.js製のSIXTAR GATE STARTRAILスコア管理Webアプリケーションです。

## 🎯 概要

このアプリケーションは、score-extractorで抽出されたスコアデータを管理・可視化するためのWebインターフェースを提供します。

### 主な機能

- **認証システム**: Google OAuthによる安全なユーザー認証
- **リアルタイムスコア取得**: score-extractor APIからの自動ポーリング
- **スコア編集**: 抽出データの確認・修正機能
- **データ可視化**: 進捗状況やスコア推移のグラフ表示
- **レスポンシブUI**: モバイル対応のモダンなインターフェース

## 🛠️ 技術スタック

### フレームワーク・ライブラリ

- **[Next.js 15](https://nextjs.org/)** - Reactフレームワーク（App Router）
- **[TypeScript](https://www.typescriptlang.org/)** - 型安全な開発
- **[React 19](https://react.dev/)** - UIライブラリ
- **[Tailwind CSS](https://tailwindcss.com/)** - ユーティリティファーストCSS

### データ管理

- **[Prisma](https://www.prisma.io/)** - TypeScript ORM
- **[PostgreSQL](https://www.postgresql.org/)** - リレーショナルデータベース
- **[TanStack Query](https://tanstack.com/query)** - サーバー状態管理

### 認証

- **[NextAuth.js v5](https://authjs.dev/)** - 認証ライブラリ（Beta）
- **Google OAuth** - ソーシャルログイン

### UIコンポーネント

- **[shadcn/ui](https://ui.shadcn.com/)** - Radix UIベースのコンポーネント
- **[React Hook Form](https://react-hook-form.com/)** - フォーム管理
- **[Zod](https://zod.dev/)** - スキーマバリデーション

### 開発ツール

- **[pnpm](https://pnpm.io/)** - パッケージマネージャー
- **[Biome](https://biomejs.dev/)** - コードフォーマッター
- **[ESLint](https://eslint.org/)** - リンター
- **[Docker Compose](https://docs.docker.com/compose/)** - 開発環境構築

## 📁 プロジェクト構造

```
web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # APIルート
│   │   │   ├── auth/           # NextAuth.js認証API
│   │   │   └── results/        # スコアデータAPI
│   │   ├── auth/               # 認証ページ
│   │   ├── results/            # スコア管理ページ
│   │   └── page.tsx            # ホームページ
│   ├── components/             # Reactコンポーネント
│   │   ├── auth/               # 認証関連
│   │   ├── edit-result/        # スコア編集
│   │   ├── polling/            # APIポーリング
│   │   ├── score-edit-dialog/  # スコア編集ダイアログ
│   │   └── ui/                 # UIコンポーネント
│   ├── application/            # ビジネスロジック
│   │   └── result-validation.ts # バリデーションスキーマ
│   ├── lib/                    # ユーティリティ
│   │   ├── auth.ts             # NextAuth設定
│   │   ├── db.ts               # Prismaクライアント
│   │   └── api-client.ts       # APIクライアント
│   └── middleware.ts           # 認証ミドルウェア
├── prisma/
│   ├── schema.prisma           # データベーススキーマ
│   └── migrations/             # マイグレーションファイル
├── scripts/
│   └── insert-musics.ts        # 楽曲データ初期化スクリプト
└── public/                     # 静的ファイル

```

## 🚀 セットアップ

### 前提条件

- Node.js 20以上
- pnpm 10.12.1
- PostgreSQL 14以上
- Google OAuth認証情報

### インストール手順

#### 1. 依存関係のインストール

```bash
pnpm install
```

#### 2. 環境変数の設定

```bash
# .env.localファイルを作成
cp .env.example .env.local
```

`.env.local`を編集：

```env
# PostgreSQL接続情報
POSTGRES_PRISMA_URL=postgresql://user:password@localhost:5432/sixtar_scores?schema=public&pgbouncer=true
POSTGRES_URL_NON_POOLING=postgresql://user:password@localhost:5432/sixtar_scores?schema=public

# NextAuth.js設定
AUTH_SECRET=your-secret-key  # openssl rand -base64 32 で生成
AUTH_GOOGLE_ID=your-google-oauth-client-id
AUTH_GOOGLE_SECRET=your-google-oauth-client-secret
```

#### 3. データベースのセットアップ

```bash
# Docker Composeで開発用PostgreSQLを起動
docker compose -f docker-compose.dev.yml up -d

# Prismaクライアントの生成
pnpm prisma-local generate

# データベーススキーマの適用
pnpm prisma-local db push

# 楽曲データの初期化
pnpm script scripts/insert-musics.ts
```

#### 4. 開発サーバーの起動

```bash
pnpm dev
```

http://localhost:3000 でアプリケーションにアクセスできます。

## 📝 利用可能なスクリプト

```bash
# 開発サーバー（Turbopack使用）
pnpm dev

# プロダクションビルド
pnpm build

# プロダクションサーバー起動
pnpm start

# コードの静的解析
pnpm lint

# コードフォーマット
pnpm format

# フォーマットチェック
pnpm format:check

# TypeScriptスクリプト実行（環境変数付き）
pnpm script <script-path>

# Prismaコマンド実行（環境変数付き）
pnpm prisma-local <command>
```

## 🗄️ データベース

### Prisma Studio

データベースの内容を視覚的に確認・編集：

```bash
pnpm prisma-local studio
```

### マイグレーション

スキーマ変更時：

```bash
# マイグレーションファイルの生成
pnpm prisma-local migrate dev --name <migration-name>

# マイグレーションの適用
pnpm prisma-local migrate deploy
```

### 主要なモデル

- **User**: ユーザー情報（Google認証連携）
- **Music**: 楽曲マスタデータ
- **Chart**: 譜面情報（難易度・ノート数）
- **Result**: プレイ結果データ

## 🔌 API統合

### score-extractor連携

アプリケーションは定期的にscore-extractor APIをポーリングして新規スコアを取得します。

```typescript
// ポーリング設定
const POLLING_INTERVAL = 60000; // 1分
const API_URL = 'http://localhost:6433/api/v1/scores';
```

### エンドポイント

- `GET /api/results` - スコア一覧取得
- `POST /api/results/save` - スコア保存
- `POST /api/results/batch-save` - 複数スコア一括保存

## 🎨 UIコンポーネント

### shadcn/ui

新しいコンポーネントの追加：

```bash
pnpm dlx shadcn@latest add <component-name>
```
## 🔒 認証

NextAuth.js v5を使用したGoogle OAuth認証を実装しています。

### 保護されたルート

`middleware.ts`で以下を除くすべてのルートが保護されています：

- `/auth/sign-in` - ログインページ
- `/api/auth/*` - 認証API

### セッション取得

```typescript
import { auth } from '@/lib/auth';

const session = await auth();
if (!session?.user) {
  // 未認証
}
```

## 🐛 デバッグ

### ログ確認

```bash
# Next.jsサーバーログ
pnpm dev

# Prismaクエリログ
export DEBUG="prisma:query"
pnpm dev
```

### よくある問題

#### データベース接続エラー

1. PostgreSQLが起動しているか確認
2. `.env.local`の接続情報を確認
3. `docker compose logs`でDockerログを確認

#### 認証エラー

1. Google OAuth認証情報を確認
2. `AUTH_SECRET`が設定されているか確認
3. リダイレクトURLが正しく設定されているか確認

## 🚢 デプロイ

### Vercelへのデプロイ

1. Vercelアカウントでプロジェクトを作成
2. 環境変数を設定
3. GitHubリポジトリと連携
4. 自動デプロイ設定

### 環境変数（本番環境）

Vercelダッシュボードで以下を設定：

- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`

## 📚 関連ドキュメント

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://authjs.dev)
- [shadcn/ui Documentation](https://ui.shadcn.com)

## 🤝 開発ガイドライン

### コードスタイル

- Biomeによる自動フォーマット
- タブインデント、120文字行長制限
- インポートの自動整理

### コミット規約

- feat: 新機能
- fix: バグ修正
- docs: ドキュメント更新
- refactor: リファクタリング
- test: テスト追加・修正
- chore: その他の変更
