'use server';

import { revalidatePath } from 'next/cache';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

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