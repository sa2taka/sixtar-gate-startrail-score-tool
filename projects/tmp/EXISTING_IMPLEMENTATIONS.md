# 既存実装の詳細分析

## 📋 現在の実装状況

### ✅ 完成済み機能

#### 1. スコア編集フォーム (`EditResult`)
**場所**: `src/components/edit-result/edit-result.tsx`
**機能**:
- React Hook Form による型安全なフォーム管理
- Zod バリデーション統合
- 楽曲種別による条件分岐UI（result/select）
- リアルタイムバリデーション
- 画像表示機能統合

**再利用可能性**: ✅ 高い（ダイアログ内で使用予定）

#### 2. 楽曲選択機能 (`MusicSelect`)
**場所**: `src/components/edit-result/music-select.tsx`
**機能**:
- `musicInformation.json` からの楽曲データ読み込み
- 日本語・英語名での増分検索
- リアルタイムフィルタリング

**再利用可能性**: ✅ 高い

#### 3. 画像表示機能 (`ImageViewer`)
**場所**: `src/components/ui/image-viewer.tsx`
**機能**:
- Base64画像の表示
- ズーム機能（0.5x-3x）
- モーダル表示
- スクリーンショット最適化

**再利用可能性**: ✅ 高い

#### 4. 保存API (`/api/results/save`)
**場所**: `src/app/api/results/save/route.ts`
**機能**:
- 認証チェック
- バリデーション
- 重複チェック（Upsert処理）
- Chart存在確認

**再利用可能性**: ✅ 高い

#### 5. バリデーション (`result-validation.ts`)
**場所**: `src/application/result-validation.ts`
**機能**:
- 共通フィールドバリデーション
- result/select種別ごとの専用バリデーション
- 楽曲情報との整合性チェック
- 判定合計値検証

**再利用可能性**: ✅ 高い

### ⚠️ 問題のある実装

#### 1. `/results/edit` ページ
**場所**: `src/app/results/edit/page.tsx`
**問題点**:
- 独自のポーリング実装（310行の大きなファイル）
- API URL不整合（`localhost:8080`）
- 重複したデータ変換ロジック
- 専用ページ実装（ダイアログ要件と不一致）

**対処方針**: 参考にしつつ、メインページダイアログに統合

#### 2. 基本ポーリング機能 (`use-polling.ts`)
**場所**: `src/components/polling/use-polling.ts`
**現在の実装**:
```typescript
export const usePolling = ({ duration, onFetchData }: PollingProps): void => {
  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetchResult();
      if (data.length > 0) {
        onFetchData(data);
      }
    }, duration ?? 3000);

    return () => clearInterval(interval);
  });
};
```

**不足機能**:
- localStorage での最終取得時刻管理なし
- エラーハンドリングなし
- since パラメータ未使用
- 依存配列不備

#### 3. 未使用コンポーネント (`PollingComponent`)
**場所**: `src/components/polling/polling-component.tsx`
**現状**: 
```typescript
export const PollingComponent = () => {
  // このコンポーネントは現在使用されていません
  console.log("Editing results count:", editingResults.length);
  return null;
};
```

**対処方針**: 実装を完成させて活用

## 🔄 データフロー分析

### 現在のフロー（`/results/edit`）
```
1. ScoreExtractorClient 初期化
2. ヘルスチェック（10秒間隔）
3. ポーリング（5秒間隔）
4. データ変換（convertToEditResultData）
5. キューイング（useState）
6. 編集フォーム表示
7. 保存処理
```

### 目標フロー（メインページダイアログ）
```
1. usePolling Hook（1分間隔）
2. localStorage 最終時刻管理
3. 新スコア検出
4. ダイアログ自動表示
5. EditResult コンポーネント再利用
6. 保存API再利用
7. 次スコア処理
```

## 🛠️ 再利用可能コード

### 1. データ変換ロジック
**元の場所**: `/results/edit/page.tsx:76-148`
**内容**: `FetchScoreData → EditableResultSchema` 変換
**再利用方法**: ユーティリティ関数として抽出

### 2. API クライアント基盤
**元の場所**: `/results/edit/page.tsx:36-73`
**内容**: `ScoreExtractorClient` クラス
**改善点**: 
- URL設定の外部化
- エラーハンドリング強化
- TypeScript strict 対応

### 3. キューイングロジック
**元の場所**: `/results/edit/page.tsx:154,188,206-210`
**内容**: 複数スコアの順次処理
**再利用方法**: カスタムHook化

## 📁 ファイル統合計画

### 削除検討
- ❓ `/results/edit/page.tsx` - 機能移行後に削除検討
- ❓ `PollingComponent` - 実装完成後に判断

### 新規作成予定
- `src/components/score-edit-dialog/` - ダイアログコンポーネント群
- `src/components/polling/polling-manager.tsx` - ポーリング管理
- `src/lib/score-extractor-client.ts` - APIクライアント分離
- `src/lib/score-data-converter.ts` - データ変換ユーティリティ

### 修正予定
- `src/app/page.tsx` - メインページ統合
- `src/components/polling/use-polling.ts` - 機能拡張
- `src/lib/api-client.ts` - URL確認・統一

## 🔧 技術的詳細

### shadcn/ui Dialog 使用予定
```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
```

### TanStack Query 活用
- 既存の `QueryClient` 設定済み
- API状態管理に活用可能

### Next.js App Router
- middleware による認証制御済み
- API Routes 活用済み

## 🎯 実装優先度

### High Priority
1. API URL統一
2. usePolling 機能拡張
3. ダイアログコンポーネント作成

### Medium Priority  
1. データ変換ユーティリティ分離
2. エラーハンドリング強化
3. メインページ統合

### Low Priority
1. 重複コード削除
2. 未使用コンポーネント整理
3. パフォーマンス最適化