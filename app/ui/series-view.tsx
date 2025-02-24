"use client";

import useSWR from "swr";
import { GamesTable } from "../lib/data";
import GameCard from "./game-card";
import { UpdateGame } from "./buttons";
import { DeleteGame } from "./delete-buttons";
import SmallGameCard from "./small-game-card";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function SeriesView() {
  const { data: seriesData } = useSWR("/api/series-map", fetcher);
  const seriesMap = new Map(seriesData) as Map<number, GamesTable[]>;
  const groupedGames = Array.from(seriesMap.values());

  return (
    <div>
      <div className="md:block hidden space-y-4 px-2">
        {groupedGames.map((series, index) => (
          <div key={index} className="overflow-x-auto scrollbar-hide">
            <div className="flex space-x-4">
              {series.map((game) => (
                <div
                  className="relative group min-w-[300px]"
                  key={game.game_id}
                >
                  <GameCard game={game} />
                  <div className="absolute top-2 ml-2 flex justify-start gap-4 text-sm font-semibold opacity-0 group-hover:opacity-100">
                    <UpdateGame id={String(game.game_id)} />
                    <DeleteGame id={String(game.game_id)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="md:hidden block space-y-3 px-2">
        {groupedGames.map((series, index) => (
          <div key={index} className="overflow-x-auto scrollbar-hide">
            <div className="flex space-x-1">
              {series.map((game) => (
                <div
                  className="relative group min-w-[100px] max-w-[100px]"
                  key={game.game_id}
                >
                  <SmallGameCard game={game} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
