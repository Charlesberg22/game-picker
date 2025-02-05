import { fetchFilteredGames } from "@/app/lib/data";
import GenericGamesTable from "./generic-table";
import GameCard from "./game-card";

export default async function AllGamesTable({ query, view }: { query: string, view: boolean }) {
  const games = await fetchFilteredGames(query);

  return (
    <div>
      {view ? (
         <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 p-4 justify-items-center">
         {games.map((game) => (
           <GameCard key={game.game_id} game={game} />
         ))}
         </div>
      ) : (
        <GenericGamesTable games={games} vertPos={"124px"} />
      )}
    </div>
  );
}
