import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { checkPlayedStats, checkUnplayedStats, fetchGameOptions } from "../lib/data";
import GenericGamesTable from "../ui/generic-table";
import { revalidatePath } from "next/cache";
import { refreshRandomGame } from "../lib/actions";


export default async function Page() {

  const unplayedStats = await checkUnplayedStats();
  const playedStats = await checkPlayedStats();

  const retro = unplayedStats.ratio_modern_retro < playedStats.ratio_modern_retro;
  const remainingRetro = retro
    ? Math.ceil(playedStats.number_of_modern / unplayedStats.ratio_modern_retro - playedStats.number_of_retro)
    : Math.ceil(playedStats.number_of_retro * unplayedStats.ratio_modern_retro - playedStats.number_of_modern);

  const handheld = unplayedStats.ratio_desktop_handheld < playedStats.ratio_desktop_handheld;
  const remainingHandheld = retro
    ? Math.ceil(playedStats.number_of_desktop / unplayedStats.ratio_desktop_handheld - playedStats.number_of_handheld)
    : Math.ceil(playedStats.number_of_handheld * unplayedStats.ratio_desktop_handheld - playedStats.number_of_desktop);

  const games = await fetchGameOptions(retro, handheld);

  const randomGame = games[Math.floor(Math.random() * games.length)]

  return (
    <div className="w-full">
      <div className="sticky top-[60px] gap-10 pt-2 pb-4 pl-2 flex bg-neutral-950">
        <form action={refreshRandomGame}>
          <button type="submit" className="flex mr-2 h-10 items-center rounded-lg bg-blue-600 px-4 text-md font-medium text-white">
            Choosing a {retro ? 'retro' : 'modern'} game ({remainingRetro} remaining) that is played {handheld ? 'handheld' : 'on a big screen'} ({remainingHandheld} remaining)
            <ArrowPathIcon className="h-5 px-4"/>
            {randomGame.name}
          </button>
        </form>
      </div>
      <GenericGamesTable games={games}/>
    </div>
  );
}