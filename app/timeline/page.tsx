import AllGamesTable from "../ui/all-table";

export default async function Page() {

  return (
    <div className="w-full">
      <AllGamesTable query={""} view={true} timeline={true} />
    </div>
  );
}