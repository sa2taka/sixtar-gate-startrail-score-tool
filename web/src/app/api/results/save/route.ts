import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateServerSide } from "@/application/server-validation";
import type { EditableResultSchema, EditableResultResultSchema } from "@/model/result";
import { auth } from "@/lib/auth";

// ファイル名から日時を抽出する関数
function extractDateFromFilename(filePath: string): Date {
  // ファイル名部分を取得（パスから最後の部分）
  const filename = filePath.split('/').pop() || filePath;
  
  // yyyyMMddHHmmss_n.ext の形式から日時部分を抽出
  const match = filename.match(/^(\d{14})_\d+\./);
  
  if (match) {
    const dateStr = match[1]; // yyyyMMddHHmmss
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1; // Dateオブジェクトは0ベース
    const day = parseInt(dateStr.substring(6, 8));
    const hour = parseInt(dateStr.substring(8, 10));
    const minute = parseInt(dateStr.substring(10, 12));
    const second = parseInt(dateStr.substring(12, 14));
    
    return new Date(year, month, day, hour, minute, second);
  }
  
  // パースできない場合は現在時刻を返す
  return new Date();
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    // 認証チェック
    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body: EditableResultSchema = await request.json();

    // サーバーサイドバリデーション
    const validationErrors = await validateServerSide(body, {
      minimumScore: 0,
      validatedMaxCombo: true,
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: "バリデーションエラー", 
          details: validationErrors.map(e => e.error)
        },
        { status: 400 }
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
      playedAt: extractDateFromFilename(body.filePath),
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
