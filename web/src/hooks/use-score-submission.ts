import { useState } from "react";
import type { EditableResultSchema } from "@/model/result";

export const useScoreSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitScore = async (data: EditableResultSchema): Promise<void> => {
    setIsSubmitting(true);
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

      return Promise.resolve();
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitScore,
  };
};