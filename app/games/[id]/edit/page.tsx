import { fetchAllGames, fetchGameById, fetchPlatforms } from "@/app/lib/data";
import { Metadata } from "next";
import EditGameForm from "@/app/ui/edit-form";
import { HowLongToBeatService } from "@/app/hltb/howlongtobeat"; // Taken from https://github.com/ckatzorke/howlongtobeat/


export const metadata: Metadata = {
    title: 'Edit Game',
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const [game, platforms, allGames] = await Promise.all([
        props.params.then(({ id }) => fetchGameById(id)), 
        fetchPlatforms(), 
        fetchAllGames()
    ]);

    const hltbService = new HowLongToBeatService;
    hltbService.search(game.name).then(result => console.log(result[0]))

    return (
        <main>
            <EditGameForm game={game} platforms={platforms} allGames={allGames}/>
        </main>
    )
}