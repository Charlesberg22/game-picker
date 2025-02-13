import { TrashIcon } from "@heroicons/react/24/outline";
import { deleteGame } from "../lib/actions";

export async function DeleteGame({ id }: { id: string }) {
    async function deleteGameWithId() {
      "use server";
      await deleteGame(id);
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