import { NextRequest, NextResponse } from "next/server";

const OW_KEY = process.env.OPENWEATHER_API_KEY;
const GEO_URL = "https://api.openweathermap.org/geo/1.0/direct";
const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

// Timeout increased to 10 s (was 5 s — too short for OWM geocoding under load)
const FETCH_TIMEOUT_MS = 10_000;
// How long to wait before the retry attempt
const RETRY_DELAY_MS = 800;

interface GeoResult {
  lat: number;
  lon: number;
  name: string;
  country: string;
}

interface WeatherMain {
  temp: number;
  feels_like: number;
  humidity: number;
}

interface WeatherDesc {
  description: string;
  icon: string;
}

interface ForecastItem {
  dt: number;
  main: WeatherMain;
  weather: WeatherDesc[];
  dt_txt: string;
}

// ── fetchWithRetry ─────────────────────────────────────────────────────────────
// Wraps fetch with a configurable timeout + one automatic retry on timeout/network
// errors. On retry, waits RETRY_DELAY_MS before trying again.
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  timeoutMs = FETCH_TIMEOUT_MS,
  maxRetries = 1,
): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      // Brief pause before retry
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      console.warn(`[weather] 🔄 Retry attempt ${attempt} for: ${url.split("?")[0]}`);
    }
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timer);
        return res;
      } finally {
        clearTimeout(timer);
      }
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      // Only retry on timeout / network errors, not on 4xx responses
      const isRetryable = /abort|timeout|network|ECONNRESET|ETIMEDOUT/i.test(msg);
      if (!isRetryable || attempt >= maxRetries) throw err;
      console.warn(`[weather] ⚠️  Attempt ${attempt + 1} failed (${msg}) — will retry`);
    }
  }
  throw lastErr;
}

export async function POST(req: NextRequest) {
  if (!OW_KEY) {
    return NextResponse.json({ source: "error", error: "No API key" }, { status: 500 });
  }

  try {
    const { destination, startDate } = await req.json();
    if (!destination?.trim()) {
      return NextResponse.json({ source: "error", error: "No destination" }, { status: 400 });
    }

    // Step 1: Geocode — most likely to timeout; uses fetchWithRetry
    const geoRes = await fetchWithRetry(
      `${GEO_URL}?q=${encodeURIComponent(destination)}&limit=1&appid=${OW_KEY}`,
    );
    if (!geoRes.ok) throw new Error("Geocoding failed");
    const geoData: GeoResult[] = await geoRes.json();
    if (!geoData.length) {
      return NextResponse.json({ source: "not_found", error: "Destination not found" });
    }
    const { lat, lon, name, country } = geoData[0];

    // Step 2: Current weather
    const weatherRes = await fetchWithRetry(
      `${WEATHER_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${OW_KEY}`,
    );
    if (!weatherRes.ok) throw new Error("Weather fetch failed");
    const weatherData = await weatherRes.json();

    const current = {
      temp: Math.round(weatherData.main.temp),
      feels_like: Math.round(weatherData.main.feels_like),
      humidity: weatherData.main.humidity,
      description: weatherData.weather?.[0]?.description ?? "",
      icon: weatherData.weather?.[0]?.icon ?? "",
      iconUrl: `https://openweathermap.org/img/wn/${weatherData.weather?.[0]?.icon ?? "01d"}@2x.png`,
      resolvedName: `${name}, ${country}`,
    };

    // Step 3: 5-day forecast (only if startDate is within the next 5 days)
    let forecast: { date: string; temp: number; description: string; icon: string }[] = [];
    let withinForecastRange = false;

    if (startDate) {
      const start = new Date(startDate);
      const now = new Date();
      const diffDays = (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      withinForecastRange = diffDays >= -1 && diffDays <= 5;
    } else {
      withinForecastRange = true; // no date = show current + near future
    }

    if (withinForecastRange) {
      try {
        const forecastRes = await fetchWithRetry(
          `${FORECAST_URL}?lat=${lat}&lon=${lon}&units=metric&cnt=24&appid=${OW_KEY}`,
        );
        if (forecastRes.ok) {
          const forecastData = await forecastRes.json();
          // Aggregate by day: take the midday (12:00) reading per day, max 4 days
          const dayMap = new Map<string, ForecastItem>();
          for (const item of forecastData.list as ForecastItem[]) {
            const day = item.dt_txt.slice(0, 10);
            const hour = item.dt_txt.slice(11, 13);
            if (hour === "12" || !dayMap.has(day)) {
              dayMap.set(day, item);
            }
          }
          forecast = Array.from(dayMap.entries())
            .slice(0, 4)
            .map(([date, item]) => ({
              date,
              temp: Math.round(item.main.temp),
              description: item.weather?.[0]?.description ?? "",
              icon: item.weather?.[0]?.icon ?? "01d",
            }));
        }
      } catch (forecastErr) {
        // Forecast is non-critical — log and continue with just current weather
        console.warn("[weather] Forecast fetch failed (non-fatal):", forecastErr instanceof Error ? forecastErr.message : forecastErr);
      }
    }

    return NextResponse.json({
      source: "live",
      current,
      forecast,
      withinForecastRange,
    });
  } catch (err) {
    console.error("[weather] Error:", err);
    return NextResponse.json({ source: "error", error: "Weather service unavailable" });
  }
}
