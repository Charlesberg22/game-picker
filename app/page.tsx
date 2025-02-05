import { AddGame } from "./ui/buttons";
import Search from "./ui/search";
import AllGamesTable from "./ui/all-table";
import ToggleViewButton from "./ui/toggle-view";

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    view?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const view = searchParams?.view === "grid";

  return (
    <div className="w-full">
      <div className="sticky top-[60px] pt-2 pb-4 pl-2 flex z-10 bg-neutral-950">
        <AddGame /> <Search placeholder="Filter games..." />{" "}
        <ToggleViewButton />
      </div>
      <AllGamesTable query={query} view={view} />
    </div>
  );
}
