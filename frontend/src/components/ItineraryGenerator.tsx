"use client";

import { useState } from "react";
import {
  MapPin,
  Sparkles,
  Loader2,
  DollarSign,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  Compass,
  Utensils,
  SunMedium,
  Navigation,
  Backpack,
  Lightbulb,
  Gem,
} from "lucide-react";
import type {
  ItineraryDay,
  ItineraryRequest,
  ItineraryResponse,
  PredictResponse,
  TripRequest,
} from "@/types/api";
import { motion, LoadingStateCard } from "@/components/motion";
import { useUserJourney } from "@/context/UserJourneyContext";
import { useSession } from "next-auth/react";
import AuthModal from "@/components/AuthModal";
import WeatherWidget from "@/components/WeatherWidget";
import DestinationAutocomplete from "@/components/DestinationAutocomplete";

const ACCOMMODATION_TYPES = ["Hotel", "Resort", "Airbnb", "Hostel", "Villa", "Guesthouse"];
const TRANSPORT_TYPES = ["Flight", "Train", "Bus", "Car rental", "Ferry", "Cruise"];

// Rotating color themes for days
const DAY_THEMES = [
  {
    bg: "bg-teal-50/70 border-teal-200/80 hover:border-teal-300",
    badge: "bg-teal-600 text-white shadow-xs",
    accent: "text-teal-700",
    gemBorder: "border-teal-300 bg-teal-100/50",
  },
  {
    bg: "bg-indigo-50/70 border-indigo-200/80 hover:border-indigo-300",
    badge: "bg-indigo-600 text-white shadow-xs",
    accent: "text-indigo-700",
    gemBorder: "border-indigo-300 bg-indigo-100/50",
  },
  {
    bg: "bg-rose-50/70 border-rose-200/80 hover:border-rose-300",
    badge: "bg-rose-600 text-white shadow-xs",
    accent: "text-rose-700",
    gemBorder: "border-rose-300 bg-rose-100/50",
  },
  {
    bg: "bg-amber-50/70 border-amber-200/80 hover:border-amber-300",
    badge: "bg-amber-600 text-white shadow-xs",
    accent: "text-amber-700",
    gemBorder: "border-amber-300 bg-amber-100/50",
  },
  {
    bg: "bg-emerald-50/70 border-emerald-200/80 hover:border-emerald-300",
    badge: "bg-emerald-600 text-white shadow-xs",
    accent: "text-emerald-700",
    gemBorder: "border-emerald-300 bg-emerald-100/50",
  },
];

function getDayEmoji(title: string, summary: string, attractions: string[]): string {
  const text = `${title} ${summary} ${attractions.join(" ")}`.toLowerCase();
  if (text.includes("temple") || text.includes("bihari") || text.includes("ghat") || text.includes("shrine") || text.includes("religious") || text.includes("mandir")) return "🛕";
  if (text.includes("fort") || text.includes("palace") || text.includes("castle") || text.includes("tomb") || text.includes("mahal") || text.includes("museum")) return "🏰";
  if (text.includes("beach") || text.includes("lake") || text.includes("waterfall") || text.includes("river") || text.includes("garden") || text.includes("nature") || text.includes("backwaters")) return "🌴";
  if (text.includes("bazaar") || text.includes("market") || text.includes("shopping") || text.includes("mall") || text.includes("craft")) return "🛍️";
  if (text.includes("arrival") || text.includes("flight") || text.includes("train") || text.includes("check-in") || text.includes("welcome")) return "✈️";
  if (text.includes("departure") || text.includes("souvenir") || text.includes("pack") || text.includes("bye")) return "🛫";
  return "📍";
}

function DayCard({ day, isExpanded, onToggle }: { day: ItineraryDay; isExpanded: boolean; onToggle: () => void }) {
  const theme = DAY_THEMES[(day.day - 1) % DAY_THEMES.length];
  const emoji = getDayEmoji(day.title, day.summary, day.attractions);

  return (
    <div className={`rounded-2xl border ${theme.bg} transition-all duration-200 overflow-hidden shadow-xs`}>
      {/* ── Collapsible Header (Always Visible) ── */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none hover:opacity-90 transition-opacity"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <span className="text-2xl flex-shrink-0">{emoji}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${theme.badge}`}>
                Day {day.day}
              </span>
              <h3 className="font-heading font-700 text-base sm:text-lg text-[var(--color-text)] truncate">
                {day.title}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[var(--color-muted)] truncate font-medium">
              {day.summary}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-semibold text-[var(--color-muted)] hidden sm:inline">
            {isExpanded ? "Collapse" : "Expand"}
          </span>
          <div className="w-8 h-8 rounded-full bg-white/80 border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)] shadow-xs">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* ── Expanded Content ── */}
      {isExpanded && (
        <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-1 space-y-4 border-t border-black/5 bg-white/60">
          {/* Main 2-Column Grid: Attractions & Food */}
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            {/* Column 1: Main Attractions & Hidden Gem */}
            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] mb-2 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[var(--color-teal-dark)]" />
                  Top Attractions
                </p>
                <ul className="space-y-1.5 text-sm text-[var(--color-text)] font-medium">
                  {day.attractions.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[var(--color-coral)] mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 💎 HIDDEN GEM CALLOUT BADGE */}
              {day.hidden_gem && (
                <div className={`p-3 rounded-xl border ${theme.gemBorder} shadow-xs space-y-1`}>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                    <Gem className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    <span>💎 Hidden Gem</span>
                  </div>
                  <p className="text-xs font-semibold text-[var(--color-text)] leading-snug">
                    {day.hidden_gem}
                  </p>
                </div>
              )}
            </div>

            {/* Column 2: Restaurant Picks */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] mb-2 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-[var(--color-coral)]" />
                Restaurant &amp; Food Picks
              </p>
              <ul className="space-y-1.5 text-sm text-[var(--color-text)] font-medium">
                {day.restaurants.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[var(--color-teal)] mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Combined Trip Details Bar */}
          <div className="rounded-xl bg-white border border-[var(--color-border-mid)] p-3.5 space-y-2 text-xs">
            {/* Route & Weather row */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-2 text-[var(--color-text)]">
                <Navigation className="w-4 h-4 text-[var(--color-teal-dark)] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[var(--color-muted)] uppercase tracking-wider text-[10px] block">Route Suggestion</span>
                  <span>{day.route_suggestion}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-[var(--color-text)]">
                <SunMedium className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[var(--color-muted)] uppercase tracking-wider text-[10px] block">Weather Note</span>
                  <span>{day.weather_note}</span>
                </div>
              </div>
            </div>

            {/* Packing & Note row */}
            <div className="pt-2 border-t border-[var(--color-border)] grid sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-2 text-[var(--color-text)]">
                <Backpack className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[var(--color-muted)] uppercase tracking-wider text-[10px] block">Pack</span>
                  <span>{day.packing.join(" · ")}</span>
                </div>
              </div>

              {day.notes && (
                <div className="flex items-start gap-2 text-[var(--color-text)]">
                  <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[var(--color-muted)] uppercase tracking-wider text-[10px] block">Pro Tip</span>
                    <span>{day.notes}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function mergeItinerary(existing: ItineraryDay[], update: ItineraryDay[]) {
  if (!existing || existing.length === 0) return update;
  const map = new Map(update.map((day) => [day.day, day]));
  return existing.map((day) => map.get(day.day) ?? day).concat(update.filter((day) => day.day > existing.length));
}

export default function ItineraryGenerator() {
  const { journey, setTripInputs } = useUserJourney();
  const { data: session } = useSession();
  const [destination, setDestination] = useState(journey.selectedDestination || "");
  const [duration, setDuration] = useState<number>(journey.duration || 5);
  const [startDate, setStartDate] = useState("");
  const [groupSize, setGroupSize] = useState<number>(journey.groupSize || 2);
  const [budget, setBudget] = useState<number | "">(journey.budget || "");
  const [accommodation, setAccommodation] = useState(journey.accommodation || "");
  const [transport, setTransport] = useState(journey.transport || "");
  const [costPrediction, setCostPrediction] = useState<PredictResponse | null>(journey.tripCost);
  const [itinerary, setItinerary] = useState<ItineraryDay[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [followupLoading, setFollowupLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followup, setFollowup] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [updatedDays, setUpdatedDays] = useState<number[] | null>(null);
  const [generatedBy, setGeneratedBy] = useState<"gemini" | "groq" | "mock" | null>(null);

  // Expanded days state: set Day 1 expanded by default
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({ 1: true });

  // Save trip
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [savedTripId, setSavedTripId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function toggleDay(dayNum: number) {
    setExpandedDays((prev) => ({ ...prev, [dayNum]: !prev[dayNum] }));
  }

  function expandAll() {
    if (!itinerary) return;
    const all: Record<number, boolean> = {};
    itinerary.forEach((d) => (all[d.day] = true));
    setExpandedDays(all);
  }

  function collapseAll() {
    setExpandedDays({});
  }

  async function fetchCostPrediction(payload: TripRequest) {
    try {
      const response = await fetch("/api/predict-cost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) return null;
      return (await response.json()) as PredictResponse;
    } catch {
      return null;
    }
  }

  const canGenerate = Boolean(destination.trim() && duration > 0 && groupSize > 0);

  async function handleGenerate() {
    setError(null);
    setInfo(null);
    setUpdatedDays(null);
    setLoading(true);
    try {
      const costPayload: TripRequest = {
        destination,
        duration,
        accommodation_type: accommodation || undefined,
        transportation_type: transport || undefined,
        budget: typeof budget === "number" ? budget : undefined,
        group_size: groupSize,
      };
      const costResult = await fetchCostPrediction(costPayload);

      if (costResult) {
        setCostPrediction(costResult);
      }

      const payload: ItineraryRequest = {
        destination,
        duration,
        start_date: startDate || undefined,
        end_date: startDate ? new Date(new Date(startDate).getTime() + (duration - 1) * 86400000).toISOString().slice(0, 10) : undefined,
        group_size: groupSize,
        budget: typeof budget === "number" ? budget : undefined,
        accommodation_type: accommodation || undefined,
        transportation_type: transport || undefined,
        cost_summary: costResult
          ? `Predicted cost ₹${costResult.predicted_cost.toLocaleString()} with ${costResult.suggestions.length} optimization suggestions.`
          : undefined,
        budget_advice: costResult ? costResult.suggestions.map((s) => `${s.field}: ${s.suggested_value}`).join("; ") : undefined,
      };

      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as ItineraryResponse & { error?: string };
      if (!response.ok || data.error) {
        throw new Error(data.error ?? "Itinerary generation failed");
      }

      setItinerary(data.itinerary);
      setGeneratedBy(data.generated_by ?? null);
      setUpdatedDays(data.partial_update ? data.itinerary.map((item) => item.day) : null);

      // Expand Day 1 by default
      const defaultExpanded: Record<number, boolean> = { 1: true };
      setExpandedDays(defaultExpanded);

      // Carry trip details forward to Step 3
      setTripInputs({
        selectedDestination: destination,
        duration,
        accommodation,
        transport,
        groupSize,
        budget: typeof budget === "number" ? budget : "",
      });

      // ONLY show info banner if generated_by is genuinely "mock"
      if (data.generated_by === "mock") {
        setInfo("Fallback mock itinerary used because Gemini and Groq were unavailable or returned invalid output.");
      } else {
        setInfo(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error while generating itinerary.";
      setError(message);
    } finally {
      setLoading(false);
    }
    setSaveStatus("idle");
    setSavedTripId(null);
    setSaveError(null);
  }

  // Save trip handler
  async function handleSaveTrip() {
    if (!session) {
      setShowAuthModal(true);
      return;
    }
    if (!itinerary) return;
    setSaveStatus("saving");
    setSaveError(null);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          startDate: startDate || null,
          endDate: startDate
            ? new Date(new Date(startDate).getTime() + (duration - 1) * 86400000).toISOString().slice(0, 10)
            : null,
          duration,
          groupSize,
          costPrediction: costPrediction ?? null,
          itinerary,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save trip.");
      setSaveStatus("saved");
      setSavedTripId(data.tripId ?? null);
    } catch (err) {
      setSaveStatus("error");
      setSaveError(err instanceof Error ? err.message : "Could not save trip.");
    }
  }

  async function handleFollowup() {
    if (!itinerary || !followup.trim()) return;
    setFollowupLoading(true);
    setError(null);
    setInfo(null);
    try {
      const payload: ItineraryRequest = {
        destination,
        duration,
        start_date: startDate || undefined,
        end_date: startDate ? new Date(new Date(startDate).getTime() + (duration - 1) * 86400000).toISOString().slice(0, 10) : undefined,
        group_size: groupSize,
        budget: typeof budget === "number" ? budget : undefined,
        accommodation_type: accommodation || undefined,
        transportation_type: transport || undefined,
        cost_summary: costPrediction
          ? `Predicted cost ₹${costPrediction.predicted_cost.toLocaleString()} with ${costPrediction.suggestions.length} suggestions.`
          : undefined,
        budget_advice: costPrediction ? costPrediction.suggestions.map((s) => `${s.field}: ${s.suggested_value}`).join("; ") : undefined,
        followup: followup.trim(),
        existing_itinerary: itinerary,
      };

      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as ItineraryResponse & { error?: string };
      if (!response.ok || data.error) {
        throw new Error(data.error ?? "Follow-up generation failed");
      }
      setItinerary((prev) => (prev ? mergeItinerary(prev, data.itinerary) : data.itinerary));
      setGeneratedBy(data.generated_by ?? generatedBy);
      setUpdatedDays(data.itinerary.map((item) => item.day));
      setFollowup("");

      if (data.generated_by === "mock") {
        setInfo("Fallback mock itinerary used for the follow-up because Gemini and Groq were unavailable.");
      } else {
        setInfo(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error while updating itinerary.";
      setError(message);
    } finally {
      setFollowupLoading(false);
    }
  }

  return (
    <>
      {/* ── Main Container: Full Width Balanced Layout ── */}
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── Top Section: Trip Parameters Form Card ── */}
        <div className="card p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl coral-gradient flex items-center justify-center text-white shadow-coral text-2xl flex-shrink-0">
              <MapPin />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-muted)] mb-1">AI Itinerary Builder</p>
              <h2 className="font-heading text-2xl sm:text-3xl text-[var(--color-text)]">Create Your Custom Day-by-Day Plan</h2>
              <p className="text-sm text-[var(--color-muted)] mt-1 font-medium">
                Enter your trip preferences below. Generates specific attractions, hidden gems, food spots, and day-by-day routes.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-semibold text-[var(--color-text)]">
              Destination *
              <DestinationAutocomplete
                id="itinerary-destination"
                value={destination}
                onChange={setDestination}
                placeholder="Vrindavan, Jaipur, Goa, Manali..."
                showIcon={false}
                size="md"
              />
            </label>
            <label className="space-y-1.5 text-sm font-semibold text-[var(--color-text)]">
              Start Date
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="input-base font-medium"
              />
            </label>
          </div>

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            <label className="space-y-1.5 text-sm font-semibold text-[var(--color-text)]">
              Duration (days)
              <input
                type="number"
                min={1}
                max={21}
                value={duration}
                onChange={(event) => setDuration(Number(event.target.value))}
                className="input-base font-medium"
              />
            </label>
            <label className="space-y-1.5 text-sm font-semibold text-[var(--color-text)]">
              Group Size
              <input
                type="number"
                min={1}
                max={20}
                value={groupSize}
                onChange={(event) => setGroupSize(Number(event.target.value))}
                className="input-base font-medium"
              />
            </label>
            <label className="space-y-1.5 text-sm font-semibold text-[var(--color-text)]">
              Budget (₹)
              <input
                type="number"
                min={0}
                value={budget}
                onChange={(event) => setBudget(event.target.value === "" ? "" : Number(event.target.value))}
                placeholder="Optional"
                className="input-base font-medium"
              />
            </label>
            <label className="space-y-1.5 text-sm font-semibold text-[var(--color-text)]">
              Stay Type
              <select
                value={accommodation}
                onChange={(e) => setAccommodation(e.target.value)}
                className="input-base font-medium"
              >
                <option value="">Flexible</option>
                {ACCOMMODATION_TYPES.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </label>
          </div>

          {/* CTA Row */}
          <div className="pt-2 flex items-center justify-between flex-wrap gap-4 border-t border-[var(--color-border)]">
            <button
              id="generate-itinerary-btn"
              type="button"
              disabled={!canGenerate || loading}
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-white btn-3d-primary btn-shimmer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Generate Custom AI Itinerary →
            </button>

            <button
              type="button"
              onClick={() => {
                setDestination("");
                setDuration(5);
                setStartDate("");
                setGroupSize(2);
                setBudget("");
                setAccommodation("");
                setTransport("");
                setItinerary(null);
                setCostPrediction(null);
                setInfo(null);
                setError(null);
              }}
              className="text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              Reset Form
            </button>
          </div>
        </div>

        {/* ── Weather Widget (If Destination Entered) ── */}
        {destination.trim().length >= 2 && (
          <WeatherWidget destination={destination} startDate={startDate || undefined} />
        )}

        {/* ── Info / Warning Banners ── */}
        {info && generatedBy === "mock" && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-4 text-xs sm:text-sm text-amber-800 dark:text-amber-200 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
            <div>
              <span className="font-bold block">Notice</span>
              <span>{info}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-300 bg-rose-50 dark:bg-rose-950/30 p-4 text-sm text-rose-800 dark:text-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
            <div>
              <span className="font-bold block">Error</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* ── Main Generated Itinerary Display Section ── */}
        {loading ? (
          <LoadingStateCard message={`Crafting AI Day-by-Day Itinerary for ${destination || "your trip"}...`} />
        ) : itinerary ? (
          <div className="space-y-6">

            {/* Header Toolbar */}
            <div className="card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">Verified Plan</span>
                  {generatedBy && (
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      generatedBy === "mock" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      Generated via {generatedBy.toUpperCase()} LLM
                    </span>
                  )}
                </div>
                <h3 className="font-heading font-800 text-2xl sm:text-3xl text-[var(--color-text)]">
                  {destination} · {duration} Days
                </h3>
              </div>

              {/* Expand / Collapse All Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={expandAll}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[var(--color-border-mid)] text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors btn-3d-secondary"
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[var(--color-border-mid)] text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors btn-3d-secondary"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Cost Prediction Banner inside Itinerary view */}
            {costPrediction && (
              <div className="card p-5 bg-[var(--color-surface-warm)] border border-[var(--color-border-mid)]">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl coral-gradient flex items-center justify-center text-white shadow-xs">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">Estimated Trip Cost</p>
                      <p className="text-lg font-bold coral-text">₹{costPrediction.predicted_cost.toLocaleString()}</p>
                    </div>
                  </div>
                  {costPrediction.suggestions.length > 0 && (
                    <div className="text-xs text-[var(--color-muted)] font-medium">
                      💡 {costPrediction.suggestions[0].field}: {costPrediction.suggestions[0].original_value} → {costPrediction.suggestions[0].suggested_value}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Day Cards List */}
            <div className="space-y-4">
              {itinerary.map((day) => (
                <DayCard
                  key={day.day}
                  day={day}
                  isExpanded={Boolean(expandedDays[day.day])}
                  onToggle={() => toggleDay(day.day)}
                />
              ))}
            </div>

            {/* Quick Follow-up Box */}
            <div className="card p-6 space-y-4">
              <div>
                <h4 className="font-heading font-700 text-lg text-[var(--color-text)] mb-1">
                  ✏️ Refine Itinerary with AI
                </h4>
                <p className="text-xs text-[var(--color-muted)] font-medium">
                  Need changes? Type a quick instruction below (e.g. &ldquo;Make day 2 more relaxed&rdquo; or &ldquo;Add more local food places&rdquo;).
                </p>
              </div>

              <div className="relative">
                <textarea
                  value={followup}
                  onChange={(event) => setFollowup(event.target.value)}
                  rows={3}
                  placeholder="e.g. Swap day 1 evening activity with a sunset boat ride..."
                  className="w-full p-4 rounded-2xl border border-[var(--color-border-mid)] bg-white text-sm font-medium text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)]/30 focus:border-[var(--color-coral)] transition-all resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={!followup.trim() || followupLoading}
                  onClick={handleFollowup}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white btn-3d-primary disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {followupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                  Apply AI Update →
                </button>
                {followup && (
                  <button
                    type="button"
                    onClick={() => setFollowup("")}
                    className="text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {updatedDays && (
                <div className="rounded-xl border border-teal-300 bg-teal-50 px-4 py-2.5 text-xs font-semibold text-teal-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Updated days: {updatedDays.join(", ")}</span>
                </div>
              )}
            </div>

            {/* Save Trip CTA */}
            <div className="card p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-teal-500/5 to-coral-500/5 border border-[var(--color-border-mid)]">
              <div>
                <h4 className="font-heading font-700 text-base text-[var(--color-text)] mb-0.5">
                  💾 Save This Trip
                </h4>
                <p className="text-xs text-[var(--color-muted)] font-medium">
                  {saveStatus === "saved"
                    ? "Trip saved successfully! View it anytime in My Trips."
                    : session
                    ? "Save this itinerary to your account for future reference."
                    : "💡 Sign in to save this itinerary"}
                </p>
              </div>

              <button
                id="save-trip-btn"
                type="button"
                disabled={saveStatus === "saving" || saveStatus === "saved"}
                onClick={handleSaveTrip}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold transition-all shadow-xs ${
                  saveStatus === "saved"
                    ? "bg-emerald-600 text-white cursor-default"
                    : "btn-3d-primary text-white"
                }`}
              >
                {saveStatus === "saving" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saveStatus === "saved" ? (
                  <BookmarkCheck className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {saveStatus === "saved" ? "Saved to My Trips!" : "Save Trip"}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
          triggerMessage="Sign in to save this itinerary to your account"
        />
      )}
    </>
  );
}
