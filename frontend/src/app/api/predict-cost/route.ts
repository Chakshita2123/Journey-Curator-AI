import { NextRequest, NextResponse } from "next/server";
import type { TripRequest, PredictResponse } from "@/types/api";

const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://127.0.0.1:8000";
const TIMEOUT_MS = 35_000;
const RETRY_DELAY_MS = 1_500;

async function fetchWithRetry(url: string, init: RequestInit, retries = 1): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      console.warn(`[predict-cost] Cold-start retry ${attempt}…`);
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      const isTimeout = err instanceof Error && /abort/i.test(err.message);
      if (!isTimeout || attempt >= retries) throw err;
      console.warn(`[predict-cost] Timeout on attempt ${attempt + 1}, retrying…`);
    }
  }
  throw new Error("fetch failed after retries");
}

export async function POST(req: NextRequest) {
  try {
    const body: TripRequest = await req.json();

    const upstream = await fetchWithRetry(`${FASTAPI_URL}/predict-cost`, {
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
    const msg = err instanceof Error ? err.message : String(err);
    const isTimeout = /abort|timeout/i.test(msg);
    const isColdStart = /ECONNREFUSED|ENOTFOUND/i.test(msg);
    const message = isTimeout
      ? "The ML backend is still warming up (cold start). Please wait 30-60 seconds and try again."
      : isColdStart
      ? "The ML backend is temporarily offline. Please try again shortly."
      : "Unexpected error contacting ML backend";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
