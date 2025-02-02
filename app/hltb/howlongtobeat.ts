import levenshtein from 'fast-levenshtein';
import { HltbSearch } from './hltbsearch';

// Taken from https://github.com/ckatzorke/howlongtobeat/

export class HowLongToBeatService {
  private hltb: HltbSearch = new HltbSearch();

  constructor() { }

  /**
   * Get HowLongToBeatEntry from game id, by fetching the detail page like https://howlongtobeat.com/game.php?id=6974 and parsing it.
   * @param gameId the hltb internal gameid
   * @return Promise<HowLongToBeatEntry> the promise that, when fullfilled, returns the game
   */

  async getSearchKey() {
    return await this.hltb.getSearchKey();
  }

  async search(query: string, searchKey: string, signal?: AbortSignal): Promise<Array<HowLongToBeatEntry>> {
    const searchTerms = query.split(' ');
    const search = await this.hltb.search(
      searchTerms,
      searchKey,
      signal
    );
    // console.log(`Found ${search.count} results`);
    const hltbEntries = new Array<HowLongToBeatEntry>();
    for (const resultEntry of search.data) {
      hltbEntries.push(new HowLongToBeatEntry(
        '' + resultEntry.game_id, // game id is now a number, but I want to keep the model stable
        resultEntry.game_name,
        '', // no description
        resultEntry.profile_platform ? resultEntry.profile_platform.split(', ') : [],
        HltbSearch.IMAGE_URL + resultEntry.game_image,
        [["Main", "Main"] , ["Main + Extra", "Main + Extra"], ["Completionist", "Completionist"]],
        Math.round(resultEntry.comp_main / 3600),
        Math.round(resultEntry.comp_plus / 3600),
        Math.round(resultEntry.comp_100 / 3600),
        HowLongToBeatService.calcDistancePercentage(resultEntry.game_name, query),
        query
      ));
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
    let longer: string = text.toLowerCase().trim();
    let shorter: string = term.toLowerCase().trim();
    if (longer.length < shorter.length) {
      // longer should always have
      // greater length
      const temp: string = longer;
      longer = shorter;
      shorter = temp;
    }
    const longerLength: number = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }
    const distance = levenshtein.get(longer, shorter);
    return Math.round(((longerLength - distance) / longerLength) * 100) / 100;
  }
}

/**
 * Encapsulates a game detail
 */
export class HowLongToBeatEntry {
  /* deprecated, since it was also renamed on the website, and platforms is much more suitable */
  public readonly playableOn: string[];

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    /* replaces playableOn */
    public readonly platforms: string[],
    public readonly imageUrl: string,
    public readonly timeLabels: Array<string[]>,
    public readonly gameplayMain: number,
    public readonly gameplayMainExtra: number,
    public readonly gameplayCompletionist: number,
    public readonly similarity: number,
    public readonly searchTerm: string
  ) {
    this.playableOn = platforms;
  }
}
