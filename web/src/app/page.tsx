import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HomeClient } from "./home-client";

interface HighscoreQueryResult {
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

export default async function Home() {
  const session = await auth();

  if (!session?.user?.id) {
    return <HomeClient initialLastDate={null} highscores={[]} />;
  }

  // 並列でデータ取得を実行
  const [lastResult, highscores] = await Promise.all([
    prisma.result.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        playedAt: "desc",
      },
      select: {
        playedAt: true,
      },
    }),
    // ハイスコアデータを取得（重複を除去）
    prisma.$queryRaw<HighscoreQueryResult[]>`
      WITH ranked_scores AS (
        SELECT 
          r."musicId",
          r.type,
          r.difficulty,
          r.score,
          r."playedAt",
          r."isFullCombo",
          r."redStar" as misses,
          m.name as "musicName",
          m."englishName" as "musicEnglishName",
          c.level,
          c.notes,
          c.combo,
          ROW_NUMBER() OVER (
            PARTITION BY r."musicId", r.type, r.difficulty 
            ORDER BY r.score DESC, r."playedAt" DESC
          ) as rn
        FROM "Result" r
        INNER JOIN "Chart" c ON r."musicId" = c."musicId" 
          AND r.type = c.type 
          AND r.difficulty = c.difficulty
        INNER JOIN "Music" m ON r."musicId" = m.id
        WHERE r."userId" = ${session.user.id}
      )
      SELECT 
        "musicId",
        type,
        difficulty,
        score,
        "playedAt",
        "isFullCombo",
        misses,
        "musicName",
        "musicEnglishName",
        level,
        notes,
        combo
      FROM ranked_scores
      WHERE rn = 1
      ORDER BY score DESC, "playedAt" DESC
    `,
  ]);

  const lastScoreDate = lastResult?.playedAt.toISOString() || null;

  return <HomeClient initialLastDate={lastScoreDate} highscores={highscores} />;
}
