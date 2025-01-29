import { NextResponse } from "next/server";
import https from "https";
import fs from "fs";
import { HowLongToBeatService } from "../hltb/howlongtobeat"; // Taken from https://github.com/ckatzorke/howlongtobeat/
import { fetchAllGames } from "../lib/data";
import path from "path";
import { dbRun } from "../api/transactions";
import UserAgent from "user-agents";

async function downloadImage(imageUrl:string, savePath: string) {
    const protocol = https;

    return new Promise<void>((resolve, reject) => {
        const options = {
            headers: {
                "User-Agent": new UserAgent().toString(),
                origin: "https://howlongtobeat.com",
                referer: "https://howlongtobeat.com",
            },
        };

        protocol.get(imageUrl, options, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to get '${imageUrl}' (${response.statusCode})`));
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
        }).on("error", (err) => reject(err));
    });
}

function removePunctuation(name: string): string {
    return name
        .replace(/[^\w\s\-]|_/g, "")
        .replace(/\s/g,"-");
}

async function downloadAllImages() {
    const hltbService = new HowLongToBeatService;
    const [games, searchKey] = await Promise.all([
    fetchAllGames(),
    hltbService.getSearchKey()
    ]);
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
                    downloadImage(imageUrl, path.join(publicDir, savePath))
                ]);
            } catch (error) {
                console.error(`HLTB fetch error with ${game.name}:`, error);
            }
        }
    }
}


export async function GET() {
  try {
    await downloadAllImages();
    return NextResponse.json({ message: 'Successfully downloaded all remaining images.'});
  } catch (error: any) {
    console.error('Error:', error.message);
    return NextResponse.json({ error }, { status: 500 });
  }
}