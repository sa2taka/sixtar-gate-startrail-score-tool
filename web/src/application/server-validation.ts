"use server";

import type { FieldPath } from "react-hook-form";
import { fetchChart } from "@/lib/cached-content";
import type { EditableResultSchema } from "@/model/result";

export type ServerValidationError = {
  key: FieldPath<EditableResultSchema>;
  error: string;
};

export type ValidationOption = {
  minimumScore: number;
  validatedMaxCombo: boolean;
};

/**
 * サーバーサイドバリデーション
 * データベースと連携した詳細なバリデーションを行う
 */
export const validateServerSide = async (
  result: EditableResultSchema,
  option?: ValidationOption,
): Promise<ServerValidationError[]> => {
  const errors: ServerValidationError[] = [];

  try {
    // 楽曲・難易度の存在チェック
    if (result.music?.id && result.mode && result.difficulty) {
      const chart = await fetchChart(result.music.id, result.mode, result.difficulty);
      
      if (!chart) {
        errors.push({
          key: "difficulty",
          error: `指定された楽曲「${result.music.name}」の${result.difficulty}難易度は存在しません`,
        });
      } else {
        // 理論値チェック（該当フィールドがあれば）
        const theoreticalMaxScore = (chart as any).theoreticalMaxScore;
        if (result.score && theoreticalMaxScore && result.score > theoreticalMaxScore) {
          errors.push({
            key: "score",
            error: `スコアが理論値（${theoreticalMaxScore.toLocaleString()}）を超えています`,
          });
        }

        // 最低スコアチェック
        if (option?.minimumScore && result.score && result.score < option.minimumScore) {
          errors.push({
            key: "score",
            error: `スコアが最低値（${option.minimumScore.toLocaleString()}）を下回っています`,
          });
        }

        // コンボ数チェック（リザルト画面かつオプション有効時）
        const resultData = result as any;
        if (
          result.kind === "result" &&
          option?.validatedMaxCombo &&
          resultData.judgments &&
          (chart as any).maxCombo
        ) {
          const totalJudgments =
            resultData.judgments.blueStar +
            resultData.judgments.whiteStar +
            resultData.judgments.yellowStar +
            resultData.judgments.redStar;

          if (totalJudgments > (chart as any).maxCombo) {
            errors.push({
              key: "judgments",
              error: `判定の合計が最大コンボ数（${(chart as any).maxCombo}）を超えています`,
            });
          }
        }

        // 選択画面の最大コンボチェック
        const selectData = result as any;
        if (result.kind === "select" && selectData.maxCombo && (chart as any).maxCombo) {
          if (selectData.maxCombo > (chart as any).maxCombo) {
            errors.push({
              key: "maxCombo",
              error: `最大コンボ数が理論値（${(chart as any).maxCombo}）を超えています`,
            });
          }
        }
      }
    }

    // フルコンボの整合性チェック（リザルト画面）
    const resultDataForFullCombo = result as any;
    if (result.kind === "result" && resultDataForFullCombo.judgments) {
      const isActualFullCombo = resultDataForFullCombo.judgments.redStar === 0;
      if (result.isFullCombo !== isActualFullCombo) {
        errors.push({
          key: "isFullCombo",
          error: isActualFullCombo
            ? "RED STARが0なのでフルコンボにしてください"
            : "RED STARがあるのでフルコンボを解除してください",
        });
      }
    }

  } catch (error) {
    console.error("Server validation error:", error);
    // データベースエラーは無視（ネットワークエラーなどでバリデーションが失敗してもスコア保存は許可）
  }

  return errors;
};