# SIXTAR GATE STARTRAIL スコア管理アプリケーション 設計書

## 1. システム概要

SIXTAR GATE STARTRAILのスコアを自動的に取得・管理し、ユーザーごとの進捗や成績を可視化するWebアプリケーション。

## 2. 技術スタック

### フロントエンド
- Next.js 15
- TailwindCSS
- React Query
- NextAuth.js（Google認証）
- Chart.js（グラフ表示）
- React Hot Toast（通知）

### バックエンド
- Next.js API Routes
- Prisma（ORM）
- PostgreSQL（Vercel Postgres）

### インフラ
- Vercel（ホスティング）
- Vercel Postgres（データベース）
- Vercel Storage（

## 3. 機能要件

### 3.1 認証機能
- Googleアカウントでのログイン/ログアウト
- セッション管理
- 認証状態に基づくルーティング制御

### 3.2 スコアデータ管理
- score-extractorとの連携
  - WebSocket接続によるリアルタイムデータ取得
  - 定期的なポーリング（バックアップ）
  - エラー時の再接続処理
- データ検証
  - 必須項目の確認
  - 値の範囲チェック
  - 重複データの検出
- データ修正
  - 手動データ編集機能
  - 編集履歴の保存
  - 一括編集機能

### 3.3 データ表示・分析
- スコア一覧表示
  - ページネーション
  - ソート機能
  - フィルター機能（難易度、クリア状況等）
- グラフ表示
  - スコア推移
  - 難易度別クリア率
  - 判定分布
- 統計情報
  - 総プレイ回数
  - 平均スコア
  - フルコンボ率
- カスタムフィルター
  - 複数条件の組み合わせ
  - フィルター設定の保存

### 3.4 通知機能
- 新規スコア取得時の通知
- エラー発生時の通知
- 目標達成時の通知

## 4. データベース設計

### Users
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Musics
```sql
CREATE TYPE type AS ENUM ('solar', 'lunar');
CREATE TYPE level AS ENUM ('comet', 'nova', 'supernova', 'quaser', 'starlight', 'mystic')

CREATE TABLE music_difficulties (
  music_id PRIMARY_KEY REFERENCES music(id),
  type type PRIMARY KEY,
  level level PRIMARY KEY,
  notes INT NOT NULL,
  combo INT NOT NULL,
);

CREATE TABLE musics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  english_name TEXT,
  bpm INTEGER NOT NULL,
  music_length INTEGER NOT NULL,
  link TEXT NOT NULL,
);
```


### Scores
```sql
CREATE TYPE hazard AS ENUM ('default', 'LV1', 'LV2', 'LV3', 'DEADEND', 'SUDDEN');
CREATE TYPE pattern AS ENUM('DEFAULT', 'MIRROR', 'RANDOM')

CREATE TABLE scores (
  id UUID PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  music_id TEXT REFERENCES music(id),
  difficulty TEXT NOT NULL,
  mode TEXT NOT NULL,
  score INTEGER NOT NULL,
  blue_star INTEGER NOT NULL,
  white_star INTEGER NOT NULL,
  yellow_star INTEGER NOT NULL,
  red_star INTEGER NOT NULL,
  is_full_combo BOOLEAN NOT NULL,
  hazard hazard NOT NULL,
  pattern PATTERN NOT NULL,
  played_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### UserSettings
```sql
CREATE TABLE user_settings (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  score_extractor_url TEXT,
  polling_interval INTEGER DEFAULT 5000,
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### SavedFilters
```sql
CREATE TABLE saved_filters (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  name TEXT NOT NULL,
  filter_config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 5. API設計

### 認証関連
- POST /api/auth/signin
- POST /api/auth/signout
- GET /api/auth/session

### スコア関連
- GET /api/scores
- POST /api/scores
- PUT /api/scores/:id
- DELETE /api/scores/:id
- GET /api/scores/stats
- GET /api/scores/graph-data

### 設定関連
- GET /api/settings
- PUT /api/settings
- GET /api/filters
- POST /api/filters
- PUT /api/filters/:id
- DELETE /api/filters/:id

## 6. フロントエンド構成

### ページ構成
- / - ホーム/ダッシュボード
- /scores - スコア一覧
- /stats - 統計情報
- /settings - 設定
- /profile - プロフィール

### コンポーネント設計
- Layout
  - Header
  - Sidebar
  - Footer
- Authentication
  - LoginButton
  - UserMenu
- Scores
  - ScoreTable
  - ScoreCard
  - ScoreFilter
  - ScoreEditor
- Stats
  - StatsSummary
  - ScoreGraph
  - DifficultyChart
  - JudgementChart
- Common
  - Button
  - Input
  - Select
  - Modal
  - Toast
  - Loading

## 7. セキュリティ対策

### 認証・認可
- NextAuth.jsによる安全な認証
- JWTトークンの適切な管理
- CSRF対策
- Rate Limiting

### データ保護
- データの暗号化
- バックアップ体制
- アクセス制御

### エラー処理
- 適切なエラーログ
- ユーザーフレンドリーなエラー表示
- リカバリー処理

## 8. パフォーマンス最適化

### フロントエンド
- 画像の最適化
- コンポーネントの遅延読み込み
- キャッシュ戦略
- バンドルサイズの最適化

### バックエンド
- クエリの最適化
- インデックス設計
- キャッシュ層の導入
- コネクションプーリング

## 9. 開発フロー

1. 環境構築
   - プロジェクトの初期化
   - 必要なパッケージのインストール
   - 開発環境の設定

2. 基本機能の実装
   - 認証機能
   - データベース連携
   - score-extractor連携

3. UI実装
   - コンポーネント開発
   - レスポンシブデザイン
   - アニメーション

4. テスト
   - ユニットテスト
   - 統合テスト
   - E2Eテスト

5. デプロイ
   - Vercelへのデプロイ
   - Supabaseのセットアップ
   - 本番環境の設定

## 10. 開発環境

DBはDockerのpostgresql。

`docker compose up` で立ち上がること。また永続化されていること。

## 11. その他

### ローカルのfetchの仕様

```typescript
type ScoreData = {
  file_path: string;
  image_binary: string;
  mod_time: string;
  kind: 'result' | 'select'
  music: {
    id: string | null;
    name: string | null;
    englishName: string | null;
  } | null;
  difficulty: 'comet' | 'nova' | 'supernova' | 'quasar' | 'starlight' | 'mystic' | null;
  mode: 'lunar' | 'solar' | null;
  score: number | null;
  judgments: {
    blueStar: number;
    whiteStar: number;
    yellowStar: number;
    redStar: number;
  } | null;
  is_full_combo: boolean | null;
  hazard: 'DEFAULT' |'LV1' |'LV2' |'LV3' |'DEADEND' |"SUDDEN'  | null,
  pattern: 'DEFAULT' | 'MIRROR' | 'RANDOM'
};
```
