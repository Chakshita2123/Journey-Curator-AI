"use client";

import { useEffect, useState, useRef } from "react";
import { Cloud, Thermometer, Droplets, Wind, Loader2, AlertCircle } from "lucide-react";

interface WeatherCurrent {
  temp: number;
  feels_like: number;
  humidity: number;
  description: string;
  icon: string;
  iconUrl: string;
  resolvedName: string;
}

interface WeatherForecastDay {
  date: string;
  temp: number;
  description: string;
  icon: string;
}

interface WeatherData {
  source: "live" | "error" | "not_found";
  current?: WeatherCurrent;
  forecast?: WeatherForecastDay[];
  withinForecastRange?: boolean;
  error?: string;
}

interface WeatherWidgetProps {
  destination: string;
  startDate?: string;
  /** If true, renders a compact inline version */
  compact?: boolean;
}

const WEATHER_EMOJI: Record<string, string> = {
  "01d": "☀️", "01n": "🌙",
  "02d": "⛅", "02n": "⛅",
  "03d": "☁️", "03n": "☁️",
  "04d": "☁️", "04n": "☁️",
  "09d": "🌧️", "09n": "🌧️",
  "10d": "🌦️", "10n": "🌦️",
  "11d": "⛈️", "11n": "⛈️",
  "13d": "❄️", "13n": "❄️",
  "50d": "🌫️", "50n": "🌫️",
};

function getEmoji(icon: string): string {
  return WEATHER_EMOJI[icon] ?? "🌡️";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function WeatherWidget({ destination, startDate, compact = false }: WeatherWidgetProps) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!destination.trim() || destination.trim().length < 2) {
      setData(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setData(null);
      try {
        const res = await fetch("/api/weather", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destination: destination.trim(), startDate: startDate || undefined }),
        });
        const json: WeatherData = await res.json();
        setData(json);
      } catch {
        setData({ source: "error", error: "Network error" });
      } finally {
        setLoading(false);
      }
    }, 900);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [destination, startDate]);

  // Nothing to show
  if (!destination.trim() || (!loading && !data)) return null;

  // Loading skeleton
  if (loading) {
    return (
      <div className={`weather-widget ${compact ? "weather-widget--compact" : ""} animate-pulse`}
        style={{
          borderRadius: "1.5rem",
          padding: compact ? "0.75rem 1rem" : "1rem 1.25rem",
          background: "var(--color-surface-teal)",
          border: "1px solid rgba(0,184,148,0.18)",
          display: "flex", alignItems: "center", gap: "0.75rem",
        }}>
        <Loader2 className="w-4 h-4 text-[var(--color-teal)] animate-spin shrink-0" />
        <span className="text-xs text-[var(--color-muted)]">Fetching weather for {destination}…</span>
      </div>
    );
  }

  // Error / not found — hide silently (don't break the page)
  if (!data || data.source === "error" || data.source === "not_found" || !data.current) {
    return null;
  }

  const { current, forecast, withinForecastRange } = data;
  const isLive = data.source === "live";
  const emoji = getEmoji(current.icon);

  if (compact) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-2xl text-sm"
        style={{
          background: isLive ? "var(--color-surface-teal)" : "var(--color-bg)",
          border: `1px solid ${isLive ? "rgba(0,184,148,0.25)" : "rgba(45,42,74,0.1)"}`,
        }}
      >
        <span className="text-base">{emoji}</span>
        <span className="font-semibold text-[var(--color-text)]">{current.temp}°C</span>
        <span className="text-[var(--color-muted)] capitalize">{current.description}</span>
        <span
          className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: isLive ? "var(--color-teal)" : "rgba(45,42,74,0.08)",
            color: isLive ? "white" : "var(--color-muted)",
          }}
        >
          {isLive ? "🔴 Live" : "Seasonal"}
        </span>
      </div>
    );
  }

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        background: "var(--color-surface-teal)",
        border: "1px solid rgba(0,184,148,0.20)",
        boxShadow: "0 4px 24px rgba(0,184,148,0.08)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid rgba(0,184,148,0.14)" }}
      >
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-[var(--color-teal)]" />
          <span className="text-sm font-semibold text-[var(--color-teal-dark)]">
            {current.resolvedName}
          </span>
        </div>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
          style={{
            background: isLive ? "var(--color-teal)" : "rgba(110,107,142,0.14)",
            color: isLive ? "white" : "var(--color-muted)",
          }}
        >
          {isLive ? (
            <><span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-pulse" /> Live Weather</>
          ) : (
            "Seasonal Estimate"
          )}
        </span>
      </div>

      {/* Current conditions */}
      <div className="px-5 py-4 flex items-center gap-4">
        <div className="text-5xl leading-none select-none">{emoji}</div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-3xl font-bold text-[var(--color-text)]">{current.temp}°C</span>
            <span className="text-sm text-[var(--color-muted)] capitalize">{current.description}</span>
          </div>
          <div className="flex items-center gap-4 mt-1.5 text-xs text-[var(--color-muted)]">
            <span className="flex items-center gap-1">
              <Thermometer className="w-3 h-3" />
              Feels {current.feels_like}°C
            </span>
            <span className="flex items-center gap-1">
              <Droplets className="w-3 h-3" />
              {current.humidity}% humidity
            </span>
          </div>
        </div>
      </div>

      {/* Forecast strip */}
      {withinForecastRange && forecast && forecast.length > 0 && (
        <div
          className="px-5 py-3 grid gap-2"
          style={{
            borderTop: "1px solid rgba(0,184,148,0.12)",
            gridTemplateColumns: `repeat(${Math.min(forecast.length, 4)}, 1fr)`,
          }}
        >
          {forecast.slice(0, 4).map((day) => (
            <div key={day.date} className="flex flex-col items-center gap-1 text-center">
              <span className="text-xs text-[var(--color-muted)] font-medium">
                {formatDate(day.date)}
              </span>
              <span className="text-lg">{getEmoji(day.icon)}</span>
              <span className="text-xs font-bold text-[var(--color-text)]">{day.temp}°C</span>
              <span className="text-[10px] text-[var(--color-muted)] capitalize leading-tight">
                {day.description}
              </span>
            </div>
          ))}
        </div>
      )}

      {!withinForecastRange && startDate && (
        <div className="px-5 py-2 text-xs text-[var(--color-muted)] italic"
          style={{ borderTop: "1px solid rgba(0,184,148,0.12)" }}>
          Trip dates are beyond the 5-day forecast window — showing current conditions only.
        </div>
      )}
    </div>
  );
}
