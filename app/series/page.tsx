import { Metadata } from "next";
import { SeriesView } from "../ui/series-view";

export const metadata: Metadata = {
    title: "Series",
  };

export default async function Page() {

  return (
    <div className="w-full">
      <SeriesView />
    </div>
  );
}