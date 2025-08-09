import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
	try {
		const musics = await prisma.music.findMany({
			select: {
				id: true,
				name: true,
				englishName: true,
			},
			orderBy: {
				name: "asc",
			},
		});

		return NextResponse.json(musics);
	} catch (error) {
		console.error("Error fetching musics:", error);
		return NextResponse.json(
			{ error: "Failed to fetch musics" },
			{ status: 500 },
		);
	}
}