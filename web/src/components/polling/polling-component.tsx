"use client";

import { EditableResultSchema } from "@/model/result";
import { useState } from "react";
import { usePolling } from "./use-polling";

export const PollingComponent = () => {
  const [editingResults, setEditingResults] = useState<EditableResultSchema[]>([]);

  usePolling({
    onFetchData: (data) => {
      setEditingResults((prev) => [...prev, ...data]);
    },
  });
};
