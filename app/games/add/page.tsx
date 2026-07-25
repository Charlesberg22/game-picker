import { fetchAllGames, fetchLicences, fetchPlatforms } from "@/app/lib/data";
import { Metadata } from "next";
import GameForm from "@/app/ui/game-form";
import { headers } from "next/headers";
import { licences } from "@/app/lib/licences";

export const metadata: Metadata = {
  title: "Add Game",
};

export default async function Page() {
  const [platforms, licences, allGames] = await Promise.all([
    fetchPlatforms(),
    fetchLicences(),
    fetchAllGames(),
  ]);

  const headersList = await headers();
  const referrer = headersList.get("referer") || "/";

  return (
    <main>
      <GameForm
        mode="add"
        platforms={platforms}
        licences={licences}
        allGames={allGames}
        referrer={referrer}
      />
    </main>
  );
}
