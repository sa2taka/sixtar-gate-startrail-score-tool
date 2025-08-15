# POLLING機能実装 TODO

## 概要
POLLING.mdの要件を達成するため、メインページでのスコアポーリング・編集ダイアログシステムを実装する。

## 実装タスク

### 🔧 Phase 1: 基盤修正
- [ ] **API URL統一**: `api-client.ts`の`localhost:6433`への修正
- [ ] **ポーリング間隔調整**: `use-polling.ts`を1分間隔（60000ms）に変更
- [ ] **localStorage最終取得時刻管理**: 初期値は1日前から取得するよう設定

### 🎨 Phase 2: UI コンポーネント作成
- [ ] **スコア編集ダイアログコンポーネント**: 
  - `src/components/score-edit-dialog/score-edit-dialog.tsx`
  - shadcn/ui Dialogベース
  - EditResultコンポーネントの再利用
- [ ] **ポーリング状態表示**: 接続状況・待機件数の表示
- [ ] **複数スコア処理UI**: 順次処理・スキップ・キューイング機能

### 🏠 Phase 3: メインページ統合
- [ ] **page.tsx更新**: 
  - ポーリングコンポーネント統合
  - ダイアログ表示制御
  - 状態管理（React state）
- [ ] **ポーリングマネージャー**:
  - `src/components/polling/polling-manager.tsx`
  - 新スコア検出→ダイアログ表示
  - 複数スコアキューイング

### 🔄 Phase 4: データフロー統合
- [ ] **保存API連携**: `/api/results/save`の活用
- [ ] **エラーハンドリング**: 接続エラー・保存エラーの適切な処理
- [ ] **楽曲情報変換**: score-extractor→Prisma形式の変換ロジック

### 🧹 Phase 5: クリーンアップ
- [ ] **重複コード削除**: `/results/edit`ページの個別実装削除検討
- [ ] **未使用コンポーネント**: `PollingComponent`の活用または削除
- [ ] **型定義統一**: API型とモデル型の整合性確保

## 技術的詳細

### API仕様
- **Endpoint**: `GET localhost:6433/api/v1/scores?since={timestamp}`
- **Response**: `FetchScoreData[]` 型（api-client.ts参照）
- **Polling**: 1分間隔、エラー時は継続

### データ変換
```typescript
FetchScoreData → EditableResultSchema → Prisma Result
```

### 状態管理
- **ポーリング状態**: usePolling hook
- **編集キュー**: React useState
- **ダイアログ制御**: React useState
- **最終取得時刻**: localStorage

## 既存リソース活用
- ✅ `EditResult` コンポーネント
- ✅ `ImageViewer` コンポーネント  
- ✅ `MusicSelect` コンポーネント
- ✅ `/api/results/save` エンドポイント
- ✅ バリデーション（`result-validation.ts`）

## 完了基準
1. メインページでポーリング開始
2. 新スコア検出時にダイアログ自動表示
3. 複数スコアの順次処理
4. 1分間隔での継続ポーリング
5. エラー時の適切な表示・回復

## 注意事項
- score-extractorサーバーが`localhost:6433`で動作している前提
- 認証済みユーザーのみ利用可能
- 既存のデータベーススキーマ・API仕様に準拠