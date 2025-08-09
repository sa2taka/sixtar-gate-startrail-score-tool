import type { ScoreRank } from "@/types/score";

/**
 * スコアに基づいてランクとカラーを返す
 */
export const getScoreRank = (score: number): ScoreRank => {
  if (score >= 995000) return { rank: "995", color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white" };
  if (score >= 990000) return { rank: "990", color: "bg-gradient-to-r from-blue-500 to-purple-500 text-white" };
  if (score >= 975000) return { rank: "975", color: "bg-gradient-to-r from-green-500 to-blue-500 text-white" };
  if (score >= 950000) return { rank: "SS", color: "bg-yellow-400 text-black" };
  if (score >= 900000) return { rank: "S", color: "bg-yellow-300 text-black" };
  if (score >= 850000) return { rank: "A", color: "bg-green-200 text-green-800" };
  if (score >= 800000) return { rank: "B", color: "bg-blue-200 text-blue-800" };
  if (score >= 700000) return { rank: "C", color: "bg-gray-200 text-gray-800" };
  return { rank: "D", color: "bg-red-200 text-red-800" };
};

/**
 * 日付を日本語形式でフォーマット
 */
export const formatPlayDate = (date: Date): string => {
  return new Date(date).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * スコアを桁区切りでフォーマット
 */
export const formatScore = (score: number): string => {
  return score.toLocaleString();
};