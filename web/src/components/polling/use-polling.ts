import { useEffect, useRef, useState } from "react";
import { fetchResult } from "@/lib/api-client";
import type { EditableResultSchema } from "@/model/result";

export type PollingProps = {
  duration?: number;
  onFetchData: (data: EditableResultSchema[]) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
  initialLastDate?: string | null;
};

export type PollingStatus = {
  isConnected: boolean;
  lastFetch: Date | null;
  error: string | null;
  isLoading: boolean;
};

export const usePolling = ({ 
  duration = 30000, // 30秒間隔
  onFetchData, 
  onError,
  enabled = true,
  initialLastDate
}: PollingProps): PollingStatus => {
  // 初期の since 時刻を計算: 最後に保存されたスコア実行時間+1秒
  const getInitialSince = (): Date | null => {
    if (initialLastDate) {
      const lastDate = new Date(initialLastDate);
      return new Date(lastDate.getTime() + 1000); // +1秒
    }
    return null;
  };

  const lastFetchTimeRef = useRef<Date | null>(getInitialSince());
  const [status, setStatus] = useState<PollingStatus>({
    isConnected: false,
    lastFetch: getInitialSince(),
    error: null,
    isLoading: false,
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // onFetchData と onError の最新値を保持するref
  const onFetchDataRef = useRef(onFetchData);
  const onErrorRef = useRef(onError);
  
  // 最新のコールバックを保持
  useEffect(() => {
    onFetchDataRef.current = onFetchData;
    onErrorRef.current = onError;
  });

  const pollScores = async () => {
    try {
      // ローディング開始
      setStatus(prev => ({ ...prev, isLoading: true, error: null }));
      
      const data = await fetchResult(lastFetchTimeRef.current);
      
      setStatus(prev => ({ 
        ...prev, 
        isConnected: true, 
        error: null,
        isLoading: false
      }));

      if (data.length > 0 && onFetchDataRef.current) {
        onFetchDataRef.current(data);
      }
      // データがあってもなくても最終チェック時刻を更新
      const now = new Date();
      lastFetchTimeRef.current = now;
      setStatus(prev => ({ ...prev, lastFetch: now }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setStatus(prev => ({ 
        ...prev, 
        isConnected: false, 
        error: errorMessage,
        isLoading: false
      }));
      
      if (onErrorRef.current) {
        onErrorRef.current(error instanceof Error ? error : new Error(errorMessage));
      }
    }
  };

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 即座に1回実行
    pollScores();

    // 定期実行開始
    intervalRef.current = setInterval(pollScores, duration);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [duration, enabled]);

  return status;
};
