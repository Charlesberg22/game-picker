import { ClockIcon } from "@heroicons/react/24/outline";
import { GamesTable } from "../lib/data";
import Image from 'next/image';

export default function GameCard({game}: {game: GamesTable}) {
  return (
    <div className="relative w-[300px] h-[450px] rounded-lg overflow-hidden ">
      <Image 
        src={game.img} 
        alt={game.name} 
        width={300} 
        height={450} 
        className="object-cover" 
      />

      <div className="absolute rounded-md bottom-0 w-full bg-black/60 text-white p-2">
        <div className="flex justify-between text-sm font-semibold">
          <span>{game.platform_name}</span>
          <span>{game.play_method}</span>
        </div>
        <p className="text-lg text-center font-bold">{game.name}</p>
        <div className="flex justify-between text-md">
          <span>{game.hltb_time} h</span>
          <span>{game.retro ? '📼' : '💿'} {game.handheld ? '📱' : '📺'}</span>
        </div>
      </div>

      <div className="absolute rounded-md top-0 right-0 p-2">
        <p className="text-2xl text-center font-bold">{game.tried === null ? '' : '✅'}</p>
      </div>
    </div>
  );
  }