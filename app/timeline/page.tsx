import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { fetchGameTimeline } from "../lib/data";
import GenericGamesTable from "../ui/generic-table";


export default async function Page() {

  const games = await fetchGameTimeline();

  return (
    <div className="w-full">
      <div className="sticky top-[60px] pt-2 h-16 pl-2 flex bg-neutral-950">
      </div>
      <GenericGamesTable games={games}/>
    </div>
  );
}