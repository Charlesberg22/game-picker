import { checkPlayedStats, checkUnplayedStats  } from "@/app/lib/data";
import { Metadata } from "next";
import StatsTable from "../ui/stats-table";


export const metadata: Metadata = {
    title: 'Stats',
};

export default async function Page() {
    const unplayedStats = await checkUnplayedStats();
    const playedStats = await checkPlayedStats();

    return (
        <main>
        <StatsTable unplayedStats={unplayedStats} playedStats={playedStats}/>
        </main>
    )
}