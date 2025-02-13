import { Metadata } from "next";
import Search from "../ui/search";
import { DependencyView } from "../ui/dependency-view";

export const metadata: Metadata = {
    title: "Dependency",
  };

export default async function Page() {

  return (
    <div className="w-full">
      <DependencyView />
    </div>
  );
}