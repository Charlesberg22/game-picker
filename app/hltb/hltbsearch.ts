import axios from 'axios';
import UserAgent from 'user-agents';
import * as cheerio from 'cheerio';

// Taken from https://github.com/ckatzorke/howlongtobeat/
// API key parsing from https://github.com/ckatzorke/howlongtobeat/pull/64 and https://github.com/ScrappyCocco/HowLongToBeat-PythonAPI

/**
 * Takes care about the http connection and response handling
 */
export class HltbSearch {
  public static BASE_URL: string = 'https://howlongtobeat.com/';
  public static DETAIL_URL: string = `${HltbSearch.BASE_URL}game?id=`;
  public static SEARCH_URL: string = `${HltbSearch.BASE_URL}api/s/`;
  public static IMAGE_URL: string = `${HltbSearch.BASE_URL}games/`;

  private static readonly SEARCH_KEY_PATTERN =
  /"\/api\/(?:s|game|user)\/".concat\("([a-zA-Z0-9]+)"\).concat\("([a-zA-Z0-9]+)"\)/g;

  payload: any = {
    searchType: "games",
    searchTerms: [],
    searchPage: 1,
    size: 20,
    searchOptions: {
      games: {
        userId: 0,
        platform: "",
        sortCategory: "popular",
        rangeCategory: "main",
        rangeTime: {
          min: 0,
          max: 0
        },
        gameplay: {
          perspective: "",
          flow: "",
          genre: "",
          difficulty: ""
        },
        modifier: ""
      },
      users: {
        sortCategory: "postcount"
      },
      filter: "",
      sort: 0,
      randomizer: 0
    }
  }

  async search(query: Array<string>, searchKey: string, signal?: AbortSignal): Promise<any> {
    // Use built-in javascript URLSearchParams as a drop-in replacement to create axios.post required data param
    const search = { ...this.payload };
    search.searchTerms = query;
    try {
      const searchUrlWithKey = HltbSearch.SEARCH_URL + searchKey;

      const result =
        await axios.post(searchUrlWithKey, search, {
          headers: {
            'User-Agent': new UserAgent().toString(),
            'content-type': 'application/json',
            'origin': 'https://howlongtobeat.com/',
            'referer': 'https://howlongtobeat.com/'
          },
          timeout: 20000,
          signal,
        });
      // console.log('Result', JSON.stringify(result.data));
      return result.data;
    } catch (error) {
      if (error) {
        throw error;
      }
    }
  }

  async getSearchKey(
    checkAllScripts: boolean = false
  ): Promise<string> {
    const res = await axios.get(HltbSearch.BASE_URL, {
      headers: {
        "User-Agent": new UserAgent().toString(),
        origin: "https://howlongtobeat.com",
        referer: "https://howlongtobeat.com",
      },
    });

    const html = res.data;
    const $ = cheerio.load(html);

    const scripts = $("script[src]");

    for (const el of scripts) {
      const src = $(el).attr("src") as string;

      if (!checkAllScripts && !src.includes("_app-")) {
        continue;
      }

      const scriptUrl = HltbSearch.BASE_URL + src;

      try {
        const res = await axios.get(scriptUrl, {
          headers: {
            "User-Agent": new UserAgent().toString(),
            origin: "https://howlongtobeat.com",
            referer: "https://howlongtobeat.com",
          },
        });

        const scriptText = res.data;
        const matches = [...scriptText.matchAll(HltbSearch.SEARCH_KEY_PATTERN)];
        return matches[0][1] + matches[0][2];
      } catch (error) {
        console.log(error)
        continue;
      }
    }

    throw new Error("Could not find search key");
  }
}
