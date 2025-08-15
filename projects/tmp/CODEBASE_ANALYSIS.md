# コードベース詳細分析結果

## 🏗️ アーキテクチャ概要

### 技術スタック
- **Frontend**: Next.js 15, TypeScript, React 19
- **UI**: shadcn/ui (Radix UI + Tailwind CSS)
- **認証**: NextAuth.js v5 (beta) - Google OAuth
- **データベース**: PostgreSQL + Prisma ORM
- **状態管理**: TanStack Query + React Hook Form
- **バックエンド**: Go言語 score-extractor (OCR処理)

### ディレクトリ構造
```
web/src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── auth/              # 認証関連ページ
│   ├── results/edit/      # スコア編集専用ページ
│   └── page.tsx           # メインページ（要更新対象）
├── components/            # Reactコンポーネント
│   ├── auth/              # 認証関連UI
│   ├── edit-result/       # スコア編集フォーム
│   ├── polling/           # ポーリング機能
│   └── ui/                # shadcn/ui コンポーネント
├── lib/                   # ユーティリティ
└── model/                 # 型定義
```

## 🔍 重要コンポーネント分析

### EditResult コンポーネント (`edit-result.tsx`)
**用途**: スコア編集フォーム（メイン機能）
**特徴**:
- React Hook Form + Zod バリデーション
- 楽曲種別（result/select）による条件分岐UI
- 画像表示機能統合
- 判定データ（blueStar, whiteStar等）入力

### MusicSelect コンポーネント (`music-select.tsx`)  
**用途**: 楽曲検索・選択UI
**特徴**:
- `musicInformation.json`からの楽曲データ読み込み
- 日本語・英語名での検索機能
- リアルタイムフィルタリング

### ImageViewer コンポーネント (`image-viewer.tsx`)
**用途**: Base64画像表示・拡大機能
**特徴**:
- ズーム機能（0.5x-3x）
- モーダル表示
- スクリーンショット表示最適化

### usePolling Hook (`use-polling.ts`)
**現在の実装**: 基本的なポーリング機能
**改善が必要**:
- localStorage での最終取得時刻管理
- エラーハンドリング強化
- 間隔調整（現在3秒→1分に変更予定）

## 🔄 API設計

### score-extractor API
**URL**: `localhost:6433/api/v1/scores`
**パラメータ**: `?since={ISO8601_timestamp}`
**レスポンス**: `FetchScoreData[]`

```typescript
type FetchScoreData = {
  file_path: string;
  image_binary: string;      // Base64エンコード
  mod_time: string;          // ISO8601タイムスタンプ
  kind: "result" | "select";
  music: { id: string; name: string; englishName: string | null; } | null;
  difficulty: "comet" | "nova" | "supernova" | "quasar" | "starlight" | "mystic" | null;
  mode: "lunar" | "solar" | null;
  score: number | null;
  judgments: { blueStar: number; whiteStar: number; yellowStar: number; redStar: number; } | null;
  is_full_combo: boolean;
  hazard: "DEFAULT" | "LV1" | "LV2" | "LV3" | "DEADEND" | "SUDDEN" | null;
  pattern: "DEFAULT" | "MIRROR" | "RANDOM" | null;
  max_combo: number | null;
};
```

### 保存API
**URL**: `POST /api/results/save`
**Body**: `EditableResultSchema`
**機能**: 重複チェック・Upsert処理

## 🗄️ データベーススキーマ

### 主要テーブル
```sql
-- ユーザー（NextAuth.js管理）
User { id, name, email, ... }

-- 楽曲マスター
Music { id, name, englishName, bpm, musicLength, link }

-- 譜面情報  
Chart { musicId, type(solar/lunar), difficulty, level, notes, combo }

-- スコア記録
Result { 
  id, userId, musicId, kind, type, difficulty, mode, score,
  blueStar, whiteStar, yellowStar, redStar, isFullCombo,
  hazard, pattern, playedAt, createdAt, updatedAt 
}
```

## ⚠️ 現在の問題点

### 1. 重複実装
- `/results/edit` ページに独自のポーリング実装
- `PollingComponent` が未使用状態
- 機能が分散している

### 2. API URL不整合
- `api-client.ts`: `localhost:6433` (正しい)
- `/results/edit`: `localhost:8080` (古い設定)

### 3. ポーリング間隔
- 現在: 3-5秒間隔
- 要件: 1分間隔

### 4. UI/UX
- 専用ページでの編集（メインページでのダイアログが要件）
- 状態管理の分散

## 🎯 実装方針

### Phase 1: 基盤修正
1. API URL統一
2. ポーリング間隔調整  
3. localStorage管理実装

### Phase 2: ダイアログ化
1. スコア編集ダイアログコンポーネント作成
2. メインページでの制御実装
3. 既存EditResultの再利用

### Phase 3: データフロー統合
1. ポーリング→ダイアログ表示の自動化
2. 複数スコア処理キュー
3. エラーハンドリング

## 📁 ファイル操作予定

### 新規作成
- `src/components/score-edit-dialog/score-edit-dialog.tsx`
- `src/components/polling/polling-manager.tsx`

### 修正対象
- `src/app/page.tsx` (メインページ統合)
- `src/components/polling/use-polling.ts` (機能強化)
- `src/lib/api-client.ts` (URL統一確認)

### 検討対象
- `src/app/results/edit/page.tsx` (重複削除検討)
- `src/components/polling/polling-component.tsx` (活用または削除)

## 🔧 開発環境情報

### 必要コマンド
```bash
# 開発サーバー起動
pnpm dev

# Linting
pnpm lint

# Prisma操作
pnpm prisma-local [command]

# スクリプト実行
pnpm script [file]
```

### 外部依存
- score-extractor サーバー (`localhost:6433`)
- PostgreSQL データベース
- Google OAuth設定
- Tesseract OCR (score-extractor用)