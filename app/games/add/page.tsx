import { fetchAllGames, fetchPlatforms } from "@/app/lib/data";
import { Metadata } from "next";
import GameForm from "@/app/ui/game-form";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Add Game",
};

export default async function Page() {
  const [platforms, allGames] = await Promise.all([
    fetchPlatforms(),
    fetchAllGames(),
  ]);

  const headersList = await headers();
  const referrer = headersList.get("referer") || "/";

  return (
    <main>
      <GameForm
        mode="add"
        platforms={platforms}
        allGames={allGames}
        referrer={referrer}
      />
    </main>
  );
}
