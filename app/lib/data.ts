import { dbAll } from "../api/transactions";

export type GamesTable = {
  game_id: number;
  platform_id: number;
  platform_name: string;
  name: string;
  licence: string;
  play_method: string;
  retro: boolean;
  handheld: boolean;
  prequel_id: number | null;
  hltb_time: number;
  tried: boolean;
  finished: boolean;
  rating: string;
  when_played: string;
  img: string
};

export type Platform = {
  platform_id: number;
  platform_name: string;
};

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export async function fetchAllGames(): Promise<GamesTable[]> {
  try {
    const response = await fetch(`${baseUrl}/api/games`);
    if (!response.ok) throw new Error('Failed to fetch games');
    return await response.json();
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
}

export async function checkIfPrequelRequired(prequel_id: number): Promise<Boolean> {
  const response = await dbAll(`SELECT game_id, tried FROM games WHERE game_id = ?`, [String(prequel_id)]) as GamesTable;
  const prequel = Array.isArray(response) ? response[0] : response;
  if (prequel !== undefined) {
    return prequel.tried == null;
  }
  return false;
}

export async function fetchGameById(id: string): Promise<GamesTable> {
  try {
    const response = await dbAll(`SELECT * FROM games WHERE game_id = ?`, [id]) as GamesTable;
    if (!response) throw new Error('Failed to fetch game');
    const game = Array.isArray(response) ? response[0] : response;
    return game;
  } catch (error) {
    console.error('Error fetching game:', error);
    return {} as GamesTable;
  }
}

export async function fetchPlatforms(): Promise<Platform[]> {
  try {
    const response = await dbAll(`SELECT * FROM platforms`) as Platform[];
    if (!response) throw new Error('Failed to fetch platforms');
    return response;
  } catch (error) {
    console.error('Error fetching platforms:', error);
    return {} as Platform[];
  }
}