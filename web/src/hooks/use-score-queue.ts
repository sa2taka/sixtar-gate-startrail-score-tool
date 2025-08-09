import { useState, useCallback } from "react";
import type { EditableResultSchema } from "@/model/result";

export const useScoreQueue = () => {
  const [scoreQueue, setScoreQueue] = useState<EditableResultSchema[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const addScores = useCallback((newScores: EditableResultSchema[]) => {
    setScoreQueue((prev) => [...prev, ...newScores]);
  }, []);

  const clear = useCallback(() => {
    setScoreQueue([]);
    setCurrentIndex(0);
  }, []);

  const moveToNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < scoreQueue.length) {
      setCurrentIndex(nextIndex);
    } else {
      // 全て処理完了
      clear();
    }
  }, [currentIndex, scoreQueue.length, clear]);

  const resetToFirst = useCallback(() => {
    setCurrentIndex(0);
  }, []);

  const currentScore = scoreQueue[currentIndex];
  const hasScores = scoreQueue.length > 0;
  const isLastScore = currentIndex >= scoreQueue.length - 1;

  return {
    scoreQueue,
    currentIndex,
    currentScore,
    hasScores,
    isLastScore,
    queueLength: scoreQueue.length,
    addScores,
    moveToNext,
    clear,
    resetToFirst,
  };
};