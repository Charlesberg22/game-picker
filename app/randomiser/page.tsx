import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { checkPlayedStats, checkUnplayedStats, fetchGameOptions } from "../lib/data";
import GenericGamesTable from "../ui/generic-table";
import { refreshRandomGame } from "../lib/actions";


export default async function Page() {

  const unplayedStats = await checkUnplayedStats();
  const playedStats = await checkPlayedStats();

  const overall_ratio_modern_retro = (unplayedStats.number_of_modern + playedStats.number_of_modern) / (unplayedStats.number_of_retro + playedStats.number_of_retro);

  const moreModernGamesPlayed = overall_ratio_modern_retro < playedStats.ratio_modern_retro;
  const remainingByEra = moreModernGamesPlayed
    ? {
      type: "retro",
      remaining: Math.ceil(
        playedStats.number_of_modern / overall_ratio_modern_retro -
        playedStats.number_of_retro
      ),
    }
    : {
      type: "modern",
      remaining: Math.ceil(
        playedStats.number_of_retro * overall_ratio_modern_retro -
        playedStats.number_of_modern
      ),
    };

  const overall_ratio_desktop_handheld = (unplayedStats.number_of_desktop + playedStats.number_of_desktop) / (unplayedStats.number_of_handheld + playedStats.number_of_handheld);
  
  const moreDesktopGamesPlayed = overall_ratio_desktop_handheld < playedStats.ratio_desktop_handheld;
  const remainingByScreenType = moreDesktopGamesPlayed
    ? {
      type: "handheld",
      remaining: Math.ceil(
        playedStats.number_of_desktop / overall_ratio_desktop_handheld -
        playedStats.number_of_handheld
      ),
    }
    : {
      type: "on a big screen",
      remaining: Math.ceil(
        playedStats.number_of_handheld * overall_ratio_desktop_handheld -
        playedStats.number_of_desktop
      ),
    };

  const games = await fetchGameOptions(moreModernGamesPlayed, moreDesktopGamesPlayed);

  const randomGame = games[Math.floor(Math.random() * games.length)]

  return (
    <div className="w-full">
      <div className="sticky top-[60px] gap-10 pt-2 pb-4 pl-2 flex bg-neutral-950">
        <form action={refreshRandomGame}>
          <button type="submit" className="flex mr-2 h-10 items-center rounded-lg bg-blue-600 px-4 text-md font-medium text-white">
            Choosing a {remainingByEra.type} game ({remainingByEra.remaining} remaining) that is played {remainingByScreenType.type} ({remainingByScreenType.remaining} remaining)
            <ArrowPathIcon className="h-5 px-4"/>
            {randomGame.name}
          </button>
        </form>
      </div>
      <GenericGamesTable games={games} vertPos={124}/>
    </div>
  );
}