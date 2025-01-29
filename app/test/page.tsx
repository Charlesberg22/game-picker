import { Metadata } from "next";
import { fetchAllGames } from "../lib/data";
import GameCard from "../ui/game-card";


export const metadata: Metadata = {
    title: 'Game Card Test',
};

export default async function Page() {
    const games = await fetchAllGames();

    return (
        <main>
            <GameCard game={games[1]}/>
        </main>
    )
}