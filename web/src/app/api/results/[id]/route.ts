import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Hazard, Pattern } from "@prisma/client";

interface Props {
  params: Promise<{ id: string }>;
}

// 特定のResult取得
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await prisma.result.findUnique({
      where: { 
        id,
        userId: session.user.id, // 所有者チェック
      },
      include: {
        chart: {
          include: {
            music: true,
          },
        },
      },
    });

    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error fetching result:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Result更新
export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // バリデーション
    const {
      score,
      blueStar,
      whiteStar,
      yellowStar,
      redStar,
      isFullCombo,
      hazard,
      pattern,
      playedAt,
    } = body;

    // 数値型のバリデーション
    if (typeof score !== "number" || score < 0 || score > 1000000) {
      return NextResponse.json({ error: "Invalid score value" }, { status: 400 });
    }

    // 所有者確認 & 更新
    const result = await prisma.result.updateMany({
      where: {
        id,
        userId: session.user.id, // 所有者のみ更新可能
      },
      data: {
        score: Math.floor(score),
        blueStar: blueStar ? Math.floor(blueStar) : null,
        whiteStar: whiteStar ? Math.floor(whiteStar) : null,
        yellowStar: yellowStar ? Math.floor(yellowStar) : null,
        redStar: redStar ? Math.floor(redStar) : null,
        isFullCombo: Boolean(isFullCombo),
        hazard: hazard as Hazard || "DEFAULT",
        pattern: pattern as Pattern || "DEFAULT",
        playedAt: playedAt ? new Date(playedAt) : undefined,
        updatedAt: new Date(),
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Result not found or not authorized" }, { status: 404 });
    }

    // 更新されたデータを取得して返す
    const updatedResult = await prisma.result.findUnique({
      where: { id },
      include: {
        chart: {
          include: {
            music: true,
          },
        },
      },
    });

    return NextResponse.json({ result: updatedResult });
  } catch (error) {
    console.error("Error updating result:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Result削除
export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 所有者確認 & 削除
    const result = await prisma.result.deleteMany({
      where: {
        id,
        userId: session.user.id, // 所有者のみ削除可能
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Result not found or not authorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Result deleted successfully" });
  } catch (error) {
    console.error("Error deleting result:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}