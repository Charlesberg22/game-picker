import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";

const dataFolderPath = path.join(process.cwd(), "data");
if (!fs.existsSync(dataFolderPath)) {
    fs.mkdirSync(dataFolderPath);
}

// create db at data folder
const dbPath = path.join(dataFolderPath, "games.db");

// initialising the database, or connecting if it exists
export const db = new sqlite3.Database(
    dbPath,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, // can be created or opened for reading and writing if exists
    (error) => {
        if (error) {
            console.error(error.message);
            return;
        }
        console.log("Connected to games database.");
    }
);

db.serialize(() => {
    db.run(
        `
            CREATE TABLE IF NOT EXISTS platforms (
                platform_id INTEGER PRIMARY KEY,
                platform_name TEXT NOT NULL
            );
        `,
        (error) => {
            if (error) {
                console.error(error.message);
            }
            console.log("platforms table created successfully.");
        }
    );

    db.run(
        `
            CREATE TABLE IF NOT EXISTS games (
                game_id INTEGER UNIQUE PRIMARY KEY AUTOINCREMENT,
                platform_id INTEGER NOT NULL,
                name TEXT NOT NULL UNIQUE,
                licence TEXT NOT NULL,
                play_method TEXT NOT NULL,
                retro INTEGER NOT NULL CHECK(retro IN (0, 1)),
                handheld INTEGER NOT NULL CHECK(handheld IN (0, 1)),
                prequel_id INTEGER,
                hltb_time REAL,
                tried INTEGER CHECK(tried IN (0, 1) OR tried IS NULL),
                finished INTEGER CHECK(finished IN (0, 1) or finished IS NULL),
                rating REAL CHECK((rating >= 0 AND rating <= 10) OR rating IS NULL),
                when_played DATE,
                img TEXT,
                FOREIGN KEY(platform_id) REFERENCES platforms(platform_id)
            );
        `,
        (error) => {
            if (error) {
                console.error(error.message);
            }
            console.log("games table created successfully.");
        }
    );
});