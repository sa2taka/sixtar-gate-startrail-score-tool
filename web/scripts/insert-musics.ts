import { prisma } from "@/lib/db";
import musicInfo from "../musicInformation.json";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { $Enums, Difficulty } from "@prisma/client";

for (const music of musicInfo.songs) {
  await prisma.$transaction(async (prisma) => {
    try {
      await prisma.music.create({
        data: {
          id: music.id,
          name: music.name,
          englishName: music.englishName,
          link: music.link,
          musicLength: music.musicLength,
          bpm: music.bpm,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      for (const [difficulty, data] of Object.entries(music.solar)) {
        if (!Object.values($Enums.Difficulty).includes(difficulty as Difficulty)) {
          console.error(`Invalid difficulty: ${difficulty}, ${music.name}`);
          continue;
        }
        await prisma.chart.create({
          data: {
            musicId: music.id,
            difficulty: difficulty as Difficulty,
            level: data.level,
            notes: data.notes,
            combo: data.combo,
            type: "solar",
          },
        });
      }

      for (const [difficulty, data] of Object.entries(music.lunar)) {
        if (!Object.values($Enums.Difficulty).includes(difficulty as Difficulty)) {
          console.error(`Invalid difficulty: ${difficulty}, ${music.name}`);
          continue;
        }
        await prisma.chart.create({
          data: {
            musicId: music.id,
            difficulty: difficulty as Difficulty,
            level: data.level,
            notes: data.notes,
            combo: data.combo,
            type: "lunar",
          },
        });
      }
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        console.log(`${e}, ${music.name}`);
        return;
      }
      console.error(e);
    }
  });
}
