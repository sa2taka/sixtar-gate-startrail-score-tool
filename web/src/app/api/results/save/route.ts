import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { EditableResultSchema, EditableResultResultSchema } from "@/model/result";

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body: EditableResultSchema = await request.json();

    // 必須フィールドのバリデーション
    if (!body.music || !body.difficulty || !body.mode || !body.score) {
      return NextResponse.json(
        { error: "必須フィールドが不足しています" },
        { status: 400 },
      );
    }

    // 楽曲IDを取得（musicIdが直接ある場合とmusicオブジェクトがある場合に対応）
    const musicId = typeof body.music === "string" ? body.music : body.music.id;

    // Chartの存在確認
    const chart = await prisma.chart.findUnique({
      where: {
        musicId_type_difficulty: {
          musicId: musicId,
          type: body.mode as "solar" | "lunar", // Prismaの型に変換
          difficulty: body.difficulty,
        },
      },
    });

    if (!chart) {
      return NextResponse.json(
        { error: "指定された楽曲・難易度・タイプの組み合わせが見つかりません" },
        { status: 404 },
      );
    }

    // 型ガード関数
    const isResultResult = (data: EditableResultSchema): data is EditableResultResultSchema => {
      return data.kind === "result";
    };

    // Resultデータの作成
    const resultData = {
      userId: session.user.id,
      musicId: musicId,
      kind: body.kind,
      type: body.mode as "solar" | "lunar",
      difficulty: body.difficulty,
      mode: body.mode, // mode は文字列フィールド
      score: body.score,
      // リザルト画面の場合のみ判定データを保存
      blueStar:
        isResultResult(body) && body.judgments
          ? body.judgments.blueStar
          : null,
      whiteStar:
        isResultResult(body) && body.judgments
          ? body.judgments.whiteStar
          : null,
      yellowStar:
        isResultResult(body) && body.judgments
          ? body.judgments.yellowStar
          : null,
      redStar:
        isResultResult(body) && body.judgments
          ? body.judgments.redStar
          : null,
      isFullCombo: body.isFullCombo || false,
      hazard: isResultResult(body) ? body.hazard || null : null,
      pattern: isResultResult(body) ? body.pattern || null : null,
      playedAt: body.modTime ? new Date(body.modTime) : new Date(),
    };

    // 重複チェック（同じユーザー、楽曲、モード、難易度、プレイ日時）
    const existingResult = await prisma.result.findFirst({
      where: {
        userId: resultData.userId,
        musicId: resultData.musicId,
        type: resultData.type,
        difficulty: resultData.difficulty,
        playedAt: resultData.playedAt,
      },
    });

    let result;
    if (existingResult) {
      // 既存レコードを更新
      result = await prisma.result.update({
        where: { id: existingResult.id },
        data: resultData,
      });
    } else {
      // 新規レコードを作成
      result = await prisma.result.create({
        data: resultData,
      });
    }

    return NextResponse.json({
      success: true,
      id: result.id,
      message: existingResult
        ? "結果を更新しました"
        : "結果を保存しました",
    });
  } catch (error) {
    console.error("Save result error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 },
    );
  }
}
