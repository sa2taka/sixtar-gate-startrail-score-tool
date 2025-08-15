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
    return (
      <HomeClient 
        initialLastDate={null} 
        highscores={[]} 
        scoreDistribution={[]}
        playActivity={[]}
        hazardStats={[]}
      />
    );
  }

  // 並列でデータ取得を実行
  const [lastResult, highscores, statisticsData] = await Promise.all([
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
          AND r.difficulty IN ('quasar', 'starlight')
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
    // 統計データを取得
    Promise.all([
      // スコア分布データ
      prisma.$queryRaw<{ rank: string; count: number; minScore: number }[]>`
        WITH score_distribution AS (
          SELECT 
            CASE 
              WHEN score >= 1000000 THEN 'PB'
              WHEN score >= 995000 THEN '995'
              WHEN score >= 990000 THEN '990'
              WHEN score >= 975000 THEN '975'
              WHEN score >= 950000 THEN 'SS'
              WHEN score >= 900000 THEN 'S'
              WHEN score >= 850000 THEN 'A'
              WHEN score >= 800000 THEN 'B'
              WHEN score >= 700000 THEN 'C'
              ELSE 'D'
            END as rank,
            score
          FROM "Result" r
          INNER JOIN (
            SELECT 
              "musicId", type, difficulty, 
              MAX(score) as max_score
            FROM "Result"
            WHERE "userId" = ${session.user.id}
              AND difficulty IN ('quasar', 'starlight')
            GROUP BY "musicId", type, difficulty
          ) max_scores ON r."musicId" = max_scores."musicId" 
            AND r.type = max_scores.type 
            AND r.difficulty = max_scores.difficulty 
            AND r.score = max_scores.max_score
          WHERE r."userId" = ${session.user.id}
            AND r.difficulty IN ('quasar', 'starlight')
        )
        SELECT 
          rank,
          COUNT(*)::int as count,
          CASE 
            WHEN rank = 'PB' THEN 1000000
            WHEN rank = '995' THEN 995000
            WHEN rank = '990' THEN 990000
            WHEN rank = '975' THEN 975000
            WHEN rank = 'SS' THEN 950000
            WHEN rank = 'S' THEN 900000
            WHEN rank = 'A' THEN 850000
            WHEN rank = 'B' THEN 800000
            WHEN rank = 'C' THEN 700000
            ELSE 0
          END as "minScore"
        FROM score_distribution
        WHERE rank != 'D'
        GROUP BY rank, "minScore"
        ORDER BY "minScore" DESC
      `,
      // プレイアクティビティデータ（過去365日）
      prisma.$queryRaw<{ date: string; count: number }[]>`
        SELECT 
          DATE(r."playedAt"::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo') as date,
          COUNT(*)::int as count
        FROM "Result" r
        WHERE r."userId" = ${session.user.id}
          AND r."playedAt" >= NOW() - INTERVAL '365 days'
          AND r.difficulty IN ('quasar', 'starlight')
        GROUP BY DATE(r."playedAt"::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')
        ORDER BY date
      `,
      // ハザード別統計データ
      prisma.$queryRaw<{ hazard: string; count: number }[]>`
        SELECT 
          r.hazard,
          COUNT(*)::int as count
        FROM "Result" r
        INNER JOIN (
          SELECT 
            "musicId", type, difficulty, 
            MAX(score) as max_score
          FROM "Result"
          WHERE "userId" = ${session.user.id}
            AND difficulty IN ('quasar', 'starlight')
          GROUP BY "musicId", type, difficulty
        ) max_scores ON r."musicId" = max_scores."musicId" 
          AND r.type = max_scores.type 
          AND r.difficulty = max_scores.difficulty 
          AND r.score = max_scores.max_score
        WHERE r."userId" = ${session.user.id}
          AND r.difficulty IN ('quasar', 'starlight')
        GROUP BY r.hazard
        ORDER BY count DESC
      `
    ])
  ]);

  const lastScoreDate = lastResult?.playedAt.toISOString() || null;

  // 統計データを処理
  const [scoreDistributionRaw, playActivityRaw, hazardStatsRaw] = statisticsData;
  
  // スコア分布データを完全な形に変換（存在しないランクは0で埋める）
  const allRanks = [
    { rank: 'PB', minScore: 1000000, color: 'bg-gradient-to-r from-blue-600 to-cyan-600' },
    { rank: '995', minScore: 995000, color: 'bg-purple-600' },
    { rank: '990', minScore: 990000, color: 'bg-purple-500' },
    { rank: '975', minScore: 975000, color: 'bg-indigo-600' },
    { rank: 'SS', minScore: 950000, color: 'bg-yellow-500' },
    { rank: 'S', minScore: 900000, color: 'bg-orange-500' },
    { rank: 'A', minScore: 850000, color: 'bg-red-500' },
    { rank: 'B', minScore: 800000, color: 'bg-blue-500' },
    { rank: 'C', minScore: 700000, color: 'bg-green-500' },
  ];
  
  const scoreDistribution = allRanks.map(rankInfo => {
    const found = scoreDistributionRaw.find(d => d.rank === rankInfo.rank);
    return {
      ...rankInfo,
      count: found?.count || 0,
    };
  });

  // プレイアクティビティデータを変換
  const playActivity = playActivityRaw.map(d => ({
    date: d.date,
    count: d.count,
  }));

  // ハザード統計データを変換
  const allHazards = [
    { hazard: 'DEFAULT', displayName: 'ノーマル', color: 'bg-gray-500' },
    { hazard: 'LV1', displayName: 'LV1', color: 'bg-green-500' },
    { hazard: 'LV2', displayName: 'LV2', color: 'bg-yellow-500' },
    { hazard: 'LV3', displayName: 'LV3', color: 'bg-orange-500' },
    { hazard: 'DEADEND', displayName: 'デッドエンド', color: 'bg-red-600' },
    { hazard: 'SUDDEN', displayName: 'サドン', color: 'bg-purple-600' },
  ];

  const hazardStats = allHazards.map(hazardInfo => {
    const found = hazardStatsRaw.find(d => d.hazard === hazardInfo.hazard);
    return {
      ...hazardInfo,
      count: found?.count || 0,
    };
  });


  return (
    <HomeClient 
      initialLastDate={lastScoreDate} 
      highscores={highscores}
      scoreDistribution={scoreDistribution}
      playActivity={playActivity}
      hazardStats={hazardStats}
    />
  );
}
