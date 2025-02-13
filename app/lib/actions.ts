"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { dbRun } from "../api/transactions";
import https from "https";
import fs from "fs";
import UserAgent from "user-agents";
import { CountingSemaphore, removePunctuation } from "./utils";
import {
  fetchAllGames,
  fetchGameById,
  fetchLastRowId,
  GamesTable,
} from "./data";
import path from "path";
import SGDB from "steamgriddb";
import { exec } from "child_process";
import { promisify } from "util";

const FormSchema = z.object({
  game_id: z.string(),
  name: z.string().min(1, { message: "You must enter a name." }),
  platform_id: z.string({
    invalid_type_error: "You must select a platform.",
  }),
  licence: z.string().min(1, { message: "You must enter a licence type." }),
  play_method: z.string().min(1, { message: "You must enter a platform." }),
  retro: z
    .union([z.literal("true"), z.literal("")], {
      errorMap: () => ({ message: "You must select retro or modern." }),
    })
    .pipe(z.coerce.boolean()),
  handheld: z
    .union([z.literal("true"), z.literal("")], {
      errorMap: () => ({ message: "You must select handheld or television." }),
    })
    .pipe(z.coerce.boolean()),
  prequel_id: z.string(),
  hltb_time: z.string(),
  tried: z.coerce.boolean().nullable(),
  finished: z.coerce.boolean().nullable(),
  rating: z.coerce.number().gte(0).lte(10),
  when_played: z.string().nullable(),
});

export type State =
  | {
      errors?: {
        name?: string[];
        platform_id?: string[];
        licence?: string[];
        play_method?: string[];
        retro?: string[];
        handheld?: string[];
      };
      message?: string | null;
      formData?: {
        name?: string;
        platform_id?: string;
        licence?: string;
        play_method?: string;
        retro?: string;
        handheld?: string;
        prequel_id?: string;
      };
    }
  | undefined;

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

export async function updateGame(id: string, state: State, formData: FormData) {
  const validatedFields = UpdateGame.safeParse({
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

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

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
  } = validatedFields.data;

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
}

const CreateGame = FormSchema.omit({ game_id: true });

export async function createGame(state: State, formData: FormData) {
  const validatedFields = CreateGame.safeParse({
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

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      formData: {
        name: formData.get("name") as string,
        platform_id: formData.get("platform_id") as string,
        licence: formData.get("licence") as string,
        play_method: formData.get("play_method") as string,
        retro: formData.get("retro") as string,
        handheld: formData.get("handheld") as string,
        prequel_id: formData.get("prequel_id") as string,
      },
    };
  }

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
  } = validatedFields.data;

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
        origin: "https://steamgriddb.com",
        referer: "https://steamgriddb.com",
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

const apiKey = process.env.STEAMGRIDDB_API_KEY || "";
const execAsync = promisify(exec);

export async function saveImagesToDb(game?: GamesTable) {
  const client = new SGDB(apiKey);
  let games: GamesTable[] = [];
  if (typeof game === "undefined") {
    games = await fetchAllGames();
  } else {
    games[0] = game;
  }

  const updateQuery = `
        UPDATE games
        SET img = ?
        WHERE game_id = ?
    `;
  const publicDir = path.join(process.cwd(), "public");

  const semaphore = new CountingSemaphore(5);

  await Promise.all(
    games.map(async (game) => {
      if (!game.img) {
        try {
          await semaphore.acquire();

          const steamGrid = await client.searchGame(game.name);
          const steamGridId = steamGrid[0].id;
          const grids = await client.getGridsById(
            steamGridId,
            ["alternate"],
            ["600x900"],
            ["image/jpeg", "image/png"],
          );
          const imageUrl = grids[0].url.toString();
          const cleanedName = removePunctuation(game.name);
          const savePath = path.join("/games", cleanedName.concat(".jpg"));
          console.log(savePath);
          const values = [savePath, String(game.game_id)];

          await downloadImage(imageUrl, path.join(publicDir, savePath));
          await execAsync(`chown 99:100 ${path.join(publicDir, savePath)}`);
          await dbRun(updateQuery, values);
        } catch (error) {
          console.error(`SteamGridDB fetch error with ${game.name}:`, error);
        } finally {
          semaphore.release();
        }
      }
    }),
  );
}

export async function replaceImage(
  id: string,
  name: string,
  imgPath: string,
  formData: FormData,
) {
  const file = formData.get("image") as File;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const updateQuery = `
    UPDATE games
    SET img = ?
    WHERE game_id = ?
  `;

  const publicDir = path.join(process.cwd(), "public");
  console.log(imgPath);

  if (imgPath == "null") {
    const cleanedName = removePunctuation(name);
    const savePath = path.join("/games", cleanedName.concat(".jpg"));
    const values = [savePath, String(id)];
    await Promise.all([
      dbRun(updateQuery, values),
      fs.writeFile(path.join(publicDir, savePath), buffer, (err) => {
        if (err) {
          console.error(err);
        } else {
          // file written successfully
        }
      }),
    ]);
  } else {
    const savePath = imgPath;
    fs.writeFile(path.join(publicDir, savePath), buffer, (err) => {
      if (err) {
        console.error(err);
      } else {
        // file written successfully
      }
    });
  }
}