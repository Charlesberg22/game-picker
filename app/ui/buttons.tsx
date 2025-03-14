import { PencilIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export function AddGame() {
  return (
    <Link
      href="/games/add"
      className="flex mr-2 h-10 w-40 items-center justify-between rounded-lg bg-blue-600 px-4 text-md font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="block">Add Game</span> <PlusIcon className="h-5 pl-4" />
    </Link>
  );
}

export function UpdateGame({ id }: { id: string }) {
  return (
    <Link
      href={`/games/${id}/edit`}
      className="rounded-md border p-2 bg-black/50 hover:bg-blue-500"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}
