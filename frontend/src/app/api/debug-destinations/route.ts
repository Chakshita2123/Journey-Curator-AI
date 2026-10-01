import { NextResponse } from "next/server";

// This was a dev-only helper route used to extract data from a local CSV.
// It is disabled in production — the CSV is not available on the frontend service's filesystem.
export async function GET() {
  return NextResponse.json(
    { error: "This debug endpoint is disabled in production." },
    { status: 410 }
  );
}
