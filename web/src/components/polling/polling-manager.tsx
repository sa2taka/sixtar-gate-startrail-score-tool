"use client";

import { useState, useCallback } from "react";
import { usePolling } from "./use-polling";
import { ScoreEditDialog } from "@/components/score-edit-dialog/score-edit-dialog";
import type { EditableResultSchema } from "@/model/result";

export type PollingManagerProps = {
  enabled?: boolean;
  onError?: (error: Error) => void;
  initialLastDate?: string | null;
};

export const PollingManager = ({ enabled = true, onError, initialLastDate }: PollingManagerProps) => {
  const [scoreQueue, setScoreQueue] = useState<EditableResultSchema[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleNewScores = useCallback(
    (newScores: EditableResultSchema[]) => {
      setScoreQueue((prev) => [...prev, ...newScores]);

      // ダイアログが開いていない場合は開く
      if (!dialogOpen && newScores.length > 0) {
        setCurrentIndex(0);
        setDialogOpen(true);
      }
    },
    [dialogOpen]
  );

  const handleSubmit = async (data: EditableResultSchema) => {
    try {
      const response = await fetch("/api/results/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "保存に失敗しました");
      }

      // 成功時は次のスコアに進む
      moveToNextScore();
    } catch (error) {
      // エラーを上位に伝播
      throw error;
    }
  };

  const handleSkip = () => {
    moveToNextScore();
  };

  const moveToNextScore = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex < scoreQueue.length) {
      setCurrentIndex(nextIndex);
    } else {
      // 全て処理完了
      setDialogOpen(false);
      setScoreQueue([]);
      setCurrentIndex(0);
    }
  };


  const pollingStatus = usePolling({
    duration: 30000, // 30秒間隔
    onFetchData: handleNewScores,
    onError,
    enabled,
    initialLastDate,
  });

  const currentScore = scoreQueue[currentIndex];

  return (
    <>
      <ScoreEditDialog
        key={`score-${currentIndex}-${currentScore?.filePath || 'empty'}`}
        open={dialogOpen}
        onOpenChange={(open) => {
          // ダイアログが閉じられようとした時の処理
          if (!open && scoreQueue.length > 0) {
            const remaining = scoreQueue.length - currentIndex;
            const shouldClose = confirm(
              `まだ${remaining}件の未編集スコアが残っています。\n編集を中断してもよろしいですか？\n\n「OK」を押すと編集を中断し、「キャンセル」を押すと編集を継続します。`
            );
            
            if (shouldClose) {
              setDialogOpen(false);
              // スコアキューはクリアしない（復旧ボタンで再開可能にする）
            }
            // キャンセルした場合は何もしない（ダイアログは開いたまま）
          } else {
            setDialogOpen(open);
          }
        }}
        scoreData={currentScore}
        onSubmit={handleSubmit}
        onSkip={handleSkip}
        queueLength={scoreQueue.length}
        currentIndex={currentIndex}
      />

      {/* ポーリング状態表示 */}
      <div className="fixed bottom-4 right-4 p-3 bg-white border rounded-lg shadow-lg text-sm max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${pollingStatus.isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
          <span className="font-medium">スコア検出</span>
        </div>

        {pollingStatus.isLoading && (
          <div className="flex items-center gap-2 text-blue-600 mb-1 animate-pulse">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium">読み込み中...</span>
          </div>
        )}

        {scoreQueue.length > 0 && (
          <div className="text-orange-600 mb-1">未編集スコア: {scoreQueue.length}件</div>
        )}

        {pollingStatus.error && <div className="text-red-500 text-xs">エラー: {pollingStatus.error}</div>}

        {pollingStatus.lastFetch && !pollingStatus.isLoading && (
          <div className="text-gray-500 text-xs">最終取得: {pollingStatus.lastFetch.toLocaleTimeString()}</div>
        )}
      </div>

      
      {/* ダイアログが閉じられた時の復旧ボタン */}
      {!dialogOpen && scoreQueue.length > 0 && (
        <div className="fixed bottom-28 right-4 z-40 flex flex-col gap-2">
          <button
            onClick={() => setDialogOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
            title={`未編集のスコアが${scoreQueue.length}件あります - クリックして編集を再開`}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white text-orange-500 flex items-center justify-center font-bold text-sm">
                {scoreQueue.length}
              </div>
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
          </button>
          <button
            onClick={() => {
              const shouldClear = confirm(`${scoreQueue.length}件の未編集スコアを全て破棄しますか？\n\nこの操作は取り消せません。`);
              if (shouldClear) {
                setScoreQueue([]);
                setCurrentIndex(0);
              }
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center"
            title="未編集のスコアを全て破棄"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* フルスクリーンローディングオーバーレイ（初回ポーリング時のみ） */}
      {pollingStatus.isLoading && !pollingStatus.lastFetch && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-lg font-medium text-gray-900">スコア情報を取得中...</div>
            </div>
            <div className="mt-2 text-sm text-gray-600">score-extractorから新しいスコアを確認しています</div>
          </div>
        </div>
      )}
    </>
  );
};
