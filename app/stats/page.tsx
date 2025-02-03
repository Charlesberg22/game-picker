import { checkPlayedStats, checkUnplayedStats } from "@/app/lib/data";
import { Metadata } from "next";
import StatsTable from "../ui/stats-table";
import Link from "next/link";

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
        <StatsTable unplayedStats={unplayedStats} playedStats={playedStats} />
        <div className="my-2 mx-2 grid grid-cols-2 md:flex gap-4">
          <Link
            href="/download"
            className="flex h-10 items-center rounded-lg bg-green-600 px-4 text-sm font-medium text-white transition-colors hover:bg-green-800"
          >
            Download cover images
          </Link>
          <Link
            href="/update"
            className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-800"
          >
            Update all hltb times
          </Link>
        </div>
      </div>
    </main>
  );
}
