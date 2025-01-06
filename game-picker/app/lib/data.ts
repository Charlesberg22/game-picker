import { apiGet } from "../api/transactions";

export type GamesTable = {
  game_id: number;
  platform_name: string;
  name: string;
  licence: string;
  play_method: string;
  retro: boolean;
  handheld: boolean;
  prequel_id: number;
  hltb_time: number;
  tried: boolean;
  finished: boolean;
  rating: string;
  when_played: string;
  img: string
};

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export async function fetchAllGames(): Promise<GamesTable[]> {
  try {
    const response = await fetch(`${baseUrl}/api/games`); //update to be relative
    if (!response.ok) throw new Error('Failed to fetch games');
    return await response.json();
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
}

export async function checkIfPrequelRequired(prequel_id: number): Promise<Boolean> {
  const prequel = await apiGet(`SELECT game_id, tried FROM games WHERE game_id = ${prequel_id}`) as GamesTable;
  if (prequel.tried !== null) {
    return false
  } else {
    return true
  }
}