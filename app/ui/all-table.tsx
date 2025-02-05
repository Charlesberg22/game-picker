import { fetchFilteredGames } from "@/app/lib/data";
import GenericGamesTable from "./generic-table";
import GameCard from "./game-card";
import { DeleteGame, UpdateGame } from "./buttons";
import SmallGameCard from "./small-game-card";

export default async function AllGamesTable({
  query,
  view,
}: {
  query: string;
  view: boolean;
}) {
  const games = await fetchFilteredGames(query);

  return (
    <div>
      {view ? (
        <div>
          <div className="md:grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 p-4 justify-items-center hidden">
            {games.map((game) => (
              <div className="relative group" key={game.game_id}>
                <GameCard game={game} />
                <div className="absolute top-2 ml-2 flex justify-start gap-4 text-sm font-semibold opacity-0 group-hover:opacity-100">
                  <UpdateGame id={String(game.game_id)} />
                  <DeleteGame id={String(game.game_id)} />
                </div>
              </div>
            ))}
          </div>
          <div className="grid md:hidden grid-cols-3 gap-1 p-1 justify-items-center">
            {games.map((game) => (
              <div className="relative group" key={game.game_id}>
                <SmallGameCard game={game} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <GenericGamesTable games={games} vertPos={"124px"} />
      )}
    </div>
  );
}
