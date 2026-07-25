import { fetchAllGames, fetchGameById, fetchLicences, fetchPlatforms } from "@/app/lib/data";
import { Metadata } from "next";
import GameForm from "@/app/ui/game-form";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Edit Game",
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const [game, platforms, licences, allGames] = await Promise.all([
    props.params.then(({ id }) => fetchGameById(id)),
    fetchPlatforms(),
    fetchLicences(),
    fetchAllGames(),
  ]);

  const headersList = await headers();
  const referrer = headersList.get("referer") || "/";

  return (
    <main>
      <GameForm
        mode="edit"
        game={game}
        platforms={platforms}
        licences={licences}
        allGames={allGames}
        referrer={referrer}
      />
    </main>
  );
}
