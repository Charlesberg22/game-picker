import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(req: NextRequest) {
  const imageName = req.nextUrl.pathname.split('/').pop() as string;
  const imagePath = path.join(process.cwd(), 'public', 'games', imageName);

  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const contentType = 'image/jpeg';

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: { 'Content-Type': contentType },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
}