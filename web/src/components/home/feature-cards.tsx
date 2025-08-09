"use client";

export const FeatureCards = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3">機能</h2>
        <ul className="space-y-2 text-sm">
          <li>✓ 自動スコア検出（30秒間隔）</li>
          <li>✓ スコア編集ダイアログ</li>
          <li>✓ 複数スコアの順次処理</li>
          <li>✓ スクリーンショット画像表示</li>
          <li>✓ 楽曲情報の自動補完</li>
        </ul>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3">使い方</h2>
        <ol className="space-y-2 text-sm">
          <li>1. score-extractorサーバーを起動</li>
          <li>2. ゲームのスクリーンショットを撮影</li>
          <li>3. 自動的にスコアが検出される</li>
          <li>4. ダイアログで内容を確認・編集</li>
          <li>5. 保存してデータベースに記録</li>
        </ol>
      </div>
    </div>
  );
};