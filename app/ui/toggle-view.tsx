"use client";

import { EyeIcon } from "@heroicons/react/24/outline";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

const ToggleViewButton = () => {
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "table";
  const pathname = usePathname();
  const { replace } = useRouter();

  const toggleView = () => {
    const newView = currentView === "grid" ? "table" : "grid";

    const newParams = new URLSearchParams(searchParams);
    if (newView === "table") {
      newParams.delete("view"); // Remove ?view=grid
    } else {
      newParams.set("view", "grid");
    }
    replace(`${pathname}?${newParams.toString()}`);
  };

  return (
    <button
      onClick={toggleView}
      className="mr-2 px-4 py-2 rounded-lg bg-blue-600 text-md font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="md:block hidden">Change View</span>
      <span className="md:hidden block">
        <EyeIcon className="w-5" />
      </span>
    </button>
  );
};

export default ToggleViewButton;
