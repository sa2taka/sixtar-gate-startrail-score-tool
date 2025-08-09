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
    <div className="border-t pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={onTogglePolling}
            variant={pollingEnabled ? "default" : "outline"}
            size="sm"
          >
            {pollingEnabled ? "ポーリング停止" : "ポーリング開始"}
          </Button>
          
          <div className="text-sm text-gray-500">
            ポーリング間隔: 30秒
          </div>
          
          <div className="flex items-center gap-2">
            <div 
              className={`w-2 h-2 rounded-full ${
                pollingEnabled ? "bg-green-500" : "bg-gray-300"
              }`}
            />
            <span className="text-sm text-gray-600">
              {pollingEnabled ? "スコア検出中" : "待機中"}
            </span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mt-4">
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