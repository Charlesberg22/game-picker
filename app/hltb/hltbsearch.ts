import UserAgent from "user-agents";
import { HltbSearchInfo } from "../lib/definitions";
import * as cheerio from "cheerio";

// Taken from https://github.com/ckatzorke/howlongtobeat/
// API key parsing based on https://github.com/ckatzorke/howlongtobeat/pull/64 and https://github.com/ScrappyCocco/HowLongToBeat-PythonAPI

/**
 * Handles the http connection and response handling
 */
export class HltbSearch {
  public static BASE_URL = "https://howlongtobeat.com/";
  public static DETAIL_URL = `${HltbSearch.BASE_URL}game?id=`;
  public static SEARCH_URL = "";
  public static IMAGE_URL = `${HltbSearch.BASE_URL}games/`;

  private static readonly SEARCH_KEY_PATTERN =
    /fetch\s*\(\s*["']\/api\/([a-zA-Z0-9_/]+)[^"']*["']\s*,\s*{[^}]*method:\s*["']POST["'][^}]*}/gis;

  private ua = new UserAgent().toString();

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
    searchInfo: HltbSearchInfo,
    signal?: AbortSignal
  ): Promise<any> {
    
    const search = { ...this.payload };
    search.searchTerms = query;
      
    if (searchInfo.authKey && searchInfo.authValue) {
      search[searchInfo.authKey] = searchInfo.authValue;
    }

    if (!signal) {
      const controller = new AbortController();
      signal = controller.signal;
      setTimeout(() => controller.abort(), 20_000);
    }

      console.log("searchInfo:", searchInfo);
    try {
      const response = await fetch(`${HltbSearch.BASE_URL}${HltbSearch.SEARCH_URL}`, {
        method: "POST",
        body: JSON.stringify(search),
        headers: {
          "User-Agent": this.ua,
          "content-type": "application/json",
          "x-auth-token": searchInfo.searchKey,
          "x-hp-key": searchInfo.authKey,
          "x-hp-val": searchInfo.authValue,
          origin: "https://howlongtobeat.com/",
          referer: "https://howlongtobeat.com/",
        },
        signal,
      });

      const responseText = await response.text();

      console.log("Search status:", response.status);
      console.log("Search URL:", `${HltbSearch.BASE_URL}${HltbSearch.SEARCH_URL}`);
      console.log("Search response:", responseText);

      return JSON.parse(responseText);
    } catch (error) {
      console.error("HLTB search error:", error);
      throw error;
    }
  }

/**
 * Get the Search Key from the search init page. Now also gets auth key and auth value.
 * @returns searchKey as Promise<string>
 */ 
  async getSearchInfo(checkAllScripts = true): Promise<HltbSearchInfo> {
    const searchInfo: HltbSearchInfo = {
      searchKey: "",
      authKey: "",
      authValue: "",
    };

    const html = await fetch(HltbSearch.BASE_URL, {
      next: { revalidate: 300 },
      headers: {
        "User-Agent": this.ua,
        origin: "https://howlongtobeat.com",
        referer: "https://howlongtobeat.com",
      },
    }).then((res) => res.text());
    const $ = cheerio.load(html);

    const scripts = $("script[src]");

    for (const el of scripts) {
      const src = $(el).attr("src") as string;

      if (!checkAllScripts && !src.includes("_app-")) {
        continue;
      }

      const scriptUrl = HltbSearch.BASE_URL + src;

      try {
        const scriptText = await fetch(scriptUrl, {
          next: { revalidate: 300 },
          headers: {
            "User-Agent": this.ua,
            origin: "https://howlongtobeat.com",
            referer: "https://howlongtobeat.com",
          },
        }).then((res) => res.text());

        const matches = [...scriptText.matchAll(HltbSearch.SEARCH_KEY_PATTERN)];
        if (matches.length === 0 || matches[0][1].includes("error")) {
          continue;
        }
        HltbSearch.SEARCH_URL = `api/${matches[0][1]}`
        break;
      } catch (error) {
        console.log(error);
        continue;
      }
    }

    const url = `${HltbSearch.BASE_URL}${HltbSearch.SEARCH_URL}/init?t=${Date.now()}`;
    const headers = {
      "User-Agent": this.ua,
      referer: "https://howlongtobeat.com/",
    };
        
    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`Failed to get HLTB search info: ${res.status}`);
    }

    const data = await res.json();
    searchInfo.searchKey = data.token || "";

    for (const [fieldName, fieldValue] of Object.entries(data)) {
      const lower = fieldName.toLowerCase();

      if (/key/.test(lower)) {
        searchInfo.authKey = String(fieldValue);
      } else if (/val/.test(lower)) {
        searchInfo.authValue = String(fieldValue);
      }
}
    return searchInfo;
  }
}