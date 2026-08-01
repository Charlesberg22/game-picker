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
} from "./data";
import path from "path";
import SGDB from "steamgriddb";
import { exec } from "child_process";
import { promisify } from "util";
import { GamesTable, State } from "./definitions";

const FormSchema = z.object({
  game_id: z.string(),
  name: z.string().min(1, { message: "You must enter a name." }),
  platform_id: z.string({
    invalid_type_error: "You must select a platform.",
  }),
  licence_id: z.string({
    invalid_type_error: "You must select a licence type.",
  }),
  play_platform_id: z.string({
    invalid_type_error: "You must select a platform.",
  }),
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
  to_play: z.coerce.boolean(),
  finished: z.coerce.boolean().nullable(),
  rating: z.coerce.number().gte(0).lte(10),
  release_date: z.string().nullable(),
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

export async function updateGame(id: string, state: State, formData: FormData) {
  const whenPlayed = formData.getAll("when_played") as string[];
  
  const validatedFields = UpdateGame.safeParse({
    name: formData.get("name"),
    platform_id: formData.get("platform_id"),
    licence_id: formData.get("licence_id"),
    play_platform_id: formData.get("play_platform_id"),
    retro: formData.get("retro"),
    handheld: formData.get("handheld"),
    prequel_id: formData.get("prequel_id"),
    hltb_time: formData.get("hltb_time"),
    to_play: formData.get("to_play"),
    finished: formData.get("finished"),
    rating: formData.get("rating"),
    release_date: formData.get("release_date"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const {
    name,
    platform_id,
    licence_id,
    play_platform_id,
    retro,
    handheld,
    prequel_id,
    hltb_time,
    to_play,
    finished,
    rating,
    release_date,
  } = validatedFields.data;

  const updateQuery = `
        UPDATE games
        SET name = ?,
          platform_id = ?,
          licence_id = ?,
          play_platform_id = ?,
          retro = ?,
          handheld = ?,
          prequel_id = CASE WHEN ? = "" THEN NULL ELSE ? END,
          hltb_time = ?,
          to_play = ?,
          finished = ?,
          rating = CASE WHEN ? <= 0 THEN NULL ELSE ? END,
          release_date = ?
        WHERE game_id = ?
    `;

  const values = [
    name,
    platform_id,
    licence_id,
    play_platform_id,
    retro,
    handheld,
    prequel_id,
    prequel_id,
    hltb_time,
    to_play,
    finished,
    rating,
    rating,
    release_date,
    id,
  ] as string[];

  try {
    await dbRun(updateQuery, values);

    await dbRun(`DELETE FROM play_history WHERE game_id = ?`, [id]);

    if (whenPlayed) {
      for (const date of whenPlayed) {
        await dbRun(
        `INSERT INTO play_history (game_id, when_played) VALUES (?, ?)`,
        [id, date],
          );
      }
    }
  } catch (error: any) {
    console.error("Error updating game:", error.message);
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/stats");
}

const CreateGame = FormSchema.omit({ game_id: true });

export async function createGame(state: State, formData: FormData) {
  const whenPlayed = formData.getAll("when_played") as string[];

  const validatedFields = CreateGame.safeParse({
    name: formData.get("name"),
    platform_id: formData.get("platform_id"),
    licence_id: formData.get("licence_id"),
    play_platform_id: formData.get("play_platform_id"),
    retro: formData.get("retro"),
    handheld: formData.get("handheld"),
    prequel_id: formData.get("prequel_id"),
    hltb_time: formData.get("hltb_time"),
    to_play: formData.get("to_play"),
    finished: formData.get("finished"),
    rating: formData.get("rating"),
    release_date: formData.get("release_date"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      formData: {
        name: formData.get("name") as string,
        platform_id: formData.get("platform_id") as string,
        licence_id: formData.get("licence_id") as string,
        play_platform_id: formData.get("play_platform_id") as string,
        retro: formData.get("retro") as string,
        handheld: formData.get("handheld") as string,
        prequel_id: formData.get("prequel_id") as string,
        release_date: formData.get("release_date") as string,
      },
    };
  }

  const {
    name,
    platform_id,
    licence_id,
    play_platform_id,
    retro,
    handheld,
    prequel_id,
    hltb_time,
    to_play,
    finished,
    rating,
    release_date,
  } = validatedFields.data;

  const createQuery = `
        INSERT INTO games (name, platform_id, licence_id, play_platform_id, retro, handheld, prequel_id, hltb_time, to_play, finished, rating, release_date)
        VALUES (?, ?, ?, ?, ?, ?, CASE WHEN ? = "" THEN NULL ELSE ? END, ?, ?, ?, CASE WHEN ? <= 0 THEN NULL ELSE ? END, ?)
    `;

  const values = [
    name,
    platform_id,
    licence_id,
    play_platform_id,
    retro,
    handheld,
    prequel_id,
    prequel_id,
    hltb_time,
    to_play,
    finished,
    rating,
    rating,
    release_date,
  ] as string[];

  // unavoidable promise waterfall as each relies on the last
  try {
    await dbRun(createQuery, values);
    const id = await fetchLastRowId();
    const game = await fetchGameById(id);
    if (whenPlayed) {
      for (const date of whenPlayed) {
        await dbRun(
        `INSERT INTO play_history (game_id, when_played) VALUES (?, ?)`,
        [id, date],
          );
      }
    }
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
  fromUrl: boolean,
) {
  const publicDir = path.join(process.cwd(), "public");
  let savePath: string;
  if (imgPath == "null") {
    const cleanedName = removePunctuation(name);
    savePath = path.join("/games", cleanedName.concat(".jpg"));
  } else {
    savePath = imgPath;
  }

  const updateQuery = `
    UPDATE games
    SET img = ?
    WHERE game_id = ?
  `;

  if (fromUrl) {
    await downloadImage(formData.get("url") as string, path.join(publicDir, savePath));
    await execAsync(`chown 99:100 ${path.join(publicDir, savePath)}`);
    const values = [savePath, String(id)];
    await dbRun(updateQuery, values);
  } else {
    const file = formData.get("image") as File;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    if (imgPath == "null") {
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
      fs.writeFile(path.join(publicDir, savePath), buffer, (err) => {
        if (err) {
          console.error(err);
        } else {
          // file written successfully
        }
      });
    }
  }
  console.log(imgPath);
}
