import {
  convertResultFromFetchData,
  type EditableResultSchema,
} from "@/model/result";

const getApi = () => {
  return `localhost:6433`;
};

const path = "/api/v1/scores";

export type FetchScoreData = {
  file_path: string;
  image_binary: string;
  mod_time: string;
  kind: "result" | "select";
  music?: {
    id: string;
    name: string;
    englishName: string | null;
  } | null;
  difficulty?:
    | "comet"
    | "nova"
    | "supernova"
    | "quasar"
    | "starlight"
    | "mystic"
    | null;
  mode?: "lunar" | "solar" | null;
  score: number | null;
  judgments?: {
    blueStar: number;
    whiteStar: number;
    yellowStar: number;
    redStar: number;
  } | null;
  is_full_combo?: boolean;
  hazard?: "DEFAULT" | "LV1" | "LV2" | "LV3" | "DEADEND" | "SUDDEN" | null;
  pattern?: "DEFAULT" | "MIRROR" | "RANDOM" | null;
  max_combo?: number | null;
};

export const fetchResult = async (
  since?: Date,
): Promise<EditableResultSchema[]> => {
  const url = new URL(path, getApi());
  if (since) {
    url.searchParams.set("since", since.toISOString());
  }
  const response = await fetch(url.toString());
  const result = await response.json();
  return result.map(convertResultFromFetchData);
};
