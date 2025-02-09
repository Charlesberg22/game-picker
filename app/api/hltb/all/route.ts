import { NextResponse } from "next/server";
import { fetchAllGames } from "../../../lib/data";
import { HowLongToBeatService } from "../../../hltb/howlongtobeat"; // Taken from https://github.com/ckatzorke/howlongtobeat/
import { dbRun } from "../../transactions";

async function updateFromHltb() {
  const hltbService = new HowLongToBeatService();
  const [games, searchKey] = await Promise.all([
    fetchAllGames(),
    hltbService.getSearchKey(),
  ]);
  const updateQuery = `
    UPDATE games
    SET hltb_time = ?
    WHERE game_id = ?
  `;

  // not promise.all to avoid overloading external API
  for (const game of games) {
    try {
      const result = await hltbService.search(game.name, searchKey);
      const newTime = result[0].gameplayMainExtra;
      const values = [String(newTime), String(game.game_id)];
      await dbRun(updateQuery, values);
    } catch (error) {
      console.error(`HLTB fetch error with ${game.name}:`, error);
    }
    break;
  }
}

export async function GET() {
  try {
    await updateFromHltb();
    return NextResponse.json("Successfully update HLTB times");
  } catch (error: any) {
    console.error("Error:", error.message);
    return NextResponse.json({ error }, { status: 500 });
  }
}
