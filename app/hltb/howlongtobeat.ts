import levenshtein from "fast-levenshtein";
import { HltbSearch } from "./hltbsearch";

// Taken from https://github.com/ckatzorke/howlongtobeat/

export class HowLongToBeatService {
  private hltb: HltbSearch = new HltbSearch();

  constructor() {}

  /**
   * Get HowLongToBeatEntry from game id, by fetching the detail page like https://howlongtobeat.com/game.php?id=6974 and parsing it.
   * @param gameId the hltb internal gameid
   * @return Promise<HowLongToBeatEntry> the promise that, when fullfilled, returns the game
   */

  async getSearchKey() {
    return await this.hltb.getSearchKey();
  }

  async search(
    query: string,
    searchKey: string,
    signal?: AbortSignal,
  ): Promise<Array<HowLongToBeatEntry>> {
    const searchTerms = query.split(" ");
    const search = await this.hltb.search(searchTerms, searchKey, signal);
    // console.log(`Found ${search.count} results`);
    const hltbEntries = new Array<HowLongToBeatEntry>();
    for (const resultEntry of search.data) {
      hltbEntries.push({
        id: "" + resultEntry.game_id, // game id is now a number, but I want to keep the model stable
        name: resultEntry.game_name,
        description: "", // no description
        platforms: resultEntry.profile_platform
          ? resultEntry.profile_platform.split(", ")
          : [],
        imageUrl: HltbSearch.IMAGE_URL + resultEntry.game_image,
        timeLabels: [
          ["Main", "Main"],
          ["Main + Extra", "Main + Extra"],
          ["Completionist", "Completionist"],
        ],
        gameplayMain: Math.round(resultEntry.comp_main / 3600),
        gameplayMainExtra: Math.round(resultEntry.comp_plus / 3600),
        gameplayCompletionist: Math.round(resultEntry.comp_100 / 3600),
        similarity: HowLongToBeatService.calcDistancePercentage(
          resultEntry.game_name,
          query,
        ),
        searchTerm: query,
      });
    }
    return hltbEntries;
  }

  /**
   * Calculates the similarty of two strings based on the levenshtein distance in relation to the string lengths.
   * It is used to see how similar the search term is to the game name. This, of course has only relevance if the search term is really specific and matches the game name as good as possible.
   * When using a proper search index, this would be the ranking/rating and much more sophisticated than this helper.
   * @param text the text to compare to
   * @param term the string of which the similarity is wanted
   */
  static calcDistancePercentage(text: string, term: string): number {
    let longer = text.toLowerCase().trim();
    let shorter = term.toLowerCase().trim();
    if (longer.length < shorter.length) {
      // longer should always have
      // greater length
      const temp = longer;
      longer = shorter;
      shorter = temp;
    }
    if (longer.length == 0) {
      return 1.0;
    }
    const distance = levenshtein.get(longer, shorter);
    return Math.round(((longer.length - distance) / longer.length) * 100) / 100;
  }
}

/**
 * Encapsulates a game detail
 */
export type HowLongToBeatEntry = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly platforms: string[];
  readonly imageUrl: string;
  readonly timeLabels: Array<string[]>;
  readonly gameplayMain: number;
  readonly gameplayMainExtra: number;
  readonly gameplayCompletionist: number;
  readonly similarity: number;
  readonly searchTerm: string;
};
