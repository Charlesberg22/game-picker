import UserAgent from "user-agents";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";

// Taken from https://github.com/ckatzorke/howlongtobeat/
// API key parsing based on https://github.com/ckatzorke/howlongtobeat/pull/64 and https://github.com/ScrappyCocco/HowLongToBeat-PythonAPI

/**
 * Takes care about the http connection and response handling
 */
export class HltbSearch {
  public static BASE_URL = "https://howlongtobeat.com/";
  public static DETAIL_URL = `${HltbSearch.BASE_URL}game?id=`;
  public static SEARCH_URL = "";
  public static IMAGE_URL = `${HltbSearch.BASE_URL}games/`;

  private static readonly SEARCH_KEY_PATTERN =
    /"\/api\/([a-z]+)\/".concat\("([a-zA-Z0-9]+)"\).concat\("([a-zA-Z0-9]+)"\)/g;

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
          max: 0,
        },
        gameplay: {
          perspective: "",
          flow: "",
          genre: "",
          difficulty: "",
        },
        modifier: "",
      },
      users: {
        sortCategory: "postcount",
      },
      filter: "",
      sort: 0,
      randomizer: 0,
    },
  };

    async search(
    query: Array<string>,
    searchKey: string,
    signal?: AbortSignal
  ): Promise<any> {
    const search = { ...this.payload };
    search.searchTerms = query;

    if (!signal) {
      const controller = new AbortController();
      signal = controller.signal;
      setTimeout(() => controller.abort(), 20_000);
    }

    try {
      const response = await fetch('https://howlongtobeat.com/api/search', {
        method: "POST",
        body: JSON.stringify(search),
        headers: {
          "User-Agent": new UserAgent().toString(),
          "content-type": "application/json",
          'x-auth-token': searchKey,
          origin: "https://howlongtobeat.com/",
          referer: "https://howlongtobeat.com/",
        },
        signal,
      });

      const responseText = await response.text();
      return JSON.parse(responseText);
    } catch (error) {
      console.error("HLTB search error:", error);
      throw error;
    }
  }

  async getSearchKey(): Promise<string | null> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

      // Add a user agent so the site behaves normally
    await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    );

    const url = 'https://howlongtobeat.com/api/search/init' + Date.now();
    console.log("url:", url);
    await page.goto(url, { waitUntil: 'networkidle2' });

    const html = await page.content();
    console.log("html:", html);

    const token = await page.evaluate(() => {
      // HLTB stores it in some JS variable, often window.__INITIAL_STATE__ or similar
      return (window as any).__INITIAL_STATE__?.search?.token || null;
    });

    await browser.close();
    return token;
  }
}