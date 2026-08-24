import { ArrowPathIcon } from "@heroicons/react/24/outline";
import {
  checkPlayedStats,
  checkToPlayStats,
  fetchAllGames,
  fetchGameOptions,
  getEarliestPlayedDate,
  getEarliestReleaseDate,
} from "../lib/data";
import GenericGamesTable from "../ui/generic-table";
import { refreshRandomGame } from "../lib/actions";
import { Metadata } from "next";
import GameCard from "../ui/game-card";
import { GamesTable } from "../lib/definitions";
import { buildSeriesMap } from "../lib/utils";

export const metadata: Metadata = {
  title: "Randomiser",
};

type WeightedGame = GamesTable & {
  weighting: number;
};

async function calculateRandomWeight(games: GamesTable[], modernPreferred: boolean, desktopPreferred: boolean): Promise<WeightedGame[]> {
  const [earliestReleaseDate, earliestPlayDate] = await Promise.all([
    getEarliestReleaseDate(),
    getEarliestPlayedDate(),
  ]);
    const allGames = await fetchAllGames();
    const seriesMap = buildSeriesMap(allGames);

  return games.map((game) => {
    let weighting = 0;
    if (game.retro != modernPreferred) {
      weighting += 10;
    }
    if (game.handheld != desktopPreferred) {
      weighting += 10;
    }
    weighting += ((seriesMap.get(game.game_id)?.length || 1) - 1);

    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const todayTime = Date.now();

    if (game.latest_played == null && game.release_date != null && game.release_date != "") {
      const earliest = new Date(earliestReleaseDate).getTime();
      const release = new Date(game.release_date).getTime();
      const totalDays = (todayTime - earliest) / MS_PER_DAY;
      const releaseDays = (release - earliest) / MS_PER_DAY;

      weighting += 20 * Math.abs(releaseDays / totalDays - 0.5);
    } else if (game.latest_played != null && game.latest_played != "") {
      const earliest = new Date(earliestPlayDate).getTime();
      const played = new Date(game.latest_played).getTime();
      const playedDays = (todayTime - played) / MS_PER_DAY;
      const totalDays = (todayTime - earliest) / MS_PER_DAY;

      weighting += 10 * playedDays / totalDays;
    }

    if (game.licence_id != 6) {
      weighting += 10
    }
    weighting -= game.hltb_time / 20;
    
    return {
      ...game,
      weighting,
    };
  });
}

function getWeightedRandomGame(games: WeightedGame[]): WeightedGame {
  const totalWeight = games.reduce(
    (sum, game) => sum + game.weighting,
    0,
  );

  let random = Math.random() * totalWeight;

  for (const game of games) {
    random -= game.weighting;

    if (random <= 0) {
      return game;
    }
  }

  return games[games.length - 1];
}

export default async function Page() {
  const [toPlayStats, playedStats] = await Promise.all([
    checkToPlayStats(),
    checkPlayedStats(),
  ]);

  // overall ratio of modern to retro including played and unplayed (but not skipped)
  const overall_ratio_modern_retro =
    (toPlayStats.number_of_modern + playedStats.number_of_modern) /
    (toPlayStats.number_of_retro + playedStats.number_of_retro);

  // boolean testing whether the ratio of played modern:retro games is greater than the overall ratio of modern: retro games
  const moreModernGamesPlayed =
    overall_ratio_modern_retro < playedStats.ratio_modern_retro;

  // determines count of games of modern/retro type to be played to get the ratio of played and overall games to match
  const remainingByEra = moreModernGamesPlayed
    ? {
        type: "retro",
        remaining: Math.ceil(
          playedStats.number_of_modern / overall_ratio_modern_retro -
            playedStats.number_of_retro,
        ),
      }
    : {
        type: "modern",
        remaining: Math.ceil(
          playedStats.number_of_retro * overall_ratio_modern_retro -
            playedStats.number_of_modern,
        ),
      };

  // as above for desktop:handheld
  const overall_ratio_desktop_handheld =
    (toPlayStats.number_of_desktop + playedStats.number_of_desktop) /
    (toPlayStats.number_of_handheld + playedStats.number_of_handheld);

  const moreDesktopGamesPlayed =
    overall_ratio_desktop_handheld < playedStats.ratio_desktop_handheld;
  const remainingByScreenType = moreDesktopGamesPlayed
    ? {
        type: "handheld",
        remaining: Math.ceil(
          playedStats.number_of_desktop / overall_ratio_desktop_handheld -
            playedStats.number_of_handheld,
        ),
      }
    : {
        type: "on a big screen",
        remaining: Math.ceil(
          playedStats.number_of_handheld * overall_ratio_desktop_handheld -
            playedStats.number_of_desktop,
        ),
      };

  const games = await fetchGameOptions();

  const weightedGames = await calculateRandomWeight(
    games,
    moreModernGamesPlayed ? false : true,
    moreDesktopGamesPlayed ? false : true,
  );

  weightedGames.sort((a, b) => b.weighting - a.weighting);

  // update to use weighting in randomiser function
  const randomGame = getWeightedRandomGame(weightedGames);

  return (
    <div className="w-full">
      <div className="sticky top-[60px] z-10 gap-10 pt-2 pb-4 pl-2 flex bg-neutral-950">
        <form className="w-full mr-2 md:w-auto" action={refreshRandomGame}>
          <button
            type="submit"
            id="submit-form"
            className="flex h-10 md:h-10 w-full items-center rounded-lg bg-blue-600 px-4 text-sm md:text-md font-medium text-white"
          >
            <span className="hidden md:block">
              Choosing a {remainingByEra.type} game ({remainingByEra.remaining}{" "}
              remaining) that is played {remainingByScreenType.type} (
              {remainingByScreenType.remaining} remaining)
            </span>
            <span className="block text-center max-w-[100px] min-w-[100px] md:hidden">
              {moreModernGamesPlayed ? "Retro" : "Modern"} (
              {remainingByEra.remaining}) &{" "}
              {moreDesktopGamesPlayed ? "Handheld" : "Desktop"} (
              {remainingByScreenType.remaining})
            </span>
            <ArrowPathIcon className="h-5 md:h-5 px-4 min-w-[30px]" />
            <span className="flex-1 max-w-[270px] md:max-w-[400px]">
              {randomGame.name}
            </span>
          </button>
        </form>
      </div>
      <div className="flex justify-center md:justify-start pb-2 pl-2">
        <label htmlFor="submit-form" className="cursor-pointer">
          <GameCard game={randomGame} />
        </label>
      </div>
      <GenericGamesTable games={weightedGames} vertPos={"124px"} randomiser={true} />
    </div>
  );
}
