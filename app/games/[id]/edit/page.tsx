import { fetchAllGames, fetchGameById, fetchPlatforms } from "@/app/lib/data";
import { Metadata } from "next";
import EditGameForm from "@/app/ui/edit-form";


export const metadata: Metadata = {
    title: 'Edit Game',
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params.id;
    const game = await fetchGameById(id);
    const platforms = await fetchPlatforms();
    const allGames = await fetchAllGames();


    return (
        <main>
            <EditGameForm game={game} platforms={platforms} allGames={allGames}/>
        </main>
    )
}