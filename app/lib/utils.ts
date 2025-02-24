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

export function buildSeriesMap(games: GamesTable[]): Map<number, GamesTable[]> {
  const gamesMap = new Map<number, GamesTable>();
  const prequelsMap = new Map<number, GamesTable[]>(); // game may have multiple sequels
  const seriesMap = new Map<number, GamesTable[]>(); // series will likely have multiple entries
  const assignedGames = new Set<number>(); // to keep track of roots that may show up in other series (does not need to be accessed with get, so is a set)

  // construct maps of games and prequels
  games.forEach((game) => {
    // construct game map for future lookups
    gamesMap.set(game.game_id, game);
    // construct prequel map if the game has a prequel, else it will likely be a root (but these are not the only roots)
    if (game.prequel_id) {
      if (!prequelsMap.has(game.prequel_id)) {
        prequelsMap.set(game.prequel_id, []); // if prequel not in prequelsMap, add a new entry with the prequel as the key
      }
      // in either case, add the sequel to the prequelsMap associated to the prequel key
      prequelsMap.get(game.prequel_id)!.push(game);
    }
  });

  // construct array of root games of series
  const roots = games.filter(
    (game) =>
      game.tried === null && // game must be unplayed to be a root, or it won't be shown
      // game must also either: not have a prequel, or have a prequel that does not exist in the list of games (i.e. was deleted), or have a prequel that was played (to be removed later if in middle of series)
      (!game.prequel_id ||
        !gamesMap.has(game.prequel_id) ||
        gamesMap.get(game.prequel_id)?.tried !== null),
  );

  // recursive function to build the series chain, called below in production of seriesMap
  function buildSeriesChain(game: GamesTable, series: GamesTable[]) {
    // add every game to the assigned games so it cannot show up as a root (in the future, past covered later)
    assignedGames.add(game.game_id);
    // add the game to the series chain only if unplayed (not relevant for root, but for the recursive cases)
    if (game.tried === null) {
      series.push(game);
    }
    // if the game is a prequel and is therefore in prequelsMap:
    if (prequelsMap.has(game.game_id)) {
      // go to the sequels and continue building the chain for each of them
      prequelsMap.get(game.game_id)!.forEach((sequel) => {
        // if the game is already in seriesMap as a root, then we need to delete that series
        if (seriesMap.has(game.game_id)) {
          seriesMap.delete(game.game_id);
        }
        // build the chain recursively
        buildSeriesChain(sequel, series);
      });
    } // if game is not a prequel, chain stops (but series may continue from other branch in prequelsMap)
  }

  // roots begin series, so go through them to construct series chains
  roots.forEach((root) => {
    // only proceed if game was not previously in a series (i.e. had a played prequel, but that game's prequel was unplayed)
    if (!assignedGames.has(root.game_id)) {
      // create an array for the series
      const series: GamesTable[] = [];
      // start at the root and build the series chain
      buildSeriesChain(root, series);
      // once the chain has been built, store the chain as a series in the seriesMap, with root as key
      seriesMap.set(root.game_id, series);
    }
  });

  // return the seriesMap as a map
  return seriesMap;
}
