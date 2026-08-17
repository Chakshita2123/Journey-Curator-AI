"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin, Sparkles, Loader2, AlertTriangle, DollarSign,
} from "lucide-react";
import type {
  ItineraryRequest, ItineraryResponse, TripRequest, PredictResponse,
} from "@/types/api";
import { motion } from "@/components/motion";
import { useUserJourney } from "@/context/UserJourneyContext";
import DestinationAutocomplete from "@/components/DestinationAutocomplete";

const ACCOMMODATION_TYPES = ["Hotel", "Resort", "Airbnb", "Hostel", "Villa", "Guesthouse"];
const TRANSPORT_TYPES     = ["Flight", "Train", "Bus", "Car rental", "Ferry", "Cruise"];

// Key used for sessionStorage — shared with ResultsPage
export const ITINERARY_SESSION_KEY = "journey_curator_itinerary_result_v1";

export interface StoredItineraryResult {
  itinerary:     ItineraryResponse["itinerary"];
  costPrediction: PredictResponse | null;
  generated_by:  "gemini" | "groq" | "mock" | null;
  destination:   string;
  duration:      number;
  startDate:     string;
  groupSize:     number;
  budget:        number | "";
  accommodation: string;
  transport:     string;
}

async function fetchCostPrediction(payload: TripRequest): Promise<PredictResponse | null> {
  try {
    const res = await fetch("/api/predict-cost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return (await res.json()) as PredictResponse;
  } catch {
    return null;
  }
}

export default function ItineraryForm() {
  const router = useRouter();
  const { journey, setTripInputs } = useUserJourney();

  const [destination, setDestination] = useState(journey.selectedDestination || "");
  const [duration,    setDuration]    = useState<number>(journey.duration || 5);
  const [startDate,   setStartDate]   = useState("");
  const [groupSize,   setGroupSize]   = useState<number>(journey.groupSize || 2);
  const [budget,      setBudget]      = useState<number | "">(journey.budget || "");
  const [accommodation, setAccommodation] = useState(journey.accommodation || "");
  const [transport,   setTransport]   = useState(journey.transport || "");

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  // Inline loading substep message
  const [loadMsg, setLoadMsg] = useState("");

  const canGenerate = Boolean(destination.trim() && duration > 0 && groupSize > 0);

  async function handleGenerate() {
    if (!canGenerate) return;
    setError(null);
    setLoading(true);
    setLoadMsg("Estimating trip cost…");

    try {
      // Step 1: Cost prediction (non-blocking — best effort)
      const costPayload: TripRequest = {
        destination,
        duration,
        accommodation_type: accommodation || undefined,
        transportation_type: transport || undefined,
        budget: typeof budget === "number" ? budget : undefined,
        group_size: groupSize,
      };
      const costResult = await fetchCostPrediction(costPayload);

      // Step 2: Generate itinerary
      setLoadMsg(`Crafting AI day-by-day plan for ${destination}…`);
      const endDate = startDate
        ? new Date(new Date(startDate).getTime() + (duration - 1) * 86400000)
            .toISOString()
            .slice(0, 10)
        : undefined;

      const payload: ItineraryRequest = {
        destination,
        duration,
        start_date: startDate || undefined,
        end_date: endDate,
        group_size: groupSize,
        budget: typeof budget === "number" ? budget : undefined,
        accommodation_type: accommodation || undefined,
        transportation_type: transport || undefined,
        cost_summary: costResult
          ? `Predicted cost ₹${costResult.predicted_cost.toLocaleString()} with ${costResult.suggestions.length} optimization suggestions.`
          : undefined,
        budget_advice: costResult
          ? costResult.suggestions.map((s) => `${s.field}: ${s.suggested_value}`).join("; ")
          : undefined,
      };

      const res = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as ItineraryResponse & { error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Itinerary generation failed");

      // Step 3: Persist to sessionStorage so Results page can read it
      const stored: StoredItineraryResult = {
        itinerary:     data.itinerary,
        costPrediction: costResult,
        generated_by:  data.generated_by ?? null,
        destination,
        duration,
        startDate,
        groupSize,
        budget,
        accommodation,
        transport,
      };
      sessionStorage.setItem(ITINERARY_SESSION_KEY, JSON.stringify(stored));

      // Also update shared journey context (for Cost Predictor Step 3)
      setTripInputs({
        selectedDestination: destination,
        duration,
        accommodation,
        transport,
        groupSize,
        budget: typeof budget === "number" ? budget : "",
      });

      // Step 4: Navigate to Results page
      router.push(`/itinerary/results?destination=${encodeURIComponent(destination)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error while generating itinerary.");
    } finally {
      setLoading(false);
      setLoadMsg("");
    }
  }

  function handleReset() {
    setDestination("");
    setDuration(5);
    setStartDate("");
    setGroupSize(2);
    setBudget("");
    setAccommodation("");
    setTransport("");
    setError(null);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-6 sm:p-10 space-y-8">
        {/* ── Header ── */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl coral-gradient flex items-center justify-center text-white shadow-coral flex-shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-muted)] mb-1">
              AI Itinerary Builder
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl text-[var(--color-text)] leading-tight">
              Create Your Custom Day-by-Day Plan
            </h2>
            <p className="text-sm text-[var(--color-muted)] mt-1.5 font-medium leading-relaxed">
              Enter your trip preferences. We'll generate specific attractions, hidden gems, food spots, and day-by-day routes.
            </p>
          </div>
        </div>

        {/* ── Form Fields ── */}
        <div className="space-y-6">
          {/* Row 1: Destination + Start Date */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--color-text)]" htmlFor="itinerary-destination">
                Destination <span className="text-[var(--color-coral)]">*</span>
              </label>
              <DestinationAutocomplete
                id="itinerary-destination"
                value={destination}
                onChange={setDestination}
                placeholder="Vrindavan, Jaipur, Goa, Manali..."
                showIcon={true}
                size="md"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--color-text)]" htmlFor="itinerary-start-date">
                Start Date
              </label>
              <input
                id="itinerary-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-base font-medium w-full"
              />
            </div>
          </div>

          {/* Row 2: Duration · Group Size · Budget · Stay Type */}
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--color-text)]" htmlFor="itinerary-duration">
                Duration (days)
              </label>
              <input
                id="itinerary-duration"
                type="number"
                min={1} max={21}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="input-base font-medium w-full"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--color-text)]" htmlFor="itinerary-group">
                Group Size
              </label>
              <input
                id="itinerary-group"
                type="number"
                min={1} max={20}
                value={groupSize}
                onChange={(e) => setGroupSize(Number(e.target.value))}
                className="input-base font-medium w-full"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--color-text)]" htmlFor="itinerary-budget">
                Budget (₹)
              </label>
              <input
                id="itinerary-budget"
                type="number"
                min={0}
                value={budget}
                onChange={(e) => setBudget(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Optional"
                className="input-base font-medium w-full"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--color-text)]" htmlFor="itinerary-stay">
                Stay Type
              </label>
              <select
                id="itinerary-stay"
                value={accommodation}
                onChange={(e) => setAccommodation(e.target.value)}
                className="input-base font-medium w-full"
              >
                <option value="">Flexible</option>
                {ACCOMMODATION_TYPES.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Transport (optional chips) */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-[var(--color-text)]">Transport (optional)</p>
            <div className="flex flex-wrap gap-2">
              {TRANSPORT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTransport(transport === t ? "" : t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all duration-150 ${
                    transport === t
                      ? "border-[var(--color-coral)] bg-[var(--color-coral-light)] text-[var(--color-coral)]"
                      : "border-[var(--color-border-mid)] text-[var(--color-muted)] bg-white hover:border-[var(--color-coral-mid)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
            <div>
              <span className="font-bold block">Error</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* ── CTA ── */}
        <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between gap-4 flex-wrap">
          <button
            id="generate-itinerary-btn"
            type="button"
            disabled={!canGenerate || loading}
            onClick={handleGenerate}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-bold text-white btn-3d-primary btn-shimmer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? <><Loader2 className="w-5 h-5 animate-spin" />{loadMsg || "Generating…"}</>
              : <><Sparkles className="w-5 h-5" />Generate Custom AI Itinerary →</>
            }
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            Reset Form
          </button>
        </div>

        {/* Loading progress hint */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[var(--color-teal-light)] bg-[var(--color-surface-warm)] p-4 text-sm flex items-center gap-3"
          >
            <DollarSign className="w-5 h-5 text-[var(--color-teal-dark)] flex-shrink-0 animate-pulse" />
            <div>
              <span className="font-semibold text-[var(--color-text)] block">{loadMsg}</span>
              <span className="text-xs text-[var(--color-muted)]">
                This may take 10–20 seconds while the AI crafts your personalised plan.
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
