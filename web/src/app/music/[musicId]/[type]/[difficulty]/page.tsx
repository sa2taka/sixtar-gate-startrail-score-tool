import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { MusicType, Difficulty } from "@prisma/client";
import { MusicDetailClient } from "./music-detail-client";

interface Props {
  params: Promise<{
    musicId: string;
    type: string;
    difficulty: string;
  }>;
}

export default async function MusicDetailPage({ params }: Props) {
  const { musicId, type, difficulty } = await params;
  const session = await auth();
  
  if (!session?.user?.id) {
    notFound();
  }


  // パラメータの検証
  if (!Object.values(MusicType).includes(type as MusicType) || 
      !Object.values(Difficulty).includes(difficulty as Difficulty)) {
    notFound();
  }

  // 並列でデータ取得
  const [musicInfo, results] = await Promise.all([
    // 楽曲・チャート情報取得
    prisma.music.findUnique({
      where: { id: musicId },
      include: {
        Chart: {
          where: {
            type: type as MusicType,
            difficulty: difficulty as Difficulty,
          },
        },
      },
    }),
    // プレイ履歴取得
    prisma.result.findMany({
      where: {
        userId: session.user.id,
        musicId,
        type: type as MusicType,
        difficulty: difficulty as Difficulty,
      },
      orderBy: {
        playedAt: "desc",
      },
      select: {
        id: true,
        score: true,
        playedAt: true,
        isFullCombo: true,
        blueStar: true,
        whiteStar: true,
        yellowStar: true,
        redStar: true,
        hazard: true,
        pattern: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  if (!musicInfo || musicInfo.Chart.length === 0) {
    notFound();
  }

  const chart = musicInfo.Chart[0];

  return (
    <MusicDetailClient
      musicInfo={{
        id: musicInfo.id,
        name: musicInfo.name,
        englishName: musicInfo.englishName,
        bpm: musicInfo.bpm,
        musicLength: musicInfo.musicLength,
        link: musicInfo.link,
      }}
      chartInfo={{
        type: chart.type,
        difficulty: chart.difficulty,
        level: chart.level,
        notes: chart.notes,
        combo: chart.combo,
      }}
      results={results}
    />
  );
}