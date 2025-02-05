import { saveImagesToDb } from "@/app/lib/actions";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await saveImagesToDb();
    return NextResponse.json("Successfully downloaded missing images");
  } catch (error: any) {
    console.error("Error:", error.message);
    return NextResponse.json({ error }, { status: 500 });
  }
}
