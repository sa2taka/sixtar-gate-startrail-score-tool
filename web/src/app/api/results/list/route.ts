import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MusicType } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as MusicType | null;
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const sortBy = searchParams.get("sortBy") ?? "playedAt"; // playedAt, score, misses
    const sortOrder = searchParams.get("sortOrder") ?? "desc"; // asc, desc

    const skip = (page - 1) * limit;

    // フィルタ条件を構築
    const where = {
      userId: session.user.id,
      ...(type && { type }),
    };

    // ソート条件を構築
    let orderBy: any = {};
    switch (sortBy) {
      case "score":
        orderBy = { score: sortOrder };
        break;
      case "misses":
        orderBy = { redStar: sortOrder };
        break;
      case "playedAt":
      default:
        orderBy = { playedAt: sortOrder };
        break;
    }

    const [results, totalCount] = await Promise.all([
      prisma.result.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          chart: {
            include: {
              music: true,
            },
          },
        },
      }),
      prisma.result.count({ where }),
    ]);

    return NextResponse.json({
      results,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}