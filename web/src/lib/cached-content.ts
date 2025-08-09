import "server-only";

import type { $Enums } from "@prisma/client";
import { prisma } from "./db";

export const fetchChart = async (
  musicId: string,
  type: $Enums.MusicType,
  difficulty: $Enums.Difficulty,
) => {
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
};
