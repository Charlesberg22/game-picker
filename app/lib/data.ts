import { dbAll, dbGet } from "../api/transactions";

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

export type Stats = {
  number_of_games: number;
  total_length: number;
  number_of_retro: number;
  number_of_modern: number;
  number_of_handheld: number;
  number_of_desktop: number;
  average_length: number;
  ratio_modern_retro: number;
  ratio_desktop_handheld: number;
};

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export async function fetchAllGames(): Promise<GamesTable[]> {
  try {
    const response = await fetch(`${baseUrl}/api/games`);
    if (!response.ok) throw new Error('Failed to fetch games');
    return await response.json();
  } catch (error) {
    console.error('Error fetching games:', error);
    throw error;
  }
}

export async function fetchFilteredGames(query: string): Promise<GamesTable[]> {
  const values = Array(4).fill(`%${query}%`)
  if (query == 'retro') {
    values.push('1')
  } else if (query == 'modern') {
    values.push('0')
  } else {
    values.push('')
  }
  if (query == 'handheld') {
    values.push('1')
  } else if (query == 'desktop') {
    values.push('0')
  } else {
    values.push('')
  }
  if (query == 'tried') {
    values.push('1')
  } else {
    values.push('')
  }
  if (query == 'finished') {
    values.push('1')
  } else {
    values.push('')
  }
  
  try {
    const response = await dbAll(`
      SELECT game_id, games.platform_id, platform_name, name, licence, play_method, retro, handheld, prequel_id, hltb_time, tried, finished, rating, when_played, img
      FROM games
      JOIN platforms ON games.platform_id = platforms.platform_id
      WHERE
        platforms.platform_name LIKE ? OR
        name LIKE ? OR
        licence LIKE ? OR
        play_method LIKE ? OR
        retro = ? OR
        handheld = ? OR
        tried = ? OR
        finished = ?
      ORDER BY games.platform_id, name
    `,
    values) as GamesTable[];
    if (!response) throw new Error('Failed to fetch games');
    return response;
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
}

export async function checkIfPrequelRequired(prequel_id: number): Promise<Boolean> {
  const response = await dbGet(`SELECT game_id, tried FROM games WHERE game_id = ?`, [String(prequel_id)]) as GamesTable;
  if (response !== undefined) {
    return response.tried == null;
  }
  return false;
}

export async function fetchGameById(id: string): Promise<GamesTable> {
  try {
    const response = await dbGet(`SELECT * FROM games WHERE game_id = ?`, [id]) as GamesTable;
    if (!response) throw new Error('Failed to fetch game');
    return response;
  } catch (error) {
    console.error('Error fetching game:', error);
    throw error;
  }
}

export async function fetchPlatforms(): Promise<Platform[]> {
  try {
    const response = await dbAll(`SELECT * FROM platforms`) as Platform[];
    if (!response) throw new Error('Failed to fetch platforms');
    return response;
  } catch (error) {
    console.error('Error fetching platforms:', error);
    throw error;
  }
}

export async function checkUnplayedStats(): Promise<Stats> {
  try {
    const response = await dbGet(`
      SELECT (
        SELECT COUNT(*)
        FROM games
        WHERE tried IS NULL
      ) AS number_of_games,
      ( SELECT SUM(hltb_time)
	      FROM games
	      WHERE tried IS NULL
      ) AS total_length,
      ( SELECT COUNT(*)
        FROM games
        WHERE tried IS NULL AND retro = 1
      ) AS number_of_retro,
      ( SELECT COUNT(*)
        FROM games
        WHERE tried IS NULL AND retro = 0
      ) AS number_of_modern,
      ( SELECT COUNT(*)
        FROM games
        WHERE tried IS NULL AND handheld = 1
      ) AS number_of_handheld,
      ( SELECT COUNT(*)
        FROM games
        WHERE tried IS NULL AND handheld = 0
      ) AS number_of_desktop
    `) as Stats;
    if (!response) throw new Error('Failed to fetch platforms');

    response.average_length = Math.round(response.total_length / response.number_of_games);
    response.ratio_modern_retro = Math.round(response.number_of_modern / response.number_of_retro * 10) / 10;
    response.ratio_desktop_handheld = Math.round(response.number_of_desktop / response.number_of_handheld * 10) / 10;

    return response;
  } catch (error) {
    console.error('Error fetching platforms:', error);
    return {} as Stats;
  }
}

export async function checkPlayedStats(): Promise<Stats> {
  try {
    const response = await dbGet(`
      SELECT (
        SELECT COUNT(*)
        FROM games
        WHERE tried = 1 AND retro = 1
      ) AS number_of_retro,
      ( SELECT COUNT(*)
        FROM games
        WHERE tried = 1 AND retro = 0
      ) AS number_of_modern,
      ( SELECT COUNT(*)
        FROM games
        WHERE tried = 1 AND handheld = 1
      ) AS number_of_handheld,
      ( SELECT COUNT(*)
        FROM games
        WHERE tried = 1 AND handheld = 0
      ) AS number_of_desktop
    `) as Stats;
    if (!response) throw new Error('Failed to fetch platforms');

    response.ratio_modern_retro = Math.round(response.number_of_modern / response.number_of_retro * 10) / 10;
    response.ratio_desktop_handheld = Math.round(response.number_of_desktop / response.number_of_handheld * 10) / 10;
    
    return response;
  } catch (error) {
    console.error('Error fetching platforms:', error);
    return {} as Stats;
  }
}