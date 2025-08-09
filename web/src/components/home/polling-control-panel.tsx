"use client";

import { Button } from "@/components/ui/button";

type PollingControlPanelProps = {
  pollingEnabled: boolean;
  onTogglePolling: () => void;
  errorMessage: string | null;
};

export const PollingControlPanel = ({ 
  pollingEnabled, 
  onTogglePolling, 
  errorMessage 
}: PollingControlPanelProps) => {
  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-4">スコア管理システム</h1>
      <p className="text-gray-600 mb-6">
        score-extractorから自動的にスコア情報を取得し、編集・保存します。
        新しいスコアが検出されると自動的にダイアログが表示されます。
      </p>

      <div className="flex items-center gap-4 mb-4">
        <Button
          onClick={onTogglePolling}
          variant={pollingEnabled ? "default" : "outline"}
        >
          {pollingEnabled ? "ポーリング停止" : "ポーリング開始"}
        </Button>
        
        <div className="text-sm text-gray-500">
          ポーリング間隔: 30秒
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <strong>エラー:</strong> {errorMessage}
          <br />
          <span className="text-sm">
            score-extractorサーバーが localhost:6433 で起動していることを確認してください。
          </span>
        </div>
      )}
    </div>
  );
};