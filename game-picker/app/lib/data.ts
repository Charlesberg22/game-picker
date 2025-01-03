
export type GamesTable = {
  platform_name: string;
  name: string;
  licence: string;
  play_method: string;
  retro: boolean;
  prequel_id: number;
  hltb_time: number;
  tried: boolean;
  finished: boolean;
  rating: string;
  when_played: string;
  img: string
};

export async function fetchAllGames(): Promise<GamesTable[]> {
  try {
    const response = await fetch('http://localhost:3000/api/games');
    if (!response.ok) throw new Error('Failed to fetch games');
    return await response.json();
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
}