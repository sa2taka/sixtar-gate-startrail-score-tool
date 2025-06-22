import { useEffect } from "react";
import { fetchResult } from "@/lib/api-client";
import type { EditableResultSchema } from "@/model/result";

export type PollingProps = {
  duration?: number;
  onFetchData: (data: EditableResultSchema[]) => void;
};

export const usePolling = ({ duration, onFetchData }: PollingProps): void => {
  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetchResult();
      if (data.length > 0) {
        onFetchData(data);
      }
    }, duration ?? 3000);

    return () => clearInterval(interval);
  });
};
