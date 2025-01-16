import { dbAll, dbGet } from "../api/transactions";
import { getBaseUrl } from "./utils";

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
  prequel_required: boolean;
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

const baseUrl = getBaseUrl();

export async function fetchAllGames(): Promise<GamesTable[]> {
  try {
    const response = await dbAll(`
    SELECT game_id, platform_name, name, licence, play_method, retro, handheld, prequel_id, hltb_time, tried, finished, rating, when_played, img
    FROM games
    JOIN platforms ON games.platform_id = platforms.platform_id
    `) as GamesTable[];
    if (!response) throw new Error('Failed to fetch games');
    return response;
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
    values.push('1', '1')
  } else if (query == 'avoided') {
    values.push('0', '0')
  } else if (query == 'untried') {
    values.push('null', '')
  } else {
    values.push('', '')
  }
  if (query == 'finished') {
    values.push('1')
  } else if (query == 'unfinished') {
    values.push('0')
  } else {
    values.push('')
  }
  
  try {
    const response = await dbAll(`
      SELECT
        game_id,
        games.platform_id,
        platform_name,
        name, licence,
        play_method,
        retro,
        handheld,
        prequel_id,
        hltb_time,
        tried,
        finished,
        rating,
        when_played,
        img,
        (SELECT 1
          FROM games AS prequel
          WHERE prequel.game_id = games.prequel_id
          AND prequel.tried IS NULL) AS prequel_required
      FROM games
      JOIN platforms ON games.platform_id = platforms.platform_id
      WHERE platforms.platform_name LIKE ?
      OR name LIKE ?
      OR licence LIKE ?
      OR play_method LIKE ?
      OR retro = ?
      OR handheld = ?
      OR (CASE WHEN ? = 'null' THEN tried IS NULL ELSE tried = ? END)
      OR finished = ?
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

export async function fetchGameOptions(retro: boolean, handheld: boolean): Promise<GamesTable[]> {
  try {
    const response = await dbAll(`
      SELECT game_id, games.platform_id, platform_name, name, licence, play_method, retro, handheld, prequel_id, hltb_time, tried, finished, rating, when_played, img
      FROM games
      JOIN platforms ON games.platform_id = platforms.platform_id
      WHERE retro = ?
      AND handheld = ?
      AND tried IS NULL
      AND (prequel_id IS NULL OR
          EXISTS (
              SELECT 1
              FROM games AS prequel
              WHERE prequel.game_id = games.prequel_id
              AND prequel.tried IS NOT NULL
          )
      )`, [String(Number(retro)), String(Number(handheld))]) as GamesTable[];
    if (!response) throw new Error('Failed to fetch game');
    return response;
  } catch (error) {
    console.error('Error fetching game:', error);
    return {} as GamesTable[];
  }
}

export async function fetchGameTimeline(): Promise<GamesTable[]> {
  try {
    const response = await dbAll(`
      SELECT game_id, games.platform_id, platform_name, name, licence, play_method, retro, handheld, prequel_id, hltb_time, tried, finished, rating, when_played, img
      FROM games
      JOIN platforms ON games.platform_id = platforms.platform_id
      WHERE tried = 1
      ORDER by when_played, hltb_time DESC
    `) as GamesTable[];
    if (!response) throw new Error('Failed to fetch game');
    return response;
  } catch (error) {
    console.error('Error fetching game:', error);
    return {} as GamesTable[];
  }
}