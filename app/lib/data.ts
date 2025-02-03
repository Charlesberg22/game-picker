import { dbAll, dbGet } from "../api/transactions";
import { removeKeywords } from "./utils";

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
  img: string;
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

export async function fetchAllGames(): Promise<GamesTable[]> {
  try {
    const response = (await dbAll(`
    SELECT game_id, platform_name, name, licence, play_method, retro, handheld, prequel_id, hltb_time, tried, finished, rating, when_played, img
    FROM games
    JOIN platforms ON games.platform_id = platforms.platform_id
    `)) as GamesTable[];
    if (!response) throw new Error("Failed to fetch games");
    return response;
  } catch (error) {
    console.error("Error fetching games:", error);
    throw error;
  }
}

export async function fetchFilteredGames(query: string): Promise<GamesTable[]> {
  query = query.toLowerCase();
  const words = query.split(" ");
  const keywordLessQuery = words.filter(removeKeywords).join(" ");
  const values = Array(4).fill(`%${keywordLessQuery}%`);
  if (query.includes("retro")) {
    values.push("1");
  } else if (query.includes("modern")) {
    values.push("0");
  } else {
    values.push("%");
  }
  if (query.includes("handheld")) {
    values.push("1");
  } else if (query.includes("desktop")) {
    values.push("0");
  } else {
    values.push("%");
  }
  if (query.includes("prequel")) {
    values.push("1");
  } else if (query.includes("playable")) {
    values.push("0");
  } else {
    values.push("%");
  }
  if (query.includes("timeline")) {
    values.push("1", "1", "1", "%", "%", "timeline", "timeline");
  } else {
    if (query.includes(" tried")) {
      values.push("1", "1", "1");
    } else if (query.includes("avoided")) {
      values.push("0", "0", "0");
    } else if (query.includes("untried")) {
      values.push("", "null", "");
    } else {
      values.push("%", "%", "%");
    }
    if (query.includes(" finished")) {
      values.push("1", "1");
    } else if (query.includes("unfinished")) {
      values.push("0", "0");
    } else {
      values.push("%", "%");
    }
    values.push("", "");
  }

  // tried and finished are treated differently due to their nullability
  try {
    const response = (await dbAll(
      `
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
        COALESCE((
          SELECT
            CASE
              WHEN prequel.game_id = games.prequel_id
              AND prequel.tried IS NULL
                THEN 1
              ELSE 0
            END
          FROM games AS prequel
          WHERE prequel.game_id = games.prequel_id
        ), 0) AS prequel_required
      FROM games
      JOIN platforms ON games.platform_id = platforms.platform_id
      WHERE (
        platforms.platform_name LIKE ?
        OR name LIKE ?
        OR licence LIKE ?
        OR play_method LIKE ?
      )
      AND retro LIKE ?
      AND handheld LIKE ?
      AND prequel_required LIKE ?
      AND (? = '%' OR (? = 'null' AND tried IS NULL) OR tried LIKE ?)
      AND (finished = ? OR ? = '%')
      ORDER BY 
        CASE
          WHEN ? = 'timeline' THEN when_played
          ELSE games.platform_id
        END,
        CASE
          WHEN ? != 'timeline' THEN name
          ELSE -hltb_time
        END
    `,
      values,
    )) as GamesTable[];
    if (!response) throw new Error("Failed to fetch games");
    return response;
  } catch (error) {
    console.error("Error fetching games:", error);
    return [];
  }
}

export async function fetchGameById(id: string): Promise<GamesTable> {
  try {
    const response = (await dbGet(`SELECT * FROM games WHERE game_id = ?`, [
      id,
    ])) as GamesTable;
    if (!response) throw new Error("Failed to fetch game");
    return response;
  } catch (error) {
    console.error("Error fetching game:", error);
    throw error;
  }
}

export async function fetchPlatforms(): Promise<Platform[]> {
  try {
    const response = (await dbAll(`SELECT * FROM platforms`)) as Platform[];
    if (!response) throw new Error("Failed to fetch platforms");
    return response;
  } catch (error) {
    console.error("Error fetching platforms:", error);
    throw error;
  }
}

export async function checkUnplayedStats(): Promise<Stats> {
  try {
    const response = (await dbGet(`
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
    `)) as Stats;
    if (!response) throw new Error("Failed to fetch platforms");

    response.average_length = Math.round(
      response.total_length / response.number_of_games,
    );
    response.ratio_modern_retro =
      Math.round((response.number_of_modern / response.number_of_retro) * 10) /
      10;
    response.ratio_desktop_handheld =
      Math.round(
        (response.number_of_desktop / response.number_of_handheld) * 10,
      ) / 10;

    return response;
  } catch (error) {
    console.error("Error fetching platforms:", error);
    return {} as Stats;
  }
}

// number_of_games is both played and ignored, for use in total no. of games, not only played
export async function checkPlayedStats(): Promise<Stats> {
  try {
    const response = (await dbGet(`
      SELECT (
        SELECT COUNT(*)
        FROM games
        WHERE tried IS NOT NULL
      ) AS number_of_games,
      ( SELECT COUNT(*)
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
    `)) as Stats;
    if (!response) throw new Error("Failed to fetch platforms");

    response.ratio_modern_retro =
      Math.round((response.number_of_modern / response.number_of_retro) * 10) /
      10;
    response.ratio_desktop_handheld =
      Math.round(
        (response.number_of_desktop / response.number_of_handheld) * 10,
      ) / 10;

    return response;
  } catch (error) {
    console.error("Error fetching platforms:", error);
    return {} as Stats;
  }
}

export async function fetchGameOptions(
  retro: boolean,
  handheld: boolean,
): Promise<GamesTable[]> {
  try {
    const response = (await dbAll(
      `
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
      )`,
      [String(Number(retro)), String(Number(handheld))],
    )) as GamesTable[];
    if (!response) throw new Error("Failed to fetch game");
    return response;
  } catch (error) {
    console.error("Error fetching game:", error);
    return {} as GamesTable[];
  }
}

export async function fetchGameTimeline(): Promise<GamesTable[]> {
  try {
    const response = (await dbAll(`
      SELECT game_id, games.platform_id, platform_name, name, licence, play_method, retro, handheld, prequel_id, hltb_time, tried, finished, rating, when_played, img
      FROM games
      JOIN platforms ON games.platform_id = platforms.platform_id
      WHERE tried = 1
      ORDER by when_played, hltb_time DESC
    `)) as GamesTable[];
    if (!response) throw new Error("Failed to fetch game");
    return response;
  } catch (error) {
    console.error("Error fetching game:", error);
    return {} as GamesTable[];
  }
}
