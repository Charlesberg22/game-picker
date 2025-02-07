import { CheckBadgeIcon as SolidCheckBadgeIcon} from "@heroicons/react/24/solid";
import { CheckBadgeIcon as OutlineCheckBadgeIcon} from "@heroicons/react/24/outline";
import Link from "next/link";
import { GamesTable } from "../lib/data";
import Image from "next/image";

export default function SmallGameCard({ game }: { game: GamesTable }) {
  return (
    <div className="relative aspect-[2/3] rounded-sm overflow-hidden ">
      <Link href={`/games/${game.game_id}/edit`}>
        <Image
          src={game.img}
          alt={game.name}
          width={200}
          height={300}
          className="object-cover"
        />
      </Link>
      <div className="absolute -top-5 right-7 p-2">
        <div className="">
          {game.tried === null ? (
            ""
          ) : (
            <div className="relative inline-block">
              <span className="sr-only">Completed</span>
              <SolidCheckBadgeIcon className="absolute w-8 m-0 fill-green-600" />
              <OutlineCheckBadgeIcon className="absolute w-8 m-0 stroke-black" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
