// migrate-v3.js

import { db } from "./database.js";

db.serialize(() => {
  db.run("PRAGMA foreign_keys = OFF");

  // Create new games table
  db.run(`
    CREATE TABLE games_new (
      game_id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform_id INTEGER NOT NULL,
      play_platform_id INTEGER NOT NULL,
      name TEXT NOT NULL UNIQUE,
      licence_id INTEGER NOT NULL,
      retro INTEGER NOT NULL CHECK(retro IN (0,1)),
      handheld INTEGER NOT NULL CHECK(handheld IN (0,1)),
      prequel_id INTEGER,
      hltb_time REAL,
      to_play INTEGER NOT NULL CHECK(to_play IN (0,1)),
      finished INTEGER CHECK(finished IN (0,1) OR finished IS NULL),
      rating REAL CHECK((rating >= 0 AND rating <= 10) OR rating IS NULL),
      release_date DATE,
      img TEXT,
      FOREIGN KEY(platform_id) REFERENCES platforms(platform_id),
      FOREIGN KEY(play_platform_id) REFERENCES platforms(platform_id),
      FOREIGN KEY(licence_id) REFERENCES licences(licence_id)
    )
  `);

  // Copy existing data
  db.run(`
    INSERT INTO games_new (
      game_id,
      platform_id,
      play_platform_id,
      name,
      licence_id,
      retro,
      handheld,
      prequel_id,
      hltb_time,
      to_play,
      finished,
      rating,
      release_date,
      img
    )
    SELECT
      g.game_id,
      g.platform_id,
      g.play_platform_id,
      g.name,
      g.licence_id,
      g.retro,
      g.handheld,
      g.prequel_id,
      g.hltb_time,
      CASE
        WHEN g.tried is NULL then 1
        ELSE 0
      END,
      g.finished,
      g.rating,
      g.release_date,
      g.img
    FROM games g
  `);

  db.run("DROP TABLE games");
  db.run("ALTER TABLE games_new RENAME TO games");

  db.run("PRAGMA foreign_keys = ON");

  console.log("Migration complete");
});