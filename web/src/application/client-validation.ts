import type { FieldPath } from "react-hook-form";
import type { EditableResultSchema } from "@/model/result";

export type ClientValidationError = {
  key: FieldPath<EditableResultSchema>;
  error: string;
};

/**
 * クライアントサイドバリデーション
 * 基本的な必須項目チェックのみを行う
 */
export const validateClientSide = (
  result: EditableResultSchema
): ClientValidationError[] => {
  const errors: ClientValidationError[] = [];

  // 必須項目チェック
  if (!result.music?.id) {
    errors.push({ key: "music.id", error: "楽曲を選択してください" });
  }

  if (!result.difficulty) {
    errors.push({ key: "difficulty", error: "難易度を選択してください" });
  }

  if (!result.mode) {
    errors.push({ key: "mode", error: "モードを選択してください" });
  }

  if (result.score === undefined || result.score === null || result.score < 0) {
    errors.push({ key: "score", error: "スコアを入力してください" });
  }

  // 種別固有のバリデーション
  if (result.kind === "result") {
    // リザルト画面の必須項目
    if (!result.judgments) {
      errors.push({ key: "judgments", error: "判定情報が必要です" });
    } else {
      if (result.judgments.blueStar < 0) {
        errors.push({ key: "judgments.blueStar", error: "BLUE STARは0以上で入力してください" });
      }
      if (result.judgments.whiteStar < 0) {
        errors.push({ key: "judgments.whiteStar", error: "WHITE STARは0以上で入力してください" });
      }
      if (result.judgments.yellowStar < 0) {
        errors.push({ key: "judgments.yellowStar", error: "YELLOW STARは0以上で入力してください" });
      }
      if (result.judgments.redStar < 0) {
        errors.push({ key: "judgments.redStar", error: "RED STARは0以上で入力してください" });
      }
    }
  } else if (result.kind === "select") {
    // 選択画面の必須項目
    if (result.maxCombo !== undefined && result.maxCombo < 0) {
      errors.push({ key: "maxCombo", error: "最大コンボ数は0以上で入力してください" });
    }
  }

  return errors;
};