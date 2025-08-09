import { MusicType, Difficulty, Hazard, Pattern } from "@prisma/client";

// ハイスコア一覧用のデータ型
export interface HighscoreData {
  musicId: string;
  type: string;
  difficulty: string;
  score: number;
  playedAt: Date;
  isFullCombo: boolean;
  misses: number;
  musicName: string;
  musicEnglishName: string | null;
  level: number;
  notes: number;
  combo: number;
}

// 楽曲詳細ページ用のプレイ結果型
export interface PlayResult {
  id: string;
  score: number;
  playedAt: Date;
  isFullCombo: boolean;
  blueStar?: number | null;
  whiteStar?: number | null;
  yellowStar?: number | null;
  redStar?: number | null;
  hazard?: Hazard | null;
  pattern?: Pattern | null;
  createdAt: Date;
  updatedAt: Date;
}

// 楽曲情報型
export interface MusicInfo {
  id: string;
  name: string;
  englishName: string | null;
  bpm: number | null;
  musicLength: number;
  link: string;
}

// チャート情報型
export interface ChartInfo {
  type: MusicType;
  difficulty: Difficulty;
  level: number;
  notes: number;
  combo: number;
}

// スコアランク型
export interface ScoreRank {
  rank: string;
  color: string;
}