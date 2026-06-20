// migrate-v2.ts

import { db } from "./database.js";
import { licences } from "../lib/licences.ts";

db.serialize(() => {
  db.run("PRAGMA foreign_keys = OFF");

  // Create new licences table
  db.run(`
    CREATE TABLE IF NOT EXISTS licences (
      licence_id INTEGER PRIMARY KEY,
      licence_name TEXT NOT NULL UNIQUE
    )
  `);

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO licences
    (licence_id, licence_name)
    VALUES (?, ?)
  `);

  licences.forEach((licence) => {
    stmt.run(licence.licence_id, licence.licence_name);
  });

  stmt.finalize();

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
      tried INTEGER CHECK(tried IN (0,1) OR tried IS NULL),
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
      tried,
      finished,
      rating,
      img
    )
    SELECT
      g.game_id,
      g.platform_id,
      p.platform_id,
      g.name,
      6 AS licence_id, -- Default to "Other" for existing entries
      g.retro,
      g.handheld,
      g.prequel_id,
      g.hltb_time,
      g.tried,
      g.finished,
      g.rating,
      g.img
    FROM games g
    JOIN platforms p
      ON p.platform_name = g.play_method;
  `);

  // Create play history
  db.run(`
    CREATE TABLE IF NOT EXISTS play_history (
      play_id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      when_played DATE NOT NULL,
      FOREIGN KEY(game_id)
        REFERENCES games_new(game_id)
        ON DELETE CASCADE
    )
  `);

  // Move old dates
  db.run(`
    INSERT INTO play_history (game_id, when_played)
    SELECT game_id, when_played
    FROM games
    WHERE when_played IS NOT NULL
      AND when_played != '';
  `);

  db.run("DROP TABLE games");
  db.run("ALTER TABLE games_new RENAME TO games");

  db.run("PRAGMA foreign_keys = ON");

  console.log("Migration complete");
});