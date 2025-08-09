import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MusicType } from "@prisma/client";

interface HighscoreQueryResult {
  musicid: string;
  type: string;
  difficulty: string;
  score: number;
  playedat: Date;
  isfullcombo: boolean;
  misses: number;
  musicname: string;
  musicenglishname: string | null;
  level: number;
  notes: number;
  combo: number;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as MusicType | null;

    // SQLを使用して楽曲・難易度別のハイスコアを取得（重複を除去）
    const highscores = await prisma.$queryRaw<HighscoreQueryResult[]>`
      WITH ranked_scores AS (
        SELECT 
          r.musicId,
          r.type,
          r.difficulty,
          r.score,
          r.playedAt,
          r.isFullCombo,
          r.redStar as misses,
          m.name as musicName,
          m.englishName as musicEnglishName,
          c.level,
          c.notes,
          c.combo,
          ROW_NUMBER() OVER (
            PARTITION BY r.musicId, r.type, r.difficulty 
            ORDER BY r.score DESC, r.playedAt DESC
          ) as rn
        FROM "Result" r
        INNER JOIN "Chart" c ON r.musicId = c.musicId 
          AND r.type = c.type 
          AND r.difficulty = c.difficulty
        INNER JOIN "Music" m ON r.musicId = m.id
        WHERE r.userId = ${session.user.id}
        ${type ? `AND r.type = '${type}'::music_type` : ''}
      )
      SELECT 
        musicId,
        type,
        difficulty,
        score,
        playedAt,
        isFullCombo,
        misses,
        musicName,
        musicEnglishName,
        level,
        notes,
        combo
      FROM ranked_scores
      WHERE rn = 1
      ORDER BY score DESC, playedAt DESC
    `;

    return NextResponse.json({
      highscores,
    });
  } catch (error) {
    console.error("Error fetching highscores:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}