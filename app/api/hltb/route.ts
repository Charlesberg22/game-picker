import { HowLongToBeatService } from "@/app/hltb/howlongtobeat";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameName = searchParams.get("name");

  if (!gameName) {
    return NextResponse.json({ error: "Game name is required" }, { status: 400 });
  }

  const hltbService = new HowLongToBeatService;

  try {
    const result = await hltbService.search(gameName);
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("HLTB fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch HLTB data" }, { status: 500 });
  }
}
