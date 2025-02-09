import type { FetchScoreData } from "@/lib/api-client";
import { $Enums } from "@prisma/client";

export type Difficulty = $Enums.Difficulty;
export type Pattern = $Enums.Pattern;
export type Hazard = $Enums.Hazard;
export type Kind = $Enums.Kind;

export type Music = {
  id: string;
  name: string;
  englishName: string | null;
};

export type Judgement = {
  blueStar: number;
  whiteStar: number;
  yellowStar: number;
  redStar: number;
};

type CommonResultSchema = {
  filePath: string;
  imageBinary: string;
  modTime: string;
  music: Music;
  difficulty: "comet" | "nova" | "supernova" | "quasar" | "starlight" | "mystic";
  mode: "lunar" | "solar";
  score: number;
  isFullCombo: boolean;
};

export type ResultResultSchema = CommonResultSchema & {
  kind: "result";
  judgments: Judgement;
  hazard: "DEFAULT" | "LV1" | "LV2" | "LV3" | "DEADEND" | "SUDDEN";
  pattern: "DEFAULT" | "MIRROR" | "RANDOM";
};

export type SelectResultSchema = CommonResultSchema & {
  kind: "select";
  maxCombo: number;
};

export type ResultSchema = ResultResultSchema | SelectResultSchema;

type NonOptionalParameters = "filePath" | "imageBinary" | "modTime" | "kind";
export type EditableResultResultSchema = Pick<ResultSchema, NonOptionalParameters> &
  Partial<Omit<ResultResultSchema, NonOptionalParameters>>;
export type EditableSelectResultSchema = Pick<ResultSchema, NonOptionalParameters> &
  Partial<Omit<SelectResultSchema, NonOptionalParameters>>;
export type EditableResultSchema = EditableResultResultSchema | EditableSelectResultSchema;

export const convertResultFromFetchData = (data: FetchScoreData): EditableResultSchema => {
  if (data.kind === "result") {
    return {
      filePath: data.file_path,
      imageBinary: data.image_binary,
      modTime: data.mod_time,
      music: data.music ?? undefined,
      difficulty: data.difficulty ?? undefined,
      mode: data.mode ?? undefined,
      score: data.score ?? undefined,
      isFullCombo: data.is_full_combo,
      kind: data.kind,
      judgments: data.judgments ?? undefined,
      hazard: data.hazard ?? undefined,
      pattern: data.pattern ?? undefined,
    };
  } else {
    return {
      filePath: data.file_path,
      imageBinary: data.image_binary,
      modTime: data.mod_time,
      music: data.music ?? undefined,
      difficulty: data.difficulty ?? undefined,
      mode: data.mode ?? undefined,
      score: data.score ?? undefined,
      isFullCombo: data.is_full_combo,
      kind: data.kind,
      maxCombo: data.max_combo ?? undefined,
    };
  }
};
