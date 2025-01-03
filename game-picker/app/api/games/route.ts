import { apiDelete, apiGet, apiPatch, apiPost } from "../transactions";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      platform_id,
      name,
      licence,
      play_method,
      retro,
      prequel_id,
      hltb_time,
      tried,
      finished,
      rating,
      when_played,
      img,
    } = body;

    const query = `
      INSERT INTO games(platform_id, name, licence, play_method, retro, prequel_id, hltb_time, tried, finished, rating, when_played, img)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      platform_id,
      name,
      licence,
      play_method,
      retro,
      prequel_id,
      hltb_time,
      tried,
      finished,
      rating,
      when_played,
      img,
    ];

    await apiPost(query, values);

    return NextResponse.json(
      { message: 'Successfully added game' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error adding game:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to add game' },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  const query = `
    SELECT platform_name, name, licence, play_method, retro, prequel_id, hltb_time, tried, finished, rating, when_played, img
    FROM games
    JOIN platforms ON games.platform_id = platforms.platform_id
  `;

  try {
    const body = await apiGet(query);
    return NextResponse.json(body, { status: 200 });
  } catch (error: any) {
    console.error('Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required for updating a record' },
        { status: 400 }
      );
    }

    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(', ');
    const values: string[] = Object.values(updates).map(String); // make all values strings
    values.push(String(id)); // Add `id` for WHERE clause, and ensure is string

    const query = `
      UPDATE games
      SET ${fields}
      WHERE id = ?
    `;

    await apiPatch(query, values);

    return NextResponse.json(
      { message: `Successfully updated game with ID: ${id}` },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating game:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to update game' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required for deleting a record' },
        { status: 400 }
      );
    }

    const query = `
      DELETE FROM games
      WHERE id = ?
    `;
    const values = [id];

    await apiDelete(query, values);

    return NextResponse.json(
      { message: `Successfully deleted game with ID: ${id}` },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting game:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to delete game' },
      { status: 400 }
    );
  }
}