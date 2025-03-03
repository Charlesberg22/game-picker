import { checkPlayedStats, checkUnplayedStats } from "@/app/lib/data";
import { Metadata } from "next";
import StatsTable from "../ui/stats-table";
import { DownloadImagesButton, UpdateHltbButton } from "../ui/update-buttons";

export const metadata: Metadata = {
  title: "Stats",
};

export default async function Page() {
  const [unplayedStats, playedStats] = await Promise.all([
    checkUnplayedStats(),
    checkPlayedStats(),
  ]);

  return (
    <main>
      <div className="md:flex">
        <StatsTable unplayedStats={unplayedStats} playedStats={playedStats}/>
        <div className="my-2 mx-2 grid grid-cols-2 md:flex gap-4">
          <DownloadImagesButton />
          <UpdateHltbButton />
        </div>
      </div>
    </main>
  );
}
