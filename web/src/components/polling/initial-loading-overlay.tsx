"use client";

import type { PollingStatus } from "./use-polling";

type InitialLoadingOverlayProps = {
  pollingStatus: PollingStatus;
};

export const InitialLoadingOverlay = ({ pollingStatus }: InitialLoadingOverlayProps) => {
  if (!pollingStatus.isLoading || pollingStatus.lastFetch) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-lg font-medium text-gray-900">スコア情報を取得中...</div>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          score-extractorから新しいスコアを確認しています
        </div>
      </div>
    </div>
  );
};