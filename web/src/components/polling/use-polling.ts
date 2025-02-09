import { fetchResult } from "@/lib/api-client";
import { EditableResultSchema } from "@/model/result";
import { useEffect } from "react";

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
