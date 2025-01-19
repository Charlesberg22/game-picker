import { checkIfPrequelRequired, fetchAllGames } from '@/app/lib/data'
import { DeleteGame, UpdateGame } from './buttons';
import { formatDate } from '@/app/lib/utils';

export default async function GamesTable() {
  const games = await fetchAllGames();

  const gamesWithPrequel = await Promise.all(
    games.map(async game => {
      const prequel_required = 
        game.prequel_id === null
          ? false
          : await checkIfPrequelRequired(game.prequel_id);
      return { ...game, prequel_required };
    })
  );

  return (
    <div className="flow-root bg-neutral-950">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-900 px-2 md:pt-0">
          <table className="hidden min-w-full text-gray-80 md:table">
            <thead className="rounded-lg sticky top-[124px] bg-gray-900 text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Platform
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Game
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Licence
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Play Method
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Retro?
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Handheld?
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Prequel Required?
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  HLTB
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Tried?
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Finished?
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Rating
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Date Played
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-black">
              {gamesWithPrequel?.map((game: any) => (
                <tr
                  key={game.game_id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p>{game.platform_name}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {game.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {game.licence}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {game.play_method}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {game.retro ? '✔️' : '❌'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {game.handheld ? '✔️' : '❌'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {game.prequel_required  ? '✔️' : '❌'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {game.hltb_time}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {game.tried ? '✔️' : (game.tried === null ? '' : '❌')}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {game.finished ? '✔️' : (game.finished === null ? '' : '❌')}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {game.rating}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDate(game.when_played)}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateGame id={game.game_id} />
                      <DeleteGame id={game.game_id} />
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
