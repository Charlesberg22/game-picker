import { CheckBadgeIcon as SolidCheckBadgeIcon } from "@heroicons/react/24/solid";
import { CheckBadgeIcon as OutlineCheckBadgeIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon as SolidCheckCircleIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon as OutlineCheckCircleIcon } from "@heroicons/react/24/outline";
import { XCircleIcon as SolidXCircleIcon } from "@heroicons/react/24/solid";
import { XCircleIcon as OutlineXCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { GamesTable } from "../lib/definitions";
import Image from "next/image";

export default function SmallGameCard({ game }: { game: GamesTable }) {
  return (
    <div className="relative aspect-[2/3] rounded-sm overflow-hidden ">
      <Link href={`/games/${game.game_id}/edit`}>
        <Image
          src={`/api${game.img}`}
          alt={game.name}
          width={200}
          height={300}
          className="object-cover"
        />
      </Link>
      <div className="absolute -top-5 right-7 p-2">
        <div className="">
          {game.finished == true ? (
            <div className="relative inline-block">
              <span className="sr-only">Completed</span>
              <SolidCheckCircleIcon className="absolute w-8 m-0 fill-green-600" />
              <OutlineCheckCircleIcon className="absolute w-8 m-0 stroke-black" />
            </div>
          ) : game.latest_played != null ? (
            <div className="relative inline-block">
              <span className="sr-only">Played</span>
              <SolidCheckCircleIcon className="absolute w-8 m-0 fill-teal-600" />
              <OutlineCheckCircleIcon className="absolute w-8 m-0 stroke-black" />
            </div>
          ) : game.to_play != true ? (
            <div className="relative inline-block">
              <span className="sr-only">Played</span>
              <SolidXCircleIcon className="absolute w-8 m-0 fill-gray-500" />
              <OutlineXCircleIcon className="absolute w-8 m-0 stroke-black" />
            </div>
          ) : ""}
        </div>
      </div>
    </div>
  );
}
