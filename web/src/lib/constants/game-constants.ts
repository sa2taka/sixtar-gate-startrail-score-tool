/**
 * 難易度別のカラー定義
 */
export const difficultyColors = {
  comet: "bg-green-100 text-green-800",
  nova: "bg-blue-100 text-blue-800",
  supernova: "bg-purple-100 text-purple-800",
  quasar: "bg-orange-100 text-orange-800",
  starlight: "bg-pink-100 text-pink-800",
  mystic: "bg-red-100 text-red-800",
} as const;

/**
 * ソート種別の定義
 */
export type SortBy = "playedAt" | "score" | "misses" | "musicName";
export type SortOrder = "asc" | "desc";