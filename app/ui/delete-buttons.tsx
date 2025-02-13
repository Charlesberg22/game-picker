"use client"

import { TrashIcon } from "@heroicons/react/24/outline";
import { deleteGame } from "../lib/actions";

export function DeleteGame({ id }: { id: string }) {  
  async function deleteGameWithId() {
    await deleteGame(id);
    try {
      await fetch("/api/series-map?refresh=true", { method: "GET" });
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <form action={deleteGameWithId}>
      <button className="rounded-md border p-2 bg-black/50 hover:bg-red-600">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </form>
  );
}