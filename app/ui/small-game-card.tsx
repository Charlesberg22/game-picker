import Link from "next/link";
import { GamesTable } from "../lib/data";
import Image from "next/image";

export default function SmallGameCard({ game }: { game: GamesTable }) {
  return (
    <div className="relative w-[100px] h-[150px] rounded-sm overflow-hidden ">
      <Link href={`/games/${game.game_id}/edit`}>
        <Image
            src={game.img}
            alt={game.name}
            width={100}
            height={150}
            className="object-cover"
        />
      </Link>
      <div className="absolute rounded-md top-0 right-0 p-1">
        <p className="text-lg text-center font-bold">
          {game.tried === null ? "" : "✅"}
        </p>
      </div>
    </div>
  );
}
