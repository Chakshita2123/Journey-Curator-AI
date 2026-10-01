import { NextResponse } from "next/server";

// Dev-only image verification helper — disabled in production.
export async function GET() {
  return NextResponse.json(
    { error: "This endpoint is disabled in production." },
    { status: 410 }
  );
}
