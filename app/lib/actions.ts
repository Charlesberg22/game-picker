"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { dbRun } from "../api/transactions";
import { redirect } from "next/navigation";
import https from "https";
import fs from "fs";
import UserAgent from "user-agents";
import { removePunctuation } from "./utils";
import {
  fetchAllGames,
  fetchGameById,
  fetchLastRowId,
  GamesTable,
} from "./data";
import { HowLongToBeatService } from "../hltb/howlongtobeat"; // Taken from https://github.com/ckatzorke/howlongtobeat/
import path from "path";
import { games } from "./placeholder-data";

const FormSchema = z.object({
  game_id: z.string(),
  name: z.string({
    invalid_type_error: "Enter a name.",
  }),
  platform_id: z.string({
    invalid_type_error: "Select a platform.",
  }),
  licence: z.string({
    invalid_type_error: "Enter a licence type.",
  }),
  play_method: z.string({
    invalid_type_error: "Enter a platform to play on.",
  }),
  retro: z.coerce.boolean({
    invalid_type_error: "Select retro or modern.",
  }),
  handheld: z.coerce.boolean({
    invalid_type_error: "Select handheld or television.",
  }),
  prequel_id: z.string(),
  hltb_time: z.string(),
  tried: z.coerce.boolean().nullable(),
  finished: z.coerce.boolean().nullable(),
  rating: z.coerce.number().gte(0).lte(10),
  when_played: z.string().nullable(),
});

export async function deleteGame(id: string) {
  const deleteQuery = `
      DELETE FROM games
      WHERE game_id = ?
      `;
  const values = [id];
  const game = await fetchGameById(id);

  try {
    await dbRun(deleteQuery, values);
  } catch (error: any) {
    console.error("Error deleting game:", error.message);
    throw error;
  }

  if (game.img) {
    const publicDir = path.join(process.cwd(), "public");
    const savePath = path.join(publicDir, game.img);
    fs.unlink(savePath, (err) => {
      if (err) throw err;
    });
  }

  revalidatePath("/");
  revalidatePath("/stats");
}

const UpdateGame = FormSchema.omit({ game_id: true });

export async function updateGame(id: string, formData: FormData) {
  const previousPage = formData.get("previousPage") as string;

  const {
    name,
    platform_id,
    licence,
    play_method,
    retro,
    handheld,
    prequel_id,
    hltb_time,
    tried,
    finished,
    rating,
    when_played,
  } = UpdateGame.parse({
    name: formData.get("name"),
    platform_id: formData.get("platform_id"),
    licence: formData.get("licence"),
    play_method: formData.get("play_method"),
    retro: formData.get("retro"),
    handheld: formData.get("handheld"),
    prequel_id: formData.get("prequel_id"),
    hltb_time: formData.get("hltb_time"),
    tried: formData.get("tried"),
    finished: formData.get("finished"),
    rating: formData.get("rating"),
    when_played: formData.get("when_played"),
  });

  const updateQuery = `
        UPDATE games
        SET name = ?,
          platform_id = ?,
          licence = ?,
          play_method = ?,
          retro = ?,
          handheld = ?,
          prequel_id = CASE WHEN ? = "" THEN NULL ELSE ? END,
          hltb_time = ?,
          tried = ?,
          finished = ?,
          rating = CASE WHEN ? <= 0 THEN NULL ELSE ? END,
          when_played = ?
        WHERE game_id = ?
    `;

  const values = [
    name,
    platform_id,
    licence,
    play_method,
    retro,
    handheld,
    prequel_id,
    prequel_id,
    hltb_time,
    tried,
    finished,
    rating,
    rating,
    when_played,
    id,
  ] as string[];

  try {
    await dbRun(updateQuery, values);
  } catch (error: any) {
    console.error("Error updating game:", error.message);
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/stats");
  redirect(previousPage);
}

const CreateGame = FormSchema.omit({ game_id: true });

export async function createGame(formData: FormData) {
  const previousPage = formData.get("previousPage") as string;

  const {
    name,
    platform_id,
    licence,
    play_method,
    retro,
    handheld,
    prequel_id,
    hltb_time,
    tried,
    finished,
    rating,
    when_played,
  } = CreateGame.parse({
    name: formData.get("name"),
    platform_id: formData.get("platform_id"),
    licence: formData.get("licence"),
    play_method: formData.get("play_method"),
    retro: formData.get("retro"),
    handheld: formData.get("handheld"),
    prequel_id: formData.get("prequel_id"),
    hltb_time: formData.get("hltb_time"),
    tried: formData.get("tried"),
    finished: formData.get("finished"),
    rating: formData.get("rating"),
    when_played: formData.get("when_played"),
  });

  const createQuery = `
        INSERT INTO games (name, platform_id, licence, play_method, retro, handheld, prequel_id, hltb_time, tried, finished, rating, when_played)
        VALUES (?, ?, ?, ?, ?, ?, CASE WHEN ? = "" THEN NULL ELSE ? END, ?, ?, ?, CASE WHEN ? <= 0 THEN NULL ELSE ? END, ?)
    `;

  const values = [
    name,
    platform_id,
    licence,
    play_method,
    retro,
    handheld,
    prequel_id,
    prequel_id,
    hltb_time,
    tried,
    finished,
    rating,
    rating,
    when_played,
  ] as string[];

  // unavoidable promise waterfall as each relies on the last
  try {
    await dbRun(createQuery, values);
    const id = await fetchLastRowId();
    const game = await fetchGameById(id);
    await saveImagesToDb(game);
  } catch (error: any) {
    console.error("Error creating game:", error.message);
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/stats");
  redirect(previousPage || "/");
}

export async function refreshRandomGame() {
  revalidatePath("/randomiser");
}

async function downloadImage(imageUrl: string, savePath: string) {
  const protocol = https;

  return new Promise<void>((resolve, reject) => {
    const options = {
      headers: {
        "User-Agent": new UserAgent().toString(),
        origin: "https://howlongtobeat.com",
        referer: "https://howlongtobeat.com",
      },
    };

    protocol
      .get(imageUrl, options, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(`Failed to get '${imageUrl}' (${response.statusCode})`),
          );
          return;
        }

        const fileStream = fs.createWriteStream(savePath);
        response.pipe(fileStream);

        fileStream.on("finish", () => {
          fileStream.close(() => resolve());
        });

        fileStream.on("error", (err) => {
          fs.unlink(savePath, () => reject(err));
        });
      })
      .on("error", (err) => reject(err));
  });
}

export async function saveImagesToDb(game?: GamesTable) {
  const hltbService = new HowLongToBeatService();
  let games: GamesTable[] = [];
  let searchKey: string;
  if (typeof game === "undefined") {
    [games, searchKey] = await Promise.all([
      fetchAllGames(),
      hltbService.getSearchKey(),
    ]);
  } else {
    games[0] = game;
    searchKey = await hltbService.getSearchKey();
  }

  const updateQuery = `
        UPDATE games
        SET img = ?
        WHERE game_id = ?
    `;
  const publicDir = path.join(process.cwd(), "public");

  for (const game of games) {
    if (!game.img) {
      try {
        const result = await hltbService.search(game.name, searchKey);
        const imageUrl = result[0].imageUrl;
        const cleanedName = removePunctuation(game.name);
        const savePath = path.join("/games", cleanedName.concat(".jpg"));
        const values = [savePath, String(game.game_id)];
        await Promise.all([
          dbRun(updateQuery, values),
          downloadImage(imageUrl, path.join(publicDir, savePath)),
        ]);
      } catch (error) {
        console.error(`HLTB fetch error with ${game.name}:`, error);
      }
    }
  }
}
