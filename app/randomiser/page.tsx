import { ArrowPathIcon } from "@heroicons/react/24/outline";
import {
  checkPlayedStats,
  checkUnplayedStats,
  fetchGameOptions,
} from "../lib/data";
import GenericGamesTable from "../ui/generic-table";
import { refreshRandomGame } from "../lib/actions";
import { Metadata } from "next";
import GameCard from "../ui/game-card";

export const metadata: Metadata = {
  title: "Randomiser",
};

export default async function Page() {
  const [unplayedStats, playedStats] = await Promise.all([
    checkUnplayedStats(),
    checkPlayedStats(),
  ]);

  // overall ratio of modern to retro including played and unplayed (but not skipped)
  const overall_ratio_modern_retro =
    (unplayedStats.number_of_modern + playedStats.number_of_modern) /
    (unplayedStats.number_of_retro + playedStats.number_of_retro);

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
    (unplayedStats.number_of_desktop + playedStats.number_of_desktop) /
    (unplayedStats.number_of_handheld + playedStats.number_of_handheld);

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

  const games = await fetchGameOptions(
    moreModernGamesPlayed,
    moreDesktopGamesPlayed,
  );

  const randomGame = games[Math.floor(Math.random() * games.length)];

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
      <GenericGamesTable games={games} vertPos={"124px"} randomiser={true} />
    </div>
  );
}
