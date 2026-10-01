import { NextResponse } from "next/server";

// Dev-only helper route — disabled in production (no filesystem write access on Render).
export async function GET() {
  return NextResponse.json(
    { error: "This endpoint is disabled in production." },
    { status: 410 }
  );
}
