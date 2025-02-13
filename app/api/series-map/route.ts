import { NextResponse } from "next/server";
import { fetchAllGames, GamesTable } from "@/app/lib/data";
import { buildSeriesMap } from "@/app/lib/utils";

let cachedSeriesMap: Map<number, GamesTable[]> | null = null;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const refresh = searchParams.get("refresh") === "true";

  if (!cachedSeriesMap || refresh ) {
    const games = await fetchAllGames(); // Fetch from database
    cachedSeriesMap = buildSeriesMap(games);
  }

  return NextResponse.json(Array.from(cachedSeriesMap.entries()));
}