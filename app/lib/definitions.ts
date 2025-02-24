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

export type State =
  | {
      errors?: {
        name?: string[];
        platform_id?: string[];
        licence?: string[];
        play_method?: string[];
        retro?: string[];
        handheld?: string[];
      };
      message?: string | null;
      formData?: {
        name?: string;
        platform_id?: string;
        licence?: string;
        play_method?: string;
        retro?: string;
        handheld?: string;
        prequel_id?: string;
      };
    }
  | undefined;

export const FETCHER = (url: string) => fetch(url).then((res) => res.json());

export const COLLATOR = new Intl.Collator("en", {
    numeric: true,
    sensitivity: "base",
  });

export const keywords = [
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