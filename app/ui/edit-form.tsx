"use client";

import { COLLATOR, GamesTable, Platform, State } from "../lib/definitions";
import { replaceImage, updateGame } from "../lib/actions";
import {
  BackwardIcon,
  BookOpenIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  ComputerDesktopIcon,
  CpuChipIcon,
  DevicePhoneMobileIcon,
  DocumentTextIcon,
  FolderIcon,
  NoSymbolIcon,
  TvIcon,
} from "@heroicons/react/24/outline";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditGameForm({
  game,
  platforms,
  allGames,
  referrer,
}: {
  game: GamesTable;
  platforms: Platform[];
  allGames: GamesTable[];
  referrer: string;
}) {
  const router = useRouter();

  const [hltbTime, setHltbTime] = useState<number | string>(
    game.hltb_time || "",
  );

  function updateHltb(game: GamesTable) {
    fetch(`/api/hltb?name=${encodeURIComponent(game.name)}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch HLTB data");
        }
        return response.json();
      })
      .then((hltbData) => {
        const newTime = hltbData.gameplayMainExtra;
        setHltbTime(newTime);
        alert("Updated hltb time.");
      })
      .catch((error) => {
        console.error("Error fetching from API:", error);
        alert("Failed to update hltb time.");
      });
  }

  async function updateGameWithId(state: State, formData: FormData) {
    const result = await updateGame(String(game.game_id), state, formData);

    if (result == undefined || !result.errors) {
      try {
        await fetch("/api/series-map?refresh=true", { method: "GET" });
      } catch (error) {
        console.error(error);
      }
      router.back();
    }

    return result;
  }

  const [state, action] = useActionState(updateGameWithId, undefined);

  return (
    <div>
      <div className="rounded-md bg-green-900 p-4 md:p-6">
        <form action={action} key={game.game_id}>
          <input type="hidden" name="previousPage" value={referrer} />
          <div className="">
            {/* Platform Name */}
            <div className="mb-4">
              <label
                htmlFor="platform"
                className="mb-2 block text-sm font-medium"
              >
                Platform
              </label>
              <div className="relative">
                <select
                  id="platform"
                  name="platform_id"
                  className="peer block w-full cursor-pointer rounded-md bg-green-50 text-black border border-gray-800 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  defaultValue={game.platform_id}
                >
                  <option value="" disabled>
                    Select the platform
                  </option>
                  {platforms.map((platform) => (
                    <option
                      key={platform.platform_id}
                      value={platform.platform_id}
                    >
                      {platform.platform_name}
                    </option>
                  ))}
                </select>
                <CpuChipIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
              </div>
              {state?.errors?.platform_id && (
                <span className="text-sm px-2 py-1 rounded-lg bg-blue-300 text-black">
                  {state.errors.platform_id}
                </span>
              )}
            </div>

            {/* Game Name */}
            <div className="mb-4">
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Game name
              </label>
              <div className="relative mt-2 rounded-md">
                <div className="relative">
                  <input
                    id="name"
                    name="name"
                    type="string"
                    defaultValue={game.name}
                    placeholder="Enter name"
                    className="peer block w-full rounded-md bg-green-50 text-black border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  />
                  <DocumentTextIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                </div>
              </div>
              {state?.errors?.name && (
                <span className="text-sm px-2 py-1 rounded-lg bg-blue-300 text-black">
                  {state.errors.name}
                </span>
              )}
            </div>

            {/* Licence */}
            <div className="mb-4">
              <label
                htmlFor="licence"
                className="mb-2 block text-sm font-medium"
              >
                Game licence (how do you own it or otherwise)
              </label>
              <div className="relative mt-2 rounded-md">
                <div className="relative">
                  <input
                    id="licence"
                    name="licence"
                    type="string"
                    defaultValue={game.licence}
                    placeholder="Enter licensing details"
                    className="peer block w-full rounded-md bg-green-50 text-black border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  />
                  <BookOpenIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                </div>
              </div>
              {state?.errors?.licence && (
                <span className="text-sm px-2 py-1 rounded-lg bg-blue-300 text-black">
                  {state.errors.licence}
                </span>
              )}
            </div>

            {/* Play method */}
            <div className="mb-4">
              <label
                htmlFor="play_method"
                className="mb-2 block text-sm font-medium"
              >
                Play method (what platform will you actually play it on)
              </label>
              <div className="relative mt-2 rounded-md">
                <div className="relative">
                  <input
                    id="play_method"
                    name="play_method"
                    type="string"
                    defaultValue={game.play_method}
                    placeholder="Enter play method"
                    className="peer block w-full rounded-md bg-green-50 text-black border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  />
                  <ComputerDesktopIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                </div>
              </div>
              {state?.errors?.play_method && (
                <span className="text-sm px-2 py-1 rounded-lg bg-blue-300 text-black">
                  {state.errors.play_method}
                </span>
              )}
            </div>

            {/* Retro or Modern */}
            <fieldset className="mb-4">
              <legend className="mb-2 block text-sm font-medium">
                Is it retro or modern?
              </legend>
              <div className="rounded-md border border-gray-200 bg-green-50 px-[14px] py-3">
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      id="retro"
                      name="retro"
                      type="radio"
                      value="true"
                      defaultChecked={game.retro}
                      className="h-4 w-4 cursor-pointer border-green-300 bg-gray-100 text-gray-600 focus:ring-2"
                    />
                    <label
                      htmlFor="retro"
                      className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-purple-500 px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Retro <ClockIcon className="h-4 w-4" />
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="modern"
                      name="retro"
                      type="radio"
                      value=""
                      defaultChecked={!game.retro}
                      className="h-4 w-4 cursor-pointer border-green-300 bg-gray-100 text-gray-600 focus:ring-2"
                    />
                    <label
                      htmlFor="modern"
                      className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Modern <ComputerDesktopIcon className="h-4 w-4" />
                    </label>
                  </div>
                </div>
              </div>
              {state?.errors?.retro && (
                <span className="text-sm px-2 py-1 rounded-lg bg-blue-300 text-black">
                  {state.errors.retro}
                </span>
              )}
            </fieldset>

            {/* Handheld or Desktop */}
            <fieldset className="mb-4">
              <legend className="mb-2 block text-sm font-medium">
                Is it handheld or tv-based?
              </legend>
              <div className="rounded-md border border-gray-200 bg-green-50 px-[14px] py-3">
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      id="handheld"
                      name="handheld"
                      type="radio"
                      value="true"
                      defaultChecked={game.handheld}
                      className="h-4 w-4 cursor-pointer border-green-300 bg-gray-100 text-gray-600 focus:ring-2"
                    />
                    <label
                      htmlFor="handheld"
                      className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-purple-500 px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Handheld <DevicePhoneMobileIcon className="h-4 w-4" />
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="desktop"
                      name="handheld"
                      type="radio"
                      value=""
                      defaultChecked={!game.handheld}
                      className="h-4 w-4 cursor-pointer border-green-300 bg-gray-100 text-gray-600 focus:ring-2"
                    />
                    <label
                      htmlFor="desktop"
                      className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Television <TvIcon className="h-4 w-4" />
                    </label>
                  </div>
                </div>
              </div>
              {state?.errors?.retro && (
                <span className="text-sm px-2 py-1 rounded-lg bg-blue-300 text-black">
                  {state.errors.retro}
                </span>
              )}
            </fieldset>

            {/* Prequel */}
            <div className="mb-4">
              <label
                htmlFor="prequel"
                className="mb-2 block text-sm font-medium"
              >
                Does it have a prequel to play first?
              </label>
              <div className="relative">
                <select
                  id="prequel"
                  name="prequel_id"
                  className="peer block w-full cursor-pointer rounded-md bg-green-50 text-black border border-gray-800 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  defaultValue={game.prequel_id ?? ""}
                >
                  <option value="">None</option>
                  {allGames
                    .sort((a, b) => COLLATOR.compare(a.name, b.name))
                    .map((game) => (
                      <option key={game.game_id} value={game.game_id}>
                        {game.name}
                      </option>
                    ))}
                </select>
                <BackwardIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            {/* HLTB */}
            <div className="mb-4">
              <label
                htmlFor="hltb_time"
                className="mb-2 block text-sm font-medium"
              >
                <span>How long to beat (in hours)? </span>
                <button
                  className="underline"
                  onClick={(e) => {
                    e.preventDefault();
                    updateHltb(game);
                  }}
                >
                  Update from hltb.com
                </button>
              </label>
              <div className="relative mt-2 rounded-md">
                <div className="relative">
                  <input
                    id="hltb_time"
                    name="hltb_time"
                    type="number"
                    value={hltbTime}
                    onChange={(e) => setHltbTime(e.target.value)}
                    placeholder="Enter time"
                    className="peer block w-full rounded-md bg-green-50 text-black border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  />
                  <ClockIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                </div>
              </div>
            </div>

            {/* Tried? */}
            <fieldset>
              <legend className="mb-2 block text-sm font-medium">
                Have or will you try it?
              </legend>
              <div className="rounded-md mb-4 border border-gray-200 bg-green-50 px-[14px] py-3">
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      id="tried"
                      name="tried"
                      type="radio"
                      value="true"
                      defaultChecked={game.tried}
                      className="h-4 w-4 cursor-pointer border-green-300 bg-gray-100 text-gray-600 focus:ring-2"
                    />
                    <label
                      htmlFor="tried"
                      className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-purple-500 px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Tried <CheckIcon className="h-4 w-4" />
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="untried"
                      name="tried"
                      type="radio"
                      value=""
                      defaultChecked={game.tried === false}
                      className="h-4 w-4 cursor-pointer border-green-300 bg-gray-100 text-gray-600 focus:ring-2"
                    />
                    <label
                      htmlFor="untried"
                      className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Will not try <NoSymbolIcon className="h-4 w-4" />
                    </label>
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Finished? */}
            <fieldset>
              <legend className="mb-2 block text-sm font-medium">
                When you played it, did you finish it?
              </legend>
              <div className="rounded-md mb-4 border border-gray-200 bg-green-50 px-[14px] py-3">
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      id="finished"
                      name="finished"
                      type="radio"
                      value="true"
                      defaultChecked={game.finished}
                      className="h-4 w-4 cursor-pointer border-green-300 bg-gray-100 text-gray-600 focus:ring-2"
                    />
                    <label
                      htmlFor="finished"
                      className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-purple-500 px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Finished <CheckIcon className="h-4 w-4" />
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="unfinished"
                      name="finished"
                      type="radio"
                      value=""
                      defaultChecked={game.finished == false}
                      className="h-4 w-4 cursor-pointer border-green-300 bg-gray-100 text-gray-600 focus:ring-2"
                    />
                    <label
                      htmlFor="unfinished"
                      className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Not finished <NoSymbolIcon className="h-4 w-4" />
                    </label>
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Rating */}
            <div className="mb-4">
              <label
                htmlFor="rating"
                className="mb-2 block text-sm font-medium"
              >
                What would you rate it out of 10?
              </label>
              <div className="relative mt-2 rounded-md">
                <div className="relative">
                  <input
                    id="rating"
                    name="rating"
                    type="number"
                    step="0.5"
                    defaultValue={Number(game.rating)}
                    placeholder="Enter rating once played"
                    className="peer block w-full rounded-md bg-green-50 text-black border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  />
                  <ClockIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                </div>
              </div>
            </div>

            {/* When Played */}
            <div className="mb-4">
              <label
                htmlFor="when_played"
                className="mb-2 block text-sm font-medium"
              >
                When did you finish playing it?
              </label>
              <div className="relative mt-2 rounded-md">
                <div className="relative">
                  <input
                    id="when_played"
                    name="when_played"
                    type="date"
                    defaultValue={(() => {
                      // Attempt to parse `game.when_played`
                      const whenPlayedDate = new Date(game.when_played);
                      // If valid, format to YYYY-MM-DD; otherwise, use today's date
                      return whenPlayedDate instanceof Date &&
                        !isNaN(whenPlayedDate.getTime())
                        ? whenPlayedDate.toISOString().split("T")[0]
                        : "";
                    })()}
                    placeholder="Enter date played"
                    className="peer block w-full rounded-md bg-green-50 text-black border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  />
                  <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                </div>
              </div>
            </div>
          </div>
          <input type="submit" id="submit-form" className="hidden" />
        </form>
        <ReplaceImageForm game={game} />
      </div>
      <div className="my-4 flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-400"
        >
          Cancel
        </button>
        <label
          htmlFor="submit-form"
          className="flex mr-4 h-10 items-center rounded-lg bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-800 cursor-pointer"
        >
          Edit Game
        </label>
      </div>
    </div>
  );
}

export function ReplaceImageForm({ game }: { game: GamesTable }) {
  const replaceImageWithId = (formData: FormData) =>
    replaceImage(
      String(game.game_id),
      String(game.name),
      String(game.img),
      formData,
    );

  return (
    <form action={replaceImageWithId} className="flex flex-col gap-4">
      <div className="mb-4">
        <label htmlFor="image" className="mb-2 block text-sm font-medium">
          Replace image file
        </label>
        <div className="relative flex gap-2 mt-2 rounded-md">
          <div className="relative w-full">
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              className="peer block w-full rounded-md bg-green-50 text-black border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              required
            />
            <FolderIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
          <button
            type="submit"
            className="flex h-10 items-center rounded-lg bg-indigo-500 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-800"
          >
            Upload
          </button>
        </div>
      </div>
    </form>
  );
}
