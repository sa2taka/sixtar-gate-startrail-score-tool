import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// ユーザーの最新のスコアの日付を取得
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

		if (lastResult) {
			return NextResponse.json({ lastDate: lastResult.playedAt.toISOString() });
		}

		// スコアが存在しない場合はnullを返す
		return NextResponse.json({ lastDate: null });
	} catch (error) {
		console.error("Error fetching last score date:", error);
		return NextResponse.json(
			{ error: "Failed to fetch last score date" },
			{ status: 500 },
		);
	}
}