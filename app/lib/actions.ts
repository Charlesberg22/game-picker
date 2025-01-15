'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { dbRun } from '../api/transactions';
import { redirect } from 'next/navigation';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

const FormSchema = z.object({
    game_id: z.string(),
    name: z.string({
        invalid_type_error: 'Enter a name.',
    }),
    platform_id: z.string({
        invalid_type_error: 'Select a platform.',
    }),
    licence: z.string({
        invalid_type_error: 'Enter a licence type.',
    }),
    play_method: z.string({
        invalid_type_error: 'Enter a platform to play on.',
    }),
    retro: z.coerce.boolean({
        invalid_type_error: 'Select retro or modern.'
    }),
    handheld: z.coerce.boolean({
        invalid_type_error: 'Select handheld or television.'
    }),
    prequel_id: z.string(),
    hltb_time: z.string(),
    tried: z.coerce.boolean().nullable(),
    finished: z.coerce.boolean().nullable(),
    rating: z.coerce.number().gte(0).lte(10),
    when_played: z.string().nullable(),
});

export async function deleteGame(id: string) {
    try {
        const response = await fetch(`${baseUrl}/api/games?id=${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete game');
        revalidatePath('/')
        return await response.json();
    } catch (error) {
        console.log(`Failed to delete game with ID: ${id} due to ${error}`)
    }
       
}

const UpdateGame = FormSchema.omit({ game_id: true });

export async function updateGame(id: string, formData: FormData) {
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
        name: formData.get('name'),
        platform_id: formData.get('platform_id'),
        licence: formData.get('licence'),
        play_method: formData.get('play_method'),
        retro: formData.get('retro'),
        handheld: formData.get('handheld'),
        prequel_id: formData.get('prequel_id'),
        hltb_time: formData.get('hltb_time'),
        tried: formData.get('tried'),
        finished: formData.get('finished'),
        rating: formData.get('rating'),
        when_played: formData.get('when_played'),
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
      id
    ] as string[]

    try {
      await dbRun(updateQuery, values);
    } catch (error: any) {
      console.error('Error updating game:', error.message);
      throw error;
    }

    revalidatePath('/');
    redirect('/');    
}

const CreateGame = FormSchema.omit({ game_id: true });

export async function createGame(formData: FormData) {
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
        name: formData.get('name'),
        platform_id: formData.get('platform_id'),
        licence: formData.get('licence'),
        play_method: formData.get('play_method'),
        retro: formData.get('retro'),
        handheld: formData.get('handheld'),
        prequel_id: formData.get('prequel_id'),
        hltb_time: formData.get('hltb_time'),
        tried: formData.get('tried'),
        finished: formData.get('finished'),
        rating: formData.get('rating'),
        when_played: formData.get('when_played'),
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
      when_played
    ] as string[]

    try {
      await dbRun(createQuery, values);
    } catch (error: any) {
      console.error('Error creating game:', error.message);
      throw error;
    }

    revalidatePath('/');
    redirect('/');    
}

export async function refreshRandomGame() {
    revalidatePath('/randomiser')
  }