"use client";

import type { PollingStatus as PollingStatusType } from "./use-polling";

type PollingStatusProps = {
  pollingStatus: PollingStatusType;
  queueLength: number;
};

export const PollingStatus = ({ pollingStatus, queueLength }: PollingStatusProps) => {
  return (
    <div className="fixed bottom-4 right-4 p-3 bg-white border rounded-lg shadow-lg text-sm max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <div 
          className={`w-2 h-2 rounded-full ${
            pollingStatus.isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span className="font-medium">スコア検出</span>
      </div>

      {pollingStatus.isLoading && (
        <div className="flex items-center gap-2 text-blue-600 mb-1 animate-pulse">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="font-medium">読み込み中...</span>
        </div>
      )}

      {queueLength > 0 && (
        <div className="text-orange-600 mb-1">未編集スコア: {queueLength}件</div>
      )}

      {pollingStatus.error && (
        <div className="text-red-500 text-xs">エラー: {pollingStatus.error}</div>
      )}

      {pollingStatus.lastFetch && !pollingStatus.isLoading && (
        <div className="text-gray-500 text-xs">
          最終取得: {pollingStatus.lastFetch.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};