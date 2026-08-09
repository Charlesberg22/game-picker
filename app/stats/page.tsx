import { checkBaselineStats, checkPlayedStats, checkToPlayStats } from "@/app/lib/data";
import { Metadata } from "next";
import StatsTable from "../ui/stats-table";
import { DownloadImagesButton, UpdateHltbButton } from "../ui/update-buttons";

export const metadata: Metadata = {
  title: "Stats",
};

export default async function Page() {
  const [toPlayStats, playedStats, baselineStats] = await Promise.all([
    checkToPlayStats(),
    checkPlayedStats(),
    checkBaselineStats(),
  ]);

  return (
    <main>
      <div className="md:flex">
        <StatsTable toPlayStats={toPlayStats} playedStats={playedStats} baselineStats={baselineStats}/>
        <div className="my-2 mx-2 grid grid-cols-2 md:flex gap-4">
          <DownloadImagesButton />
          <UpdateHltbButton />
        </div>
      </div>
    </main>
  );
}
