import { checkBaselineStats, checkPlayedStats, checkToPlayStats } from "@/app/lib/data";
import { Metadata } from "next";
import StatsTable from "../ui/stats-table";
import { DownloadImagesButton, UpdateHltbButton } from "../ui/update-buttons";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function Page() {

  return (
    <main>
      <div className="md:flex">
        hello world
      </div>
    </main>
  );
}
