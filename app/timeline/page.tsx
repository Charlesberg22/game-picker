import { fetchGameTimeline } from "../lib/data";
import GenericGamesTable from "../ui/generic-table";


export default async function Page() {

  const games = await fetchGameTimeline();

  return (
    <div className="w-full">
      <div className="sticky pl-2 flex bg-neutral-950">
      </div>
      <GenericGamesTable games={games} vertPos={60}/>
    </div>
  );
}