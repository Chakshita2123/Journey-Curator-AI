"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Compass,
  MapPin,
  Sparkles,
  Loader2,
  Users,
  DollarSign,
  RefreshCcw,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import type {
  ItineraryDay,
  ItineraryRequest,
  ItineraryResponse,
  PredictResponse,
  PersonaResponse,
  RecommendDestinationsResponse,
  TripRequest,
} from "@/types/api";
import { motion, LoadingStateCard, TiltCard, ErrorStateCard } from "@/components/motion";
import { useUserJourney } from "@/context/UserJourneyContext";

const PERSONA_OPTIONS = [
  "Adventurer",
  "Relaxed Vacationer",
  "Culture & Food Explorer",
  "Budget Backpacker",
  "Luxury Wellness Seeker",
];

const ACCOMMODATION_TYPES = ["Hotel", "Resort", "Airbnb", "Hostel", "Villa", "Guesthouse"];
const TRANSPORT_TYPES = ["Flight", "Train", "Bus", "Car rental", "Ferry", "Cruise"];

const INITIAL_PERSONA_SCORES = {
  nature_vs_nightlife: 3,
  budget_vs_luxury: 3,
  activity_level: 3,
  food_preference: 3,
  travel_pace: 3,
  cultural_depth: 3,
};

function ScoreSlider({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4 text-sm font-medium text-[var(--color-text)]">
        <span>{label}</span>
        <span className="text-[var(--color-muted)]">{value}</span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[var(--color-coral)]"
      />
    </div>
  );
}

function DayCard({ day }: { day: ItineraryDay }) {
  return (
    <motion.article
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 24 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      whileHover={{ y: -3 }}
      className="card p-6 space-y-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-3xl teal-gradient flex items-center justify-center text-white shadow-teal text-lg font-bold">
          {day.day}
        </div>
        <div className="space-y-1">
          <h3 className="font-heading text-xl text-[var(--color-text)]">{day.title}</h3>
          <p className="text-sm text-[var(--color-muted)]">{day.summary}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)] mb-2 font-semibold">Top attractions</p>
          <ul className="list-disc list-inside text-sm text-[var(--color-text)] space-y-1">
            {day.attractions.map((item, index) => (
              <li key={`${day.day}-attraction-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)] mb-2 font-semibold">Restaurant picks</p>
          <ul className="list-disc list-inside text-sm text-[var(--color-text)] space-y-1">
            {day.restaurants.map((item, index) => (
              <li key={`${day.day}-restaurant-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl p-4 bg-[var(--color-surface-teal)]">
          <p className="text-[var(--color-muted)] text-xs uppercase tracking-[0.2em] mb-2 font-semibold">Route</p>
          <p className="text-sm text-[var(--color-text)]">{day.route_suggestion}</p>
        </div>
        <div className="rounded-3xl p-4 bg-[var(--color-surface-warm)]">
          <p className="text-[var(--color-muted)] text-xs uppercase tracking-[0.2em] mb-2 font-semibold">Weather note</p>
          <p className="text-sm text-[var(--color-text)]">{day.weather_note}</p>
        </div>
      </div>

      <div className="rounded-3xl p-4 bg-[var(--color-bg)] border border-[var(--color-border)]">
        <p className="text-[var(--color-muted)] text-xs uppercase tracking-[0.2em] mb-2 font-semibold">Packing checklist</p>
        <ul className="list-disc list-inside text-sm text-[var(--color-text)] space-y-1">
          {day.packing.map((item, index) => (
            <li key={`${day.day}-pack-${index}`}>{item}</li>
          ))}
        </ul>
      </div>

      {day.notes && (
        <div className="rounded-3xl p-4 bg-white border border-[var(--color-border)]">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)] mb-2 font-semibold">Pro tip</p>
          <p className="text-sm text-[var(--color-text)]">{day.notes}</p>
        </div>
      )}
    </motion.article>
  );
}

function formatDestinationList(recommendations: RecommendDestinationsResponse | null) {
  if (!recommendations || recommendations.recommendations.length === 0) return "No destination recommendations available.";
  return recommendations.recommendations.slice(0, 5).map((item) => `${item.place_name} (${item.city})`).join(" • ");
}

function mergeItinerary(existing: ItineraryDay[], update: ItineraryDay[]) {
  if (!existing || existing.length === 0) return update;
  const map = new Map(update.map((day) => [day.day, day]));
  return existing.map((day) => map.get(day.day) ?? day).concat(update.filter((day) => day.day > existing.length));
}

export default function ItineraryGenerator() {
  const { journey } = useUserJourney();
  const [destination, setDestination] = useState(journey.selectedDestination || "");
  const [duration, setDuration] = useState<number>(journey.duration || 5);
  const [startDate, setStartDate] = useState("");
  const [groupSize, setGroupSize] = useState<number>(journey.groupSize || 2);
  const [budget, setBudget] = useState<number | "">(journey.budget || "");
  const [accommodation, setAccommodation] = useState(journey.accommodation || "");
  const [transport, setTransport] = useState(journey.transport || "");
  const [personaOverride, setPersonaOverride] = useState(journey.persona?.persona || PERSONA_OPTIONS[0]);
  const [usePersonaQuiz, setUsePersonaQuiz] = useState(!journey.persona);
  const [personaScores, setPersonaScores] = useState(INITIAL_PERSONA_SCORES);
  const [predictedPersona, setPredictedPersona] = useState<PersonaResponse | null>(journey.persona);
  const [recommendations, setRecommendations] = useState<RecommendDestinationsResponse | null>(null);
  const [costPrediction, setCostPrediction] = useState<PredictResponse | null>(journey.tripCost);
  const [itinerary, setItinerary] = useState<ItineraryDay[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [followupLoading, setFollowupLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followup, setFollowup] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [updatedDays, setUpdatedDays] = useState<number[] | null>(null);
  const [generatedBy, setGeneratedBy] = useState<"gemini" | "groq" | "mock" | null>(null);

  const personaName = predictedPersona?.persona ?? personaOverride;
  const personaTitle = predictedPersona?.title ?? "";
  const personaDetails = predictedPersona?.description ?? "";

  const recommendedText = useMemo(() => formatDestinationList(recommendations), [recommendations]);

  useEffect(() => {
    if (!predictedPersona) return;
    const controller = new AbortController();
    const loadRecommendations = async () => {
      try {
        const response = await fetch("/api/recommend-destinations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ persona: predictedPersona.persona, top_k: 6 }),
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = (await response.json()) as RecommendDestinationsResponse;
        setRecommendations(data);
      } catch {
        // ignore silently when user changes persona quickly
      }
    };

    loadRecommendations();
    return () => controller.abort();
  }, [predictedPersona]);

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

  async function fetchPersonaPrediction() {
    try {
      const response = await fetch("/api/predict-persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(personaScores),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Persona prediction failed");
      }
      return (await response.json()) as PersonaResponse;
    } catch (err) {
      if (err instanceof Error) setError(err.message);
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
      const [costResult, personaResult] = await Promise.all([
        fetchCostPrediction(costPayload),
        usePersonaQuiz ? fetchPersonaPrediction() : Promise.resolve(null),
      ]);

      if (costResult) {
        setCostPrediction(costResult);
      } else {
        setInfo("Cost prediction is not available right now. Continuing with itinerary generation.");
      }

      if (personaResult) {
        setPredictedPersona(personaResult);
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
        persona: personaResult?.persona ?? personaOverride,
        persona_title: personaResult?.title,
        persona_description: personaResult?.description,
        recommended_destinations: recommendedText,
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
      if (data.generated_by === "mock") {
        setInfo("Fallback mock itinerary used because Gemini and Groq were unavailable or returned invalid output.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error while generating itinerary.";
      setError(message);
    } finally {
      setLoading(false);
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
        persona: personaName,
        persona_title: personaTitle,
        persona_description: personaDetails,
        recommended_destinations: recommendedText,
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
        setInfo("Your follow-up update has been merged into the existing itinerary.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error while updating itinerary.";
      setError(message);
    } finally {
      setFollowupLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_0.9fr]">
      <section className="space-y-6">
        <div className="card p-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-3xl coral-gradient flex items-center justify-center text-white shadow-coral text-2xl">
                <MapPin />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)] mb-1">Phase 5</p>
                <h2 className="font-heading text-3xl text-[var(--color-text)]">LLM-powered itinerary builder</h2>
                <p className="text-sm text-[var(--color-muted)] max-w-2xl mt-2">
                  Generate a full day-by-day travel plan using cost predictions, persona vibes, destination recommendations, and your raw trip details.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-[var(--color-text)]">
                Destination
                <input
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  placeholder="Goa, Kyoto, New York…"
                  className="input-base"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-[var(--color-text)]">
                Start date
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="input-base"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2 text-sm font-medium text-[var(--color-text)]">
                Duration (days)
                <input
                  type="number"
                  min={1}
                  max={21}
                  value={duration}
                  onChange={(event) => setDuration(Number(event.target.value))}
                  className="input-base"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-[var(--color-text)]">
                Group size
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={groupSize}
                  onChange={(event) => setGroupSize(Number(event.target.value))}
                  className="input-base"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-[var(--color-text)]">
                Budget (₹)
                <input
                  type="number"
                  min={0}
                  value={budget}
                  onChange={(event) => setBudget(event.target.value === "" ? "" : Number(event.target.value))}
                  placeholder="Optional"
                  className="input-base"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-[var(--color-text)]">
                Accommodation style
                <select
                  value={accommodation}
                  onChange={(event) => setAccommodation(event.target.value)}
                  className="input-base"
                >
                  <option value="">Flexible</option>
                  {ACCOMMODATION_TYPES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-[var(--color-text)]">
                Transportation
                <select
                  value={transport}
                  onChange={(event) => setTransport(event.target.value)}
                  className="input-base"
                >
                  <option value="">Flexible</option>
                  {TRANSPORT_TYPES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-col gap-3 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">Travel persona</p>
                  <p className="text-xs text-[var(--color-muted)]">Use a quick persona scorecard or pick a profile manually.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setUsePersonaQuiz((state) => !state)}
                  className="px-3 py-2 rounded-full text-sm font-semibold border border-[var(--color-border-mid)] hover:border-[var(--color-coral)] transition-colors"
                >
                  {usePersonaQuiz ? "Use manual selection" : "Use quiz scores"}
                </button>
              </div>

              {usePersonaQuiz ? (
                <div className="grid gap-4">
                  <ScoreSlider
                    label="Nature vs nightlife"
                    value={personaScores.nature_vs_nightlife}
                    onChange={(value) => setPersonaScores((prev) => ({ ...prev, nature_vs_nightlife: value }))}
                  />
                  <ScoreSlider
                    label="Budget vs luxury"
                    value={personaScores.budget_vs_luxury}
                    onChange={(value) => setPersonaScores((prev) => ({ ...prev, budget_vs_luxury: value }))}
                  />
                  <ScoreSlider
                    label="Activity level"
                    value={personaScores.activity_level}
                    onChange={(value) => setPersonaScores((prev) => ({ ...prev, activity_level: value }))}
                  />
                  <ScoreSlider
                    label="Food preference"
                    value={personaScores.food_preference}
                    onChange={(value) => setPersonaScores((prev) => ({ ...prev, food_preference: value }))}
                  />
                  <ScoreSlider
                    label="Travel pace"
                    value={personaScores.travel_pace}
                    onChange={(value) => setPersonaScores((prev) => ({ ...prev, travel_pace: value }))}
                  />
                  <ScoreSlider
                    label="Cultural depth"
                    value={personaScores.cultural_depth}
                    onChange={(value) => setPersonaScores((prev) => ({ ...prev, cultural_depth: value }))}
                  />
                </div>
              ) : (
                <label className="space-y-2 text-sm font-medium text-[var(--color-text)]">
                  Select persona
                  <select
                    value={personaOverride}
                    onChange={(event) => setPersonaOverride(event.target.value)}
                    className="input-base"
                  >
                    {PERSONA_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            {error && (
              <ErrorStateCard
                title="Itinerary Generation Error"
                message={error}
                onRetry={handleGenerate}
              />
            )}

            {info && (
              <div className="rounded-3xl border border-[var(--color-teal-light)] bg-[var(--color-teal-light)] p-4 text-sm text-[var(--color-teal-dark)]">
                {info}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row items-stretch sm:items-center">
              <button
                type="button"
                disabled={!canGenerate || loading}
                onClick={handleGenerate}
                className="flex-1 px-5 py-3 rounded-3xl text-sm font-semibold text-white btn-3d-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Generating itinerary…</span>
                ) : (
                  <span className="inline-flex items-center gap-2"><Sparkles className="w-4 h-4" /> Generate itinerary</span>
                )}
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
                  setPersonaOverride(PERSONA_OPTIONS[0]);
                  setPersonaScores(INITIAL_PERSONA_SCORES);
                  setPredictedPersona(null);
                  setRecommendations(null);
                  setCostPrediction(null);
                  setItinerary(null);
                  setError(null);
                  setInfo(null);
                  setUpdatedDays(null);
                }}
                className="flex-1 px-5 py-3 rounded-3xl text-sm font-semibold btn-3d-secondary"
              >
                Reset form
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.9fr_0.9fr]">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4 text-sm font-semibold text-[var(--color-text)]">
              <Compass className="w-5 h-5 text-[var(--color-coral)]" />
              <span>Persona & recommendations</span>
            </div>
            <div className="space-y-3 text-sm text-[var(--color-text)]">
              <p><span className="font-semibold">Persona:</span> {personaName}</p>
              {personaTitle && <p><span className="font-semibold">Profile:</span> {personaTitle}</p>}
              {personaDetails && <p className="text-[var(--color-muted)]">{personaDetails}</p>}
              <p><span className="font-semibold">Top destinations:</span></p>
              <p className="text-[var(--color-muted)]">{recommendedText}</p>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4 text-sm font-semibold text-[var(--color-text)]">
              <DollarSign className="w-5 h-5 text-[var(--color-teal)]" />
              <span>Budget input</span>
            </div>
            <div className="space-y-3 text-sm text-[var(--color-text)]">
              {costPrediction ? (
                <>
                  <p><span className="font-semibold">Predicted cost:</span> ₹{costPrediction.predicted_cost.toLocaleString()}</p>
                  <p><span className="font-semibold">Suggestions:</span></p>
                  <ul className="list-disc list-inside text-[var(--color-muted)] space-y-1">
                    {costPrediction.suggestions.map((suggestion, index) => (
                      <li key={`suggestion-${index}`}>
                        {suggestion.field}: change {suggestion.original_value} → {suggestion.suggested_value}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-[var(--color-muted)]">Generate an itinerary to see cost prediction and optimisation notes embedded in the prompt.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        {loading ? (
          <LoadingStateCard message="Crafting AI Day-by-Day Itinerary..." />
        ) : itinerary ? (
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-muted)]">Your itinerary</p>
                  <h3 className="font-heading text-2xl text-[var(--color-text)]">{destination || "Traveler"} · {duration} days</h3>
                </div>
                <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)]">
                  <span className="font-semibold">Persona:</span> {personaName}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-[var(--color-bg)] p-4 border border-[var(--color-border)]">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)] mb-2">Dates</p>
                  <p className="font-semibold text-[var(--color-text)]">{startDate || "Flexible"} → {startDate ? new Date(new Date(startDate).getTime() + (duration - 1) * 86400000).toISOString().slice(0, 10) : "TBD"}</p>
                </div>
                <div className="rounded-3xl bg-[var(--color-bg)] p-4 border border-[var(--color-border)]">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)] mb-2">Group</p>
                  <p className="font-semibold text-[var(--color-text)]">{groupSize} people</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3">
                <label className="block text-sm font-medium text-[var(--color-text)]">Quick follow-up</label>
                <textarea
                  value={followup}
                  onChange={(event) => setFollowup(event.target.value)}
                  rows={3}
                  placeholder="Example: Make day 2 more relaxed and add a local beach picnic instead of a museum tour."
                  className="input-base min-h-[110px] resize-none"
                />
                <div className="flex gap-3 flex-wrap">
                  <button
                    type="button"
                    disabled={!followup.trim() || followupLoading}
                    onClick={handleFollowup}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-3xl text-sm font-semibold text-white coral-gradient shadow-coral transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {followupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                    Apply follow-up
                  </button>
                  <button
                    type="button"
                    onClick={() => setFollowup("")}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-3xl text-sm font-semibold border border-[var(--color-border-mid)] bg-white text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-all duration-200"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {updatedDays && (
                <div className="mt-4 rounded-3xl border border-[var(--color-teal-light)] bg-[var(--color-teal-light)] px-4 py-3 text-sm text-[var(--color-teal-dark)]">
                  <CheckCircle2 className="inline-block w-4 h-4 mr-2" /> Updated day{updatedDays.length > 1 ? "s" : ""}: {updatedDays.join(", ")}
                </div>
              )}
              {generatedBy && (
                <div className="mt-4 rounded-3xl border border-[var(--color-border-mid)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-text)]">
                  Generated by: <span className="font-semibold">{generatedBy}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {itinerary.map((day) => (
                <DayCard key={`day-${day.day}`} day={day} />
              ))}
            </div>
          </div>
        ) : (
          <div className="card p-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full teal-gradient text-white shadow-teal">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-lg font-semibold text-[var(--color-text)]">Your itinerary will appear here.</p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">Enter your trip details and click Generate itinerary to see a curated day-by-day plan.</p>
          </div>
        )}
      </section>
    </div>
  );
}
