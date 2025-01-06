import sqlite3 from "sqlite3";
import path from "path";

// create db at root
const dbPath = path.join(process.cwd(), "games.db");

// initialising the database, or connecting if it exists
export const db = new sqlite3.Database(
    dbPath,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, // can be created or opened for reading and writing if exists
    (error) => {
        if (error) {
            console.error(error.message);
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
                game_id INTEGER PRIMARY KEY,
                platform_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                licence TEXT NOT NULL,
                play_method TEXT NOT NULL,
                retro INTEGER NOT NULL CHECK("retro" in (0, 1)),
                handheld INTEGER NOT NULL CHECK("handheld in (0, 1)),
                prequel_id INTEGER,
                hltb_time FLOAT,
                tried INTEGER CHECK("tried" in (0, 1)),
                finished INTEGER CHECK("finished" in (0, 1)),
                rating FLOAT,
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