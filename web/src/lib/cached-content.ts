import { $Enums } from "@prisma/client";
import { unstable_cache as cache } from "next/cache";
import { prisma } from "./db";

export const fetchChart = cache(async (musicId: string, type: $Enums.MusicType, difficulty: $Enums.Difficulty) => {
  return prisma.chart.findUnique({
    include: {
      music: true,
    },
    where: {
      musicId_type_difficulty: {
        musicId,
        type,
        difficulty,
      },
    },
  });
});
