import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HomeClient } from "./home-client";

async function getLastScoreDate() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }

    const lastResult = await prisma.result.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        playedAt: "desc",
      },
      select: {
        playedAt: true,
      },
    });

    return lastResult?.playedAt.toISOString() || null;
  } catch (error) {
    console.error("Error fetching last score date:", error);
    return null;
  }
}

export default async function Home() {
  const lastScoreDate = await getLastScoreDate();

  return <HomeClient initialLastDate={lastScoreDate} />;
}
