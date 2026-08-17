"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MapPin, Sparkles, Loader2, DollarSign, MessageSquare,
  AlertTriangle, CheckCircle2, BookmarkCheck, ChevronDown, ChevronUp,
  Compass, Utensils, SunMedium, Navigation, Backpack, Lightbulb,
  Gem, ArrowLeft,
} from "lucide-react";
import type { ItineraryDay, ItineraryRequest, ItineraryResponse, PredictResponse } from "@/types/api";
import { motion, LoadingStateCard } from "@/components/motion";
import { useUserJourney } from "@/context/UserJourneyContext";
import { useSession } from "next-auth/react";
import AuthModal from "@/components/AuthModal";
import WeatherWidget from "@/components/WeatherWidget";
import { ITINERARY_SESSION_KEY, StoredItineraryResult } from "@/components/ItineraryForm";

// ── Day themes ────────────────────────────────────────────────────────────────
const DAY_THEMES = [
  { bg: "bg-teal-50/70 border-teal-200/80 hover:border-teal-300",     badge: "bg-teal-600 text-white shadow-xs",    accent: "text-teal-700",   gemBorder: "border-teal-300 bg-teal-100/50" },
  { bg: "bg-indigo-50/70 border-indigo-200/80 hover:border-indigo-300", badge: "bg-indigo-600 text-white shadow-xs",  accent: "text-indigo-700", gemBorder: "border-indigo-300 bg-indigo-100/50" },
  { bg: "bg-rose-50/70 border-rose-200/80 hover:border-rose-300",      badge: "bg-rose-600 text-white shadow-xs",    accent: "text-rose-700",   gemBorder: "border-rose-300 bg-rose-100/50" },
  { bg: "bg-amber-50/70 border-amber-200/80 hover:border-amber-300",   badge: "bg-amber-600 text-white shadow-xs",   accent: "text-amber-700",  gemBorder: "border-amber-300 bg-amber-100/50" },
  { bg: "bg-emerald-50/70 border-emerald-200/80 hover:border-emerald-300", badge: "bg-emerald-600 text-white shadow-xs", accent: "text-emerald-700", gemBorder: "border-emerald-300 bg-emerald-100/50" },
];

function getDayEmoji(title: string, summary: string, attractions: string[]): string {
  const text = `${title} ${summary} ${attractions.join(" ")}`.toLowerCase();
  if (text.includes("temple") || text.includes("bihari") || text.includes("ghat") || text.includes("shrine") || text.includes("mandir")) return "🛕";
  if (text.includes("fort") || text.includes("palace") || text.includes("castle") || text.includes("tomb") || text.includes("mahal") || text.includes("museum")) return "🏰";
  if (text.includes("beach") || text.includes("lake") || text.includes("waterfall") || text.includes("river") || text.includes("garden") || text.includes("backwaters")) return "🌴";
  if (text.includes("bazaar") || text.includes("market") || text.includes("shopping")) return "🛍️";
  if (text.includes("arrival") || text.includes("flight") || text.includes("check-in") || text.includes("welcome")) return "✈️";
  if (text.includes("departure") || text.includes("souvenir") || text.includes("pack")) return "🛫";
  return "📍";
}

// ── DayCard (same design as before) ─────────────────────────────────────────
function DayCard({ day, isExpanded, onToggle, isUpdated }: {
  day: ItineraryDay; isExpanded: boolean; onToggle: () => void; isUpdated?: boolean;
}) {
  const theme = DAY_THEMES[(day.day - 1) % DAY_THEMES.length];
  const emoji = getDayEmoji(day.title, day.summary, day.attractions);

  return (
    <div className={`rounded-2xl border ${theme.bg} transition-all duration-200 overflow-hidden shadow-xs ${isUpdated ? "ring-2 ring-[var(--color-teal)] ring-offset-1" : ""}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none hover:opacity-90 transition-opacity"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <span className="text-2xl flex-shrink-0">{emoji}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${theme.badge}`}>Day {day.day}</span>
              {isUpdated && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">✨ Updated</span>}
              <h3 className="font-heading font-700 text-base sm:text-lg text-[var(--color-text)] truncate">{day.title}</h3>
            </div>
            <p className="text-xs sm:text-sm text-[var(--color-muted)] truncate font-medium">{day.summary}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-semibold text-[var(--color-muted)] hidden sm:inline">{isExpanded ? "Collapse" : "Expand"}</span>
          <div className="w-8 h-8 rounded-full bg-white/80 border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)] shadow-xs">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-1 space-y-4 border-t border-black/5 bg-white/60">
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] mb-2 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[var(--color-teal-dark)]" /> Top Attractions
                </p>
                <ul className="space-y-1.5 text-sm text-[var(--color-text)] font-medium">
                  {day.attractions.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[var(--color-coral)] mt-0.5">•</span><span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {day.hidden_gem && (
                <div className={`p-3 rounded-xl border ${theme.gemBorder} shadow-xs space-y-1`}>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                    <Gem className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    <span>💎 Hidden Gem</span>
                  </div>
                  <p className="text-xs font-semibold text-[var(--color-text)] leading-snug">{day.hidden_gem}</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] mb-2 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-[var(--color-coral)]" /> Restaurant &amp; Food Picks
              </p>
              <ul className="space-y-1.5 text-sm text-[var(--color-text)] font-medium">
                {day.restaurants.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[var(--color-teal)] mt-0.5">•</span><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-[var(--color-border-mid)] p-3.5 space-y-2 text-xs">
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

function mergeItinerary(existing: ItineraryDay[], update: ItineraryDay[]): ItineraryDay[] {
  if (!existing || existing.length === 0) return update;
  const map = new Map(update.map((d) => [d.day, d]));
  return existing
    .map((d) => map.get(d.day) ?? d)
    .concat(update.filter((d) => d.day > existing.length));
}

// ── Main Results Component ────────────────────────────────────────────────────
export default function ItineraryResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTripInputs } = useUserJourney();
  const { data: session } = useSession();

  // Load from sessionStorage
  const [stored, setStored] = useState<StoredItineraryResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(ITINERARY_SESSION_KEY);
      if (!raw) { setNotFound(true); return; }
      const parsed: StoredItineraryResult = JSON.parse(raw);
      // Validate destination matches query param (safety check)
      const qDest = searchParams.get("destination") ?? "";
      if (qDest && parsed.destination.toLowerCase() !== qDest.toLowerCase()) {
        // Mismatch — might be stale, still show but don't block
      }
      setStored(parsed);
    } catch {
      setNotFound(true);
    }
  }, [searchParams]);

  // Local mutable state on top of stored
  const [itinerary,     setItinerary]     = useState<ItineraryDay[] | null>(null);
  const [costPrediction, setCostPrediction] = useState<PredictResponse | null>(null);
  const [generatedBy,   setGeneratedBy]   = useState<"gemini" | "groq" | "mock" | null>(null);
  const [destination,   setDestination_]  = useState("");
  const [duration,      setDuration_]     = useState(5);
  const [startDate,     setStartDate_]    = useState("");
  const [groupSize,     setGroupSize_]    = useState(2);
  const [budget,        setBudget_]       = useState<number | "">("");
  const [accommodation, setAccommodation_]= useState("");
  const [transport,     setTransport_]    = useState("");

  // Populate local state once stored is loaded
  useEffect(() => {
    if (!stored) return;
    setItinerary(stored.itinerary);
    setCostPrediction(stored.costPrediction);
    setGeneratedBy(stored.generated_by);
    setDestination_(stored.destination);
    setDuration_(stored.duration);
    setStartDate_(stored.startDate);
    setGroupSize_(stored.groupSize);
    setBudget_(stored.budget);
    setAccommodation_(stored.accommodation);
    setTransport_(stored.transport);
  }, [stored]);

  // Expand/collapse
  const [expandedDays,  setExpandedDays]  = useState<Record<number, boolean>>({ 1: true });
  const [updatedDays,   setUpdatedDays]   = useState<number[] | null>(null);

  // Followup
  const [followup,        setFollowup]        = useState("");
  const [followupLoading, setFollowupLoading] = useState(false);
  const [followupError,   setFollowupError]   = useState<string | null>(null);
  const [info,            setInfo]            = useState<string | null>(null);

  // Save
  const [saveStatus,  setSaveStatus]  = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError,   setSaveError]   = useState<string | null>(null);
  const [savedTripId, setSavedTripId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  function toggleDay(n: number) { setExpandedDays((p) => ({ ...p, [n]: !p[n] })); }
  function expandAll()  { if (itinerary) { const a: Record<number,boolean> = {}; itinerary.forEach((d) => (a[d.day] = true)); setExpandedDays(a); } }
  function collapseAll(){ setExpandedDays({}); }

  async function handleFollowup() {
    if (!itinerary || !followup.trim()) return;
    setFollowupLoading(true);
    setFollowupError(null);
    setInfo(null);
    try {
      const endDate = startDate
        ? new Date(new Date(startDate).getTime() + (duration - 1) * 86400000).toISOString().slice(0, 10)
        : undefined;
      const payload: ItineraryRequest = {
        destination, duration,
        start_date: startDate || undefined,
        end_date: endDate,
        group_size: groupSize,
        budget: typeof budget === "number" ? budget : undefined,
        accommodation_type: accommodation || undefined,
        transportation_type: transport || undefined,
        cost_summary: costPrediction
          ? `Predicted cost ₹${costPrediction.predicted_cost.toLocaleString()} with ${costPrediction.suggestions.length} suggestions.`
          : undefined,
        budget_advice: costPrediction
          ? costPrediction.suggestions.map((s) => `${s.field}: ${s.suggested_value}`).join("; ")
          : undefined,
        followup: followup.trim(),
        existing_itinerary: itinerary,
      };

      const res  = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as ItineraryResponse & { error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Follow-up generation failed");

      const merged = mergeItinerary(itinerary, data.itinerary);
      setItinerary(merged);
      setGeneratedBy(data.generated_by ?? generatedBy);
      setUpdatedDays(data.itinerary.map((d) => d.day));
      setFollowup("");

      // Persist updated itinerary back to sessionStorage
      if (stored) {
        const updated: StoredItineraryResult = { ...stored, itinerary: merged, generated_by: data.generated_by ?? stored.generated_by };
        sessionStorage.setItem(ITINERARY_SESSION_KEY, JSON.stringify(updated));
      }

      if (data.generated_by === "mock") setInfo("Fallback mock itinerary used for the follow-up.");
      else setInfo(null);
    } catch (err) {
      setFollowupError(err instanceof Error ? err.message : "Unknown error while updating itinerary.");
    } finally {
      setFollowupLoading(false);
    }
  }

  async function handleSaveTrip() {
    if (!session) { setShowAuthModal(true); return; }
    if (!itinerary) return;
    setSaveStatus("saving");
    setSaveError(null);
    try {
      const endDate = startDate
        ? new Date(new Date(startDate).getTime() + (duration - 1) * 86400000).toISOString().slice(0, 10)
        : null;
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, startDate: startDate || null, endDate, duration, groupSize, costPrediction: costPrediction ?? null, itinerary }),
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

  // ── Not found state ────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <div className="text-5xl mb-4">🗺️</div>
        <h2 className="font-heading text-2xl text-[var(--color-text)] mb-2">No Itinerary Found</h2>
        <p className="text-[var(--color-muted)] text-sm mb-6">
          It looks like there's no itinerary data here. Please go back and generate one first.
        </p>
        <button
          type="button"
          onClick={() => router.push("/itinerary")}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white btn-3d-primary"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Form
        </button>
      </div>
    );
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (!itinerary) {
    return <LoadingStateCard message="Loading your itinerary…" />;
  }

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── Back button ── */}
        <div>
          <button
            type="button"
            onClick={() => router.push("/itinerary")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Edit Trip Details
          </button>
        </div>

        {/* ── Weather Widget ── */}
        {destination.trim().length >= 2 && (
          <WeatherWidget destination={destination} startDate={startDate || undefined} />
        )}

        {/* ── Info / Warning Banners ── */}
        {info && generatedBy === "mock" && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs sm:text-sm text-amber-800 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
            <div><span className="font-bold block">Notice</span><span>{info}</span></div>
          </div>
        )}
        {followupError && (
          <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
            <div><span className="font-bold block">Error</span><span>{followupError}</span></div>
          </div>
        )}

        {/* ── Header Toolbar ── */}
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
          <div className="flex items-center gap-2 flex-wrap">
            <button type="button" onClick={expandAll}  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[var(--color-border-mid)] text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors btn-3d-secondary">Expand All</button>
            <button type="button" onClick={collapseAll} className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[var(--color-border-mid)] text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors btn-3d-secondary">Collapse All</button>
          </div>
        </div>

        {/* ── Cost Prediction Banner ── */}
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

        {/* ── Day Cards ── */}
        <div className="space-y-4">
          {itinerary.map((day) => (
            <DayCard
              key={day.day}
              day={day}
              isExpanded={Boolean(expandedDays[day.day])}
              onToggle={() => toggleDay(day.day)}
              isUpdated={Boolean(updatedDays?.includes(day.day))}
            />
          ))}
        </div>

        {/* ── Refine with AI ── */}
        <div className="card p-6 space-y-4">
          <div>
            <h4 className="font-heading font-700 text-lg text-[var(--color-text)] mb-1">✏️ Refine Itinerary with AI</h4>
            <p className="text-xs text-[var(--color-muted)] font-medium">
              Need changes? Type a quick instruction (e.g. &ldquo;Make day 2 more relaxed&rdquo; or &ldquo;Add more local food places&rdquo;).
            </p>
          </div>
          <div className="relative">
            <textarea
              value={followup}
              onChange={(e) => setFollowup(e.target.value)}
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
              <button type="button" onClick={() => setFollowup("")} className="text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">Clear</button>
            )}
          </div>
          {updatedDays && (
            <div className="rounded-xl border border-teal-300 bg-teal-50 px-4 py-2.5 text-xs font-semibold text-teal-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Updated days: {updatedDays.join(", ")}</span>
            </div>
          )}
        </div>

        {/* ── Save Trip ── */}
        <div className="card p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-teal-500/5 to-coral-500/5 border border-[var(--color-border-mid)]">
          <div>
            <h4 className="font-heading font-700 text-base text-[var(--color-text)] mb-0.5">💾 Save This Trip</h4>
            <p className="text-xs text-[var(--color-muted)] font-medium">
              {saveStatus === "saved"
                ? "Trip saved successfully! View it anytime in My Trips."
                : session
                ? "Save this itinerary to your account for future reference."
                : "💡 Sign in to save this itinerary"}
            </p>
            {saveError && <p className="text-xs text-rose-600 font-semibold mt-1">{saveError}</p>}
          </div>
          <button
            id="save-trip-btn"
            type="button"
            disabled={saveStatus === "saving" || saveStatus === "saved"}
            onClick={handleSaveTrip}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold transition-all shadow-xs ${
              saveStatus === "saved" ? "bg-emerald-600 text-white cursor-default" : "btn-3d-primary text-white"
            }`}
          >
            {saveStatus === "saving" ? <Loader2 className="w-4 h-4 animate-spin" /> : saveStatus === "saved" ? <BookmarkCheck className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            {saveStatus === "saved" ? "Saved to My Trips!" : "Save Trip"}
          </button>
        </div>

        {/* ── Continue to Cost Predictor CTA ── */}
        <div className="rounded-2xl border border-[var(--color-border-mid)] bg-[var(--color-surface-warm)] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] mb-0.5">Step 3 of 3</p>
            <h4 className="font-heading font-700 text-base text-[var(--color-text)]">Ready for detailed cost breakdown?</h4>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">Your trip details will auto-carry to the Cost Predictor.</p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/predict")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold text-white btn-3d-secondary whitespace-nowrap"
          >
            <DollarSign className="w-4 h-4" />
            Continue to Cost Predictor →
          </button>
        </div>

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
