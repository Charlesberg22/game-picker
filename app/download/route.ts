import { NextResponse } from "next/server";
import { saveImagesToDb } from "../lib/actions";

export async function GET(request: Request) {
  try {
    await saveImagesToDb();
    return NextResponse.redirect(new URL("/stats", request.url));
  } catch (error: any) {
    console.error("Error:", error.message);
    return NextResponse.json({ error }, { status: 500 });
  }
}
