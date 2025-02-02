import { checkPlayedStats, checkUnplayedStats } from "@/app/lib/data";
import { Metadata } from "next";
import StatsTable from "../ui/stats-table";

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
      <StatsTable unplayedStats={unplayedStats} playedStats={playedStats} />
    </main>
  );
}
