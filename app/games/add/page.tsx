import { fetchAllGames, fetchPlatforms } from "@/app/lib/data";
import { Metadata } from "next";
import AddGameForm from "@/app/ui/add-form";


export const metadata: Metadata = {
    title: 'Add Game',
};

export default async function Page() {
    const [platforms, allGames] = await Promise.all([
         fetchPlatforms(),
         fetchAllGames()
    ]);    

    return (
        <main>
            <AddGameForm platforms={platforms} allGames={allGames}/>
        </main>
    )
}