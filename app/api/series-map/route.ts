import { NextResponse } from "next/server";
import { fetchAllGames } from "@/app/lib/data";
import { buildSeriesMap } from "@/app/lib/utils";
import { GamesTable } from "@/app/lib/definitions";

let cachedSeriesMap: Map<number, GamesTable[]> | null = null;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const refresh = searchParams.get("refresh") === "true";

  // return the cached seriesMap as long as it is stored, or until refresh api route is called (when games added/updated/deleted)
  if (!cachedSeriesMap || refresh) {
    const games = await fetchAllGames();
    cachedSeriesMap = buildSeriesMap(games);
  }

  return NextResponse.json(Array.from(cachedSeriesMap.entries()));
}
