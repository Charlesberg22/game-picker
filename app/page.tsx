import { AddGame } from "./ui/buttons";
import Search from "./ui/search";
import AllGamesTable from "./ui/all-table";

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";

  return (
    <div className="w-full">
      <div className="sticky top-[60px] pt-2 pb-4 pl-2 flex bg-neutral-950">
        <AddGame /> <Search placeholder="Filter games..." />
      </div>
      <AllGamesTable query={query} />
    </div>
  );
}
