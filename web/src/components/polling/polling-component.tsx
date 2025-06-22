"use client";

import { useState } from "react";
import type { EditableResultSchema } from "@/model/result";
import { usePolling } from "./use-polling";

export const PollingComponent = () => {
  const [editingResults, setEditingResults] = useState<EditableResultSchema[]>(
    [],
  );

  usePolling({
    onFetchData: (data) => {
      setEditingResults((prev) => [...prev, ...data]);
    },
  });

  // このコンポーネントは現在使用されていません
  // editingResults は内部でのみ使用
  console.log("Editing results count:", editingResults.length);
  
  return null;
};
