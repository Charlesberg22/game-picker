import { format } from "date-fns";
import { enAU } from "date-fns/locale";
import { NextApiRequest } from "next";
import { GamesTable } from "./data";

export function formatDate(dateStr: string): string | undefined {
  if (dateStr === "") {
    return;
  }

  const date = new Date(dateStr);
  return format(date, "do MMM yyyy", { locale: enAU });
}

export const getBaseUrl = (req?: NextApiRequest) => {
  if (typeof window !== "undefined") {
    // Client-side
    return `${window.location.protocol}//${window.location.host}`;
  }

  // Server-side
  if (req) {
    return `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host}`;
  }

  // Fallback for server-side without `req` (e.g., for build time only, as otherwise will error APPARENTLY)
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
};

const keywords = [
  "retro",
  "modern",
  "handheld",
  "desktop",
  "tried",
  "tbc",
  "avoided",
  "finished",
  "abandoned",
  "timeline",
  "playable",
  "prequel",
];

export function removeKeywords(word: string) {
  return !keywords.includes(word);
}

export function removePunctuation(name: string): string {
  return name.replace(/[^\w\s\-]|_/g, "").replace(/\s/g, "-");
}

export class CountingSemaphore {
  constructor(private concurrency: number) {}

  private queue: (() => void)[] = [];

  async acquire() {
    if (this.concurrency > 0) {
      this.concurrency--;
      return;
    }

    await new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
  }

  release() {
    this.concurrency++;
    const resolve = this.queue.shift();
    resolve?.();
  }
}

export function buildSeriesMap(games: GamesTable[]) {
  const gameMap = new Map<number, GamesTable>(); // map of all games for finding roots
  const sequelsMap = new Map<number, GamesTable[]>(); // Map of prequel_id -> games (direct sequels)
  const seriesMap = new Map<number, GamesTable[]>(); // Final series groups

  // Map all games by game_id for easy lookup, only unplayed for this purpose
  games.forEach((game) => {
    gameMap.set(game.game_id, game);
  });

  // For each game, if it has a prequel_id: store it in a map of prequel_id -> games[] (direct sequels)
  games.forEach((game) => {
    if (game.prequel_id) {
      if (!sequelsMap.has(game.prequel_id)) {
        sequelsMap.set(game.prequel_id, []);
      }
      sequelsMap.get(game.prequel_id)!.push(game);
    }
  });

  // roots of unplayed series, game must be unplayed and it must either not have a prequel or have a prequel that was played/skipped
  const roots = games.filter(
    (game) =>
      game.tried === null &&
      (!game.prequel_id || gameMap.get(game.prequel_id)?.tried !== null),
  );

  // Function to recursively build the series chain
  function buildChain(game: GamesTable, series: GamesTable[]) {
    // add the game to the series, skip if played/skipped but continue the chain
    if (game.tried === null) {
      series.push(game);
    }
    // if the game is a prequel
    if (sequelsMap.has(game.game_id)) {
      // go through its direct sequels (continues through a full sequel branch before returning to the other branch)
      for (const sequel of sequelsMap.get(game.game_id)!) {
        // and go to its sequel and continue the chain
        buildChain(sequel, series);
      }
    } // if not a prequel to anything, the chain stops
  }

  // Process each root game and construct full chains
  roots.forEach((root) => {
    const series: GamesTable[] = [];
    // start at the root of each series, and build the sequel chain
    buildChain(root, series);
    // store as a map of root game IDs referring to the array of the series
    seriesMap.set(root.game_id, series);
  });

  return seriesMap;
}
