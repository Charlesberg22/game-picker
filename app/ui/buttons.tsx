import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { deleteGame } from '../lib/actions';

export function AddGame() {
  return (
    <Link
      href="/games/add"
      className="flex mr-2 h-10 w-40 items-center justify-between rounded-lg bg-blue-600 px-4 text-md font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Add Game</span>{' '}
      <PlusIcon className="h-5 md:pl-4" />
    </Link>
  );
}

export function UpdateGame({ id }: { id: string }) {
  return (
    <Link
      href={`/games/${id}/edit`}
      className="rounded-md border p-2 hover:bg-blue-500"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteGame({ id }: { id: string }) {
  const deleteGameWithId = deleteGame.bind(null, id);
  return (
    <form action={deleteGameWithId}>
      <button className="rounded-md border p-2 hover:bg-red-600">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </form>
  );
}
