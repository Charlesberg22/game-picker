import { checkIfPrequelRequired, fetchFilteredGames } from '@/app/lib/data'
import GenericGamesTable from './generic-table';

export default async function AllGamesTable({query}: {query: string}) {
  const games = await fetchFilteredGames(query);
  const gamesWithPrequel = await Promise.all(
    games.map(async (game: any) => {
      const prequel_required = 
        game.prequel_id === null
          ? false
          : await checkIfPrequelRequired(game.prequel_id);
      return { ...game, prequel_required };
    })
  );

  return (<GenericGamesTable games={gamesWithPrequel}/>)
}

