import { CheckBadgeIcon as SolidCheckBadgeIcon } from "@heroicons/react/24/solid";
import { CheckBadgeIcon as OutlineCheckBadgeIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon as SolidCheckCircleIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon as OutlineCheckCircleIcon } from "@heroicons/react/24/outline";
import { XCircleIcon as SolidXCircleIcon } from "@heroicons/react/24/solid";
import { XCircleIcon as OutlineXCircleIcon } from "@heroicons/react/24/outline";
import { GamesTable } from "../lib/definitions";
import Image from "next/image";

export default function GameCard({ game }: { game: GamesTable }) {
  return (
    <div className="relative aspect-[2/3] min-w-[270px] rounded-lg overflow-hidden ">
      <Image
        src={`/api${game.img}`}
        alt={game.name}
        width={300}
        height={450}
        className="object-cover"
      />

      <div className="absolute rounded-md bottom-0 w-full bg-black/60 text-white p-2">
        <div className="flex justify-between text-sm font-semibold">
          <span>{game.platform_name}</span>
          <span>{game.play_platform_name}</span>
        </div>
        <p className="text-lg truncate text-center font-bold">{game.name}</p>
        <div className="flex justify-between text-md">
          <span>{game.hltb_time} h</span>
          <span>
            {game.retro ? "📼" : "💿"} {game.handheld ? "📱" : "📺"}
          </span>
        </div>
      </div>

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
