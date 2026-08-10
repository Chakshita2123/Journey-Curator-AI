import { NextRequest, NextResponse } from "next/server";
import type { TripRequest, PredictResponse } from "@/types/api";

const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  try {
    const body: TripRequest = await req.json();

    const upstream = await fetch(`${FASTAPI_URL}/predict-cost`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // Don't cache predictions
      cache: "no-store",
    });

    if (!upstream.ok) {
      const error = await upstream.json().catch(() => ({ detail: "Unknown error from ML backend" }));
      return NextResponse.json(
        { error: error.detail ?? "Prediction failed" },
        { status: upstream.status }
      );
    }

    const data: PredictResponse = await upstream.json();
    return NextResponse.json(data);
  } catch (err) {
    const message =
      err instanceof Error && err.message.includes("ECONNREFUSED")
        ? "ML backend is offline. Start it with: uvicorn app.main:app --reload --port 8000"
        : "Unexpected error contacting ML backend";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
