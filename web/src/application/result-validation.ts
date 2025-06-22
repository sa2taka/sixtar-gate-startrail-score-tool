import type { FieldPath } from "react-hook-form";
import { fetchChart } from "@/lib/cached-content";
import type {
  EditableResultResultSchema,
  EditableResultSchema,
  EditableSelectResultSchema,
} from "@/model/result";

export type ValidationOption = {
  minimumScore: number;
  validatedMaxCombo: boolean;
};

export const validationResult = async (
  result: EditableResultSchema,
  option?: ValidationOption,
): Promise<{ key: FieldPath<EditableResultSchema>; error: string }[]> => {
  const commonResultErrors = await validationCommonResult(result, option);
  const specificResultErrors =
    result.kind === "result"
      ? await validationResultResult(result, option)
      : await validationSelectResult(result, option);
  return [...commonResultErrors, ...specificResultErrors];
};

const validationCommonResult = async (
  result: EditableResultSchema,
  option?: ValidationOption,
): Promise<{ key: FieldPath<EditableResultSchema>; error: string }[]> => {
  const errors: { key: FieldPath<EditableResultSchema>; error: string }[] = [];
  if (!result.music) {
    errors.push({ key: "music", error: "楽曲名を入力してください" });
  }
  if (!result.difficulty) {
    errors.push({ key: "difficulty", error: "難易度を入力してください" });
  }
  if (!result.mode) {
    errors.push({ key: "mode", error: "モードを入力してください" });
  }
  if (!result.score || result.score < (option?.minimumScore ?? 0)) {
    errors.push({ key: "score", error: "スコアを入力してください" });
  }
  return errors;
};

const validationSelectResult = async (
  result: EditableSelectResultSchema,
  option?: ValidationOption,
): Promise<{ key: FieldPath<EditableResultSchema>; error: string }[]> => {
  const errors: { key: FieldPath<EditableResultSchema>; error: string }[] = [];
  if (option?.validatedMaxCombo) {
    if (!result.maxCombo) {
      errors.push({
        key: "music",
        error:
          "コンボ数による検証ができませんでした。楽曲情報が問題なければそのままで問題ありません。",
      });
    }

    const chart = await fetchChartByResult(result);

    if (chart && result.maxCombo) {
      if (result.maxCombo !== chart.combo) {
        errors.push({
          key: "music",
          error:
            "最大コンボ数が一致しませんでした。楽曲情報が問題なければそのままで問題ありません。",
        });
      }
    }
  }

  return errors;
};

const validationResultResult = async (
  result: EditableResultResultSchema,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _option?: ValidationOption,
): Promise<{ key: FieldPath<EditableResultSchema>; error: string }[]> => {
  const errors: { key: FieldPath<EditableResultSchema>; error: string }[] = [];
  if (!result.judgments) {
    errors.push({ key: "judgments", error: "判定を入力してください" });
  } else {
    if (result.judgments?.blueStar < 0) {
      errors.push({
        key: "judgments.blueStar",
        error: "Blue Starの数値が不正です",
      });
    } else if (result.judgments?.whiteStar < 0) {
      errors.push({
        key: "judgments.whiteStar",
        error: "White Starの数値が不正です",
      });
    } else if (result.judgments?.yellowStar < 0) {
      errors.push({
        key: "judgments.yellowStar",
        error: "Yellow Starの数値が不正です",
      });
    } else if (result.judgments?.redStar < 0) {
      errors.push({
        key: "judgments.redStar",
        error: "Red Starの数値が不正です",
      });
    } else {
      const chart = await fetchChartByResult(result);

      const maxCombo =
        result.judgments.blueStar +
        result.judgments.whiteStar +
        result.judgments.yellowStar +
        result.judgments.redStar;

      if (chart && maxCombo !== chart.combo) {
        errors.push({
          key: "music",
          error:
            "判定の合計が最大コンボ数と一致しません。楽曲情報、または判定情報を修正してください。",
        });
        errors.push({
          key: "judgments.blueStar",
          error:
            "判定の合計が最大コンボ数と一致しません。楽曲情報、または判定情報を修正してください。",
        });
      }
    }
  }
  if (!result.hazard) {
    errors.push({ key: "hazard", error: "ハザードを入力してください" });
  }
  if (!result.pattern) {
    errors.push({ key: "pattern", error: "パターンを入力してください" });
  }

  return errors;
};

const fetchChartByResult = async (result: EditableResultSchema) => {
  if (!result.music || !result.mode || !result.difficulty) {
    return null;
  }
  return fetchChart(result.music.id, result.mode, result.difficulty);
};
