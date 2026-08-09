import { Stats } from "@/app/lib/definitions";

export default async function StatsTable({
  toPlayStats,
  playedStats,
  baselineStats,
}: {
  toPlayStats: Stats;
  playedStats: Stats;
  baselineStats: Stats;
}) {
  const overall_ratio_modern_retro =
    Math.round(
      ((toPlayStats.number_of_modern + playedStats.number_of_modern) /
        (toPlayStats.number_of_retro + playedStats.number_of_retro)) *
        10,
    ) / 10;
  const overall_ratio_desktop_handheld =
    Math.round(
      ((toPlayStats.number_of_desktop + playedStats.number_of_desktop) /
        (toPlayStats.number_of_handheld + playedStats.number_of_handheld)) *
        10,
    ) / 10;

  return (
    <div className="flow-root bg-neutral-950">
      <div className="inline-block align-left">
        <div className="rounded-lg bg-indigo-950 px-2 pb-2 mx-2 pt-0">
          <table className="text-gray-80 table">
            <thead className="rounded-lg bg-indigo-950 text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-3 py-5 font-medium min-w-[300px]">
                  Description
                </th>
                <th
                  scope="col"
                  className="px-3 py-5 font-medium w-[108px] text-end"
                >
                  Stat
                </th>
              </tr>
            </thead>
            <tbody className="bg-black">
              <tr className="w-full border-b py-3 text-sm">
                <td className="whitespace-nowrap py-3 px-3">
                  Total Number of Games in Database
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-end">
                  {baselineStats.number_of_games}
                </td>
              </tr>
              <tr className="w-full border-b py-3 text-sm">
                <td className="whitespace-nowrap py-3 px-3">
                  Number of Games To Play
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-end">
                  {toPlayStats.number_of_games}
                </td>
              </tr>
              <tr className="w-full border-b py-3 text-sm">
                <td className="whitespace-nowrap py-3 px-3">
                  Total To Play Runtime
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-end">
                  {toPlayStats.total_length} h
                </td>
              </tr>
              <tr className="w-full border-b py-3 text-sm">
                <td className="whitespace-nowrap py-3 px-3">
                  Average To Play Runtime
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-end">
                  {toPlayStats.average_length} h
                </td>
              </tr>
              <tr className="w-full border-b py-3 text-sm">
                <td className="py-3 px-3">
                  Number of Retro/Modern Games Remaining
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-end">
                  {toPlayStats.number_of_retro} /{" "}
                  {toPlayStats.number_of_modern}
                </td>
              </tr>
              <tr className="w-full py-3 border-b text-sm">
                <td className="py-3 px-3">
                  Number of Handheld/Desktop Games Remaining
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-end">
                  {toPlayStats.number_of_handheld} /{" "}
                  {toPlayStats.number_of_desktop}
                </td>
              </tr>
              <tr className="w-full py-3 border-b text-sm">
                <td className="py-3 px-3">
                  Ratio of Modern to Retro Games Overall
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-end">
                  {overall_ratio_modern_retro}
                </td>
              </tr>
              <tr className="w-full py-3 border-b text-sm">
                <td className="py-3 px-3">
                  Ratio of Modern to Retro Games Played
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-end">
                  {Math.round(playedStats.ratio_modern_retro * 10) / 10}
                </td>
              </tr>
              <tr className="w-full py-3 border-b text-sm">
                <td className="py-3 px-3">
                  Ratio of Desktop to Handheld Games Overall
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-end">
                  {overall_ratio_desktop_handheld}
                </td>
              </tr>
              <tr className="w-full py-3 text-sm">
                <td className="py-3 px-3">
                  Ratio of Desktop to Handheld Games Played
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-end">
                  {Math.round(playedStats.ratio_desktop_handheld * 10) / 10}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
