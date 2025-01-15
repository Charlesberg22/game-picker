import { fetchFilteredGames } from '@/app/lib/data'
import GenericGamesTable from './generic-table';

export default async function AllGamesTable({query}: {query: string}) {
  const games = await fetchFilteredGames(query);

  return (<GenericGamesTable games={games}/>)
}

