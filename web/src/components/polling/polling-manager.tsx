"use client";

import { useState } from "react";
import { usePolling } from "./use-polling";
import { useScoreQueue } from "@/hooks/use-score-queue";
import { useScoreSubmission } from "@/hooks/use-score-submission";
import { ScoreEditDialog } from "@/components/score-edit-dialog/score-edit-dialog";
import { PollingStatus } from "./polling-status";
import { RecoveryButtons } from "./recovery-buttons";
import { InitialLoadingOverlay } from "./initial-loading-overlay";
import type { EditableResultSchema } from "@/model/result";

export type PollingManagerProps = {
  enabled?: boolean;
  onError?: (error: Error) => void;
  initialLastDate?: string | null;
};

export const PollingManager = ({ enabled = true, onError, initialLastDate }: PollingManagerProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // カスタムフック使用
  const scoreQueue = useScoreQueue();
  const submission = useScoreSubmission();

  const handleNewScores = (newScores: EditableResultSchema[]) => {
    scoreQueue.addScores(newScores);

    // ダイアログが開いていない場合は開く
    if (!dialogOpen && newScores.length > 0) {
      scoreQueue.resetToFirst();
      setDialogOpen(true);
    }
  };

  const handleSubmit = async (data: EditableResultSchema) => {
    try {
      await submission.submitScore(data);
      // 成功時は次のスコアに進む
      scoreQueue.moveToNext();
      
      // 最後のスコアだった場合はダイアログを閉じる
      if (scoreQueue.isLastScore) {
        setDialogOpen(false);
      }
    } catch (error) {
      // エラーを上位に伝播
      throw error;
    }
  };

  const handleSkip = () => {
    scoreQueue.moveToNext();
    
    // 最後のスコアだった場合はダイアログを閉じる
    if (scoreQueue.isLastScore) {
      setDialogOpen(false);
    }
  };

  const pollingStatus = usePolling({
    duration: 30000, // 30秒間隔
    onFetchData: handleNewScores,
    onError,
    enabled,
    initialLastDate,
  });

  const handleDialogOpenChange = (open: boolean) => {
    // ダイアログが閉じられようとした時の処理
    if (!open && scoreQueue.hasScores) {
      const remaining = scoreQueue.queueLength - scoreQueue.currentIndex;
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
  };

  return (
    <>
      <ScoreEditDialog
        key={`score-${scoreQueue.currentIndex}-${scoreQueue.currentScore?.filePath || 'empty'}`}
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        scoreData={scoreQueue.currentScore}
        onSubmit={handleSubmit}
        onSkip={handleSkip}
        queueLength={scoreQueue.queueLength}
        currentIndex={scoreQueue.currentIndex}
        isLoading={submission.isSubmitting}
      />

      <PollingStatus 
        pollingStatus={pollingStatus} 
        queueLength={scoreQueue.queueLength} 
      />
      
      {!dialogOpen && (
        <RecoveryButtons
          queueLength={scoreQueue.queueLength}
          onReopen={() => setDialogOpen(true)}
          onClearAll={scoreQueue.clear}
        />
      )}

      <InitialLoadingOverlay pollingStatus={pollingStatus} />
    </>
  );
};
