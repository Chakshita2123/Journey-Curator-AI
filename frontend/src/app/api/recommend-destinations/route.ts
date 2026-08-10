import { NextRequest, NextResponse } from "next/server";
import type { RecommendDestinationsRequest, RecommendDestinationsResponse } from "@/types/api";

const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  try {
    const body: RecommendDestinationsRequest = await req.json();

    const upstream = await fetch(`${FASTAPI_URL}/recommend-destinations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!upstream.ok) {
      const error = await upstream.json().catch(() => ({ detail: "Unknown error from recommendation service" }));
      return NextResponse.json(
        { error: error.detail ?? "Recommendation failed" },
        { status: upstream.status }
      );
    }

    const data: RecommendDestinationsResponse = await upstream.json();
    return NextResponse.json(data);
  } catch (err) {
    const message =
      err instanceof Error && err.message.includes("ECONNREFUSED")
        ? "ML backend is offline. Start it with: uvicorn app.main:app --reload --port 8000"
        : "Unexpected error contacting recommendation backend";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
