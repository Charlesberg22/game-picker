"use client"

import { GamesTable } from "../lib/data";
import { UpdateGame } from "./buttons";
import { formatDate } from "@/app/lib/utils";
import { DeleteGame } from "./delete-buttons";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function GenericGamesTable({
  games,
  vertPos,
  randomiser,
}: {
  games: GamesTable[];
  vertPos: string;
  randomiser: boolean;
}) {
  const { data: seriesData } = useSWR("/api/series-map", fetcher);
  const seriesMap = new Map(seriesData) as Map<number, GamesTable[]>;

  return (
    <div className="flow-root bg-neutral-950">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-indigo-950 px-2 pb-2 pt-0">
          <table className="min-w-full text-gray-80">
            <thead
              className={`rounded-lg sticky top-[${vertPos}] bg-indigo-950 text-left text-sm font-normal`}
            >
              <tr>
                <th
                  scope="col"
                  className="hidden md:table-cell px-4 py-5 font-medium sm:pl-6 w-[108px]"
                >
                  Platform
                </th>
                <th
                  scope="col"
                  className="px-3 py-5 font-medium min-w-[240px] md:w-[480px]"
                >
                  Game
                </th>
                <th
                  scope="col"
                  className="hidden md:table-cell px-3 py-5 font-medium w-[244px]"
                >
                  Licence
                </th>
                <th
                  scope="col"
                  className="hidden md:table-cell px-3 py-5 font-medium w-[180px]"
                >
                  Play Method
                </th>
                <th
                  scope="col"
                  className="hidden md:table-cell px-3 py-5 font-medium w-10 text-center"
                >
                  Retro?
                </th>
                <th
                  scope="col"
                  className="hidden md:table-cell px-3 py-5 font-medium w-10 text-center"
                >
                  Handheld?
                </th>
                <th
                  scope="col"
                  className="hidden md:table-cell px-3 py-5 font-medium w-24 text-center"
                >
                  Prequel Required?
                </th>
                <th
                  scope="col"
                  className="hidden md:table-cell px-3 py-5 font-medium w-16 text-center"
                >
                  HLTB
                </th>
                <th
                  scope="col"
                  className="hidden md:table-cell px-3 py-5 font-medium w-10 text-center"
                >
                  Tried?
                </th>
                <th
                  scope="col"
                  className="hidden md:table-cell px-3 py-5 font-medium w-10 text-center"
                >
                  Finished?
                </th>
                <th
                  scope="col"
                  className="hidden md:table-cell px-3 py-5 font-medium w-16 text-center"
                >
                  Rating
                </th>
                <th
                  scope="col"
                  className="hidden md:table-cell px-3 py-5 font-medium w-[108px]"
                >
                  Date Played
                </th>
                {randomiser && <th
                  scope="col"
                  className="table-cell px-3 py-5 font-medium w-[80px]"
                >
                  <span className="hidden md:block">Unlocks #</span> 
                </th>}
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-black">
              {games?.map((game) => (
                <tr
                  key={game.game_id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="hidden md:table-cell whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p>{game.platform_name}</p>
                    </div>
                  </td>
                  <td className="whitespace-normal px-3 py-3">{game.name}</td>
                  <td className="hidden md:table-cell whitespace-nowrap px-3 py-3">
                    {game.licence}
                  </td>
                  <td className="hidden md:table-cell whitespace-nowrap px-3 py-3">
                    {game.play_method}
                  </td>
                  <td className="hidden md:table-cell whitespace-nowrap px-3 py-3">
                    {game.retro ? "✔️" : "❌"}
                  </td>
                  <td className="hidden md:table-cell whitespace-nowrap px-3 py-3 text-center">
                    {game.handheld ? "✔️" : "❌"}
                  </td>
                  <td className="hidden md:table-cell whitespace-nowrap px-3 py-3 text-center">
                    {game.prequel_required ? "✔️" : "❌"}
                  </td>
                  <td className="hidden md:table-cell whitespace-nowrap px-3 py-3 text-center">
                    {game.hltb_time}
                  </td>
                  <td className="hidden md:table-cell whitespace-nowrap px-3 py-3 text-center">
                    {game.tried ? "✔️" : game.tried === null ? "" : "❌"}
                  </td>
                  <td className="hidden md:table-cell whitespace-nowrap px-3 py-3 text-center">
                    {game.finished ? "✔️" : game.finished === null ? "" : "❌"}
                  </td>
                  <td className="hidden md:table-cell whitespace-nowrap px-3 py-3 text-center">
                    {game.rating}
                  </td>
                  <td className="hidden md:table-cell whitespace-nowrap px-3 py-3">
                    {formatDate(game.when_played)}
                  </td>
                  {randomiser && <td className="table-cell whitespace-nowrap px-3 py-3">
                    {(seriesMap.get(game.game_id)?.length || 1) - 1 }
                  </td>}
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateGame id={String(game.game_id)} />
                      <DeleteGame id={String(game.game_id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
