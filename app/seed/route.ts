import { NextResponse } from 'next/server';
import { games, platforms } from '../lib/placeholder-data';
import { dbAll, dbRun } from '../api/transactions';
import { GamesTable } from '../lib/data';

async function seedGames() {
    try {
        // Insert games without prequel_id
        const insertQuery = `
          INSERT INTO games (
            platform_id, name, licence, play_method, retro, handheld,
            hltb_time, tried, finished, rating, when_played
          )
          VALUES (
            ?, ?, ?, ?, ?, ?, ?,
            CASE WHEN ? = "" THEN NULL ELSE ? END,
            CASE WHEN ? = "" THEN NULL ELSE ? END,
            CASE WHEN ? = "" THEN NULL ELSE ? END,
            ?
          )
        `;
    
        for (const game of games) {
          const values = [
            game.platform_id,
            game.name,
            game.licence,
            game.play_method,
            game.retro,
            game.handheld,
            game.hltb_time === null ? "" : String(game.hltb_time),
            game.tried === null ? "" : String(game.tried),
            game.tried === null ? "" : String(game.tried), // required as two placeholders in the case expression, unsure of better way
            game.finished === null ? "" : String(game.finished),
            game.finished === null ? "" : String(game.finished), // required as two placeholders in the case expression, unsure of better way
            game.rating === null ? "" : String(game.rating),
            game.rating === null ? "" : String(game.rating), // required as two placeholders in the case expression, unsure of better way
            game.when_played === null ? "" : String(game.when_played),
          ];
    
          // console.log('Values being inserted:', values); // Debugging output

          await dbRun(insertQuery, values);
        }
    
        // Update prequel_id based on prequel_name
        const allGames = await dbAll(`SELECT game_id, name FROM games`) as GamesTable[];
    
        for (const game of games) {
          if (game.prequel_name) {
            const prequel = allGames.find((g: any) => g.name === game.prequel_name);
            if (prequel) {
              const updateQuery = `
                UPDATE games
                SET prequel_id = ?
                WHERE name = ?
              `;
              await dbRun(updateQuery, [String(prequel.game_id), game.name]);
            }
          }
        }
    
      } catch (error: any) {
        console.error('Error seeding database:', error.message);
        throw error;
      }
}

async function seedPlatforms() {
  try {
    const insertQuery = `
      INSERT INTO platforms (
        platform_id, platform_name
      )
      VALUES (
        ?, ?
      )
    `;

    for (const platform of platforms) {
      const values = [
        platform.platform_id,
        platform.platform_name,
      ];

      await dbRun(insertQuery, values);
    }

  } catch (error: any) {
    console.error('Error seeding database:', error.message);
    throw error;
  }
}

export async function GET() {
    try {
        await seedPlatforms();
        await seedGames();
        return NextResponse.json({ message: 'Database seeded successfully'});
    } catch (error: any) {
        console.error('Error:', error.message);
        return NextResponse.json({ error }, { status: 500 });
    }
}