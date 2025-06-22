# SIXTAR GATE STARTRAIL Score Tool - TODO List

## 🎯 現在の開発フェーズ: Web編集機能の実装

### 📋 進捗状況サマリー
- ✅ スコア編集フォームコンポーネント（EditResult）実装完了
- ✅ 楽曲選択オートコンプリート機能実装完了
- ✅ バリデーションロジック実装完了
- ✅ 編集ページとAPI実装完了
- ✅ score-extractor連携実装完了
- 🚧 UI改善とテスト実装が必要

---

## 🔥 優先度: 高

### 1. ✅ EditResultコンポーネントを使用するページ（/results/edit）を作成
**現状**: 実装完了
**実装内容**:
- [x] `/app/results/edit/page.tsx` を作成
- [x] score-extractorからのデータ受け取り機能
- [x] 編集完了後の遷移先設定
- [x] ポーリング機能とキューイング
- [x] 接続状態表示

### 2. ✅ score-extractorから取得したデータをEditResultに渡す実装
**現状**: 実装完了
**実装内容**:
- [x] score-extractor APIとの通信ロジック
- [x] データフォーマットの変換処理
- [x] エラーハンドリング
- [x] 5秒間隔ポーリング機能

### 3. ✅ 編集データを保存するAPIエンドポイント（/api/results/save）の実装
**現状**: 実装完了
**実装内容**:
- [x] `/api/results/save/route.ts` を作成
- [x] Prismaを使用したデータベース保存処理
- [x] 認証チェック（NextAuth.jsのセッション確認）
- [x] 重複チェックとアップデート処理
- [x] Chart存在確認による整合性チェック

---

## 📊 優先度: 中

### 4. ✅ button.tsxのコードスタイルをBiomeで統一
**現状**: 実装完了
**対応**: 
- [x] `pnpm format` でBiome統一フォーマット実行

### 5. 🚧 エラーメッセージの日本語化を完全実装
**現状**: APIエラーは日本語化完了、フォームエラーは部分的に完了
**実装内容**:
- [x] APIエラーの日本語化（save route完了）
- [x] バリデーションエラーの日本語化（result-validation.ts完了）
- [ ] React Hook Formの標準エラーメッセージ日本語化
- [ ] フォーム必須フィールドのエラー表示改善

### 6. ✅ 画像表示機能（imageBinary）の実装
**現状**: 実装完了
**実装内容**:
- [x] Base64画像データの表示コンポーネント
- [x] 画像のズーム・拡大表示機能
- [x] 画像と入力フォームの2カラムレイアウト
- [x] ImageViewerコンポーネントの作成

---

## 🔍 優先度: 低

### 7. バリデーションロジックのテスト作成
**対象ファイル**: `web/src/application/result-validation.ts`
**テスト内容**:
- [ ] 各バリデーション関数の単体テスト
- [ ] エッジケースのテスト
- [ ] 統合テスト

---

## 💡 今後の機能拡張案

### Phase 2: ユーザビリティ向上
- [ ] 編集履歴の保存と復元
- [ ] 一括編集機能（複数のスコアを同時編集）
- [ ] キーボードショートカット
- [ ] 編集内容のプレビュー機能

### Phase 3: 分析機能
- [ ] スコアの推移グラフ
- [ ] 判定精度の分析
- [ ] 他ユーザーとの比較機能

---

## 📝 メモ

### 現在のデータフロー
1. ユーザーがゲームのスクリーンショットを撮影
2. score-extractorがOCRで情報を抽出
3. 抽出データをWeb UIで確認・編集 ← **現在ここを実装中**
4. 編集済みデータをデータベースに保存
5. 保存されたデータを閲覧・分析

### 技術スタック確認
- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: shadcn/ui (Radix UI + Tailwind CSS)
- **Form**: React Hook Form + Zod
- **Database**: PostgreSQL + Prisma
- **Auth**: NextAuth.js v5 (Google OAuth)
- **OCR**: Go + Tesseract (score-extractor)

### 開発時の注意点
- コードフォーマットは必ずBiomeを使用（Prettierは使わない）
- タブインデント、120文字制限
- 日本語UIを前提に開発
- モバイル対応も考慮

### 開発環境セットアップ
1. **データベース（Docker使用）**:
   ```bash
   cd web
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **環境変数**:
   ```bash
   cp .env.local.example .env.local
   # .env.local を実際の値で編集
   ```

3. **依存関係とDBセットアップ**:
   ```bash
   pnpm install
   pnpm prisma-local db push
   pnpm script scripts/insert-musics.ts
   ```