"use client";

import { useState } from "react";
import {
  MapPin, Clock, Home, Plane, User, Wallet,
  ChevronRight, ChevronLeft, Loader2, CheckCircle2,
} from "lucide-react";
import type { TripRequest, PredictResponse } from "@/types/api";
import ResultCard from "./ResultCard";
import { motion, LoadingStateCard, ErrorStateCard } from "@/components/motion";
import { useUserJourney } from "@/context/UserJourneyContext";
import DestinationAutocomplete from "@/components/DestinationAutocomplete";

const STEPS = [
  { id: "destination", label: "Where?",  icon: MapPin  },
  { id: "stay",        label: "Stay",    icon: Home    },
  { id: "travel",      label: "Travel",  icon: Plane   },
  { id: "profile",     label: "Profile", icon: User    },
  { id: "budget",      label: "Budget",  icon: Wallet  },
];

const ACCOMMODATION_TYPES = ["Hotel", "Resort", "Airbnb", "Hostel", "Villa", "Riad", "Guesthouse"];
const TRANSPORT_TYPES      = ["Flight", "Train", "Bus", "Car rental", "Ferry", "Cruise"];
const TRAVEL_STYLES        = ["Luxury", "Comfort", "Budget", "Backpacker", "Adventure", "Relaxed"];
const SEASONS              = ["Summer", "Winter", "Spring", "Fall", "Monsoon"];
const NATIONALITIES        = [
  "Indian", "American", "British", "Canadian", "Australian", "Chinese",
  "German", "French", "Japanese", "Korean", "Brazilian", "Spanish",
  "Italian", "Dutch", "Vietnamese", "Indonesian", "Thai", "Emirati",
];
const POPULAR_ORIGINS      = ["Delhi", "Mumbai", "Bengaluru", "Kolkata", "Chennai", "Hyderabad", "Pune", "Jaipur"];

const getDestinationSeasonHint = (dest: string) => {
  const d = dest.toLowerCase().trim();
  if (!d) return null;
  if (d.includes("goa") || d.includes("jaipur") || d.includes("kerala") || d.includes("agra") || d.includes("udaipur") || d.includes("delhi") || d.includes("kolkata")) return { raw: "Winter", text: "Winter (Oct - Mar) — Ideal pleasant weather & festivals" };
  if (d.includes("manali") || d.includes("shimla") || d.includes("ladakh") || d.includes("leh") || d.includes("ooty")) return { raw: "Summer", text: "Summer (Mar - Jun) — Pleasant mountain getaway" };
  if (d.includes("srinagar") || d.includes("darjeeling")) return { raw: "Spring", text: "Spring / Autumn — Clear mountain views & blooms" };
  if (d.includes("pune") || d.includes("lonavala")) return { raw: "Monsoon", text: "Monsoon / Winter — Scenic lush Sahyadri hills" };
  return { raw: "Winter", text: "Winter (Oct - Mar) — Pleasant travel season" };
};

/* ── Step progress bar (Enhanced Bold Visual Presence) ───────── */
function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-between gap-2 mb-10 pb-6 border-b border-[var(--color-border)]">
      {STEPS.map(({ label, icon: Icon }, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center gap-2 flex-1 last:flex-initial">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  active
                    ? "coral-gradient text-white scale-110 shadow-coral ring-4 ring-[#6C5CE7]/20 font-extrabold"
                    : done
                    ? "bg-[var(--color-teal)] text-white shadow-teal"
                    : "bg-[var(--color-bg)] border border-[var(--color-border-mid)] text-[var(--color-muted-light)]"
                }`}
              >
                {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
              </div>
              <div className="hidden md:flex flex-col">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${active ? "text-[var(--color-coral)]" : "text-[var(--color-muted-light)]"}`}>
                  Step 0{i + 1}
                </span>
                <span className={`text-xs font-bold font-display tracking-tight transition-colors ${active ? "text-[var(--color-text)] font-extrabold" : "text-[var(--color-muted)]"}`}>
                  {label}
                </span>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-1.5 rounded-full mx-2 hidden sm:block overflow-hidden bg-[var(--color-border-mid)]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: done ? "100%" : active ? "50%" : "0%",
                    background: done ? "var(--color-teal)" : "linear-gradient(90deg, #6C5CE7, #00B894)",
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Option chip with Micro-interaction scale bounce ─────────── */
function Chip({ value, selected, onClick, id, badge }: {
  value: string; selected: boolean; onClick: () => void; id: string; badge?: string;
}) {
  return (
    <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }}>
      <button
        id={id}
        type="button"
        onClick={onClick}
        className={`px-4 py-2.5 rounded-2xl text-sm font-semibold border-2 transition-all duration-200 flex items-center gap-2 ${
          selected
            ? "border-[var(--color-coral)] bg-[var(--color-coral-light)] text-[var(--color-coral-dark)] shadow-[0_4px_16px_rgba(108,92,231,0.22)]"
            : "border-[var(--color-border-mid)] text-[var(--color-text)] hover:border-[var(--color-coral-mid)] bg-white shadow-xs"
        }`}
      >
        <span>{value}</span>
        {badge && (
          <span className="text-[10px] bg-[var(--color-teal)] text-white px-2 py-0.5 rounded-full font-extrabold">
            {badge}
          </span>
        )}
      </button>
    </motion.div>
  );
}

/* ── Labelled input ──────────────────────────────────────── */
function Field({ label, id, type = "text", value, onChange, placeholder, min, max }: {
  label: string; id: string; type?: string;
  value: string | number; onChange: (v: string) => void;
  placeholder?: string; min?: number; max?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-sm font-bold text-[var(--color-text)]">{label}</label>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        className="input-base"
      />
    </div>
  );
}

/* ── Section label ───────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-extrabold font-display text-[var(--color-text)] mb-2.5">{children}</p>;
}

/* ── Main ────────────────────────────────────────────────── */
export default function PredictForm() {
  const { journey, setTripCost } = useUserJourney();
  const [step, setStep]         = useState(0);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [result, setResult]     = useState<PredictResponse | null>(null);

  const [destination, setDestination]     = useState(journey.selectedDestination || "");
  const [duration, setDuration]           = useState<number | "">(journey.duration || 7);
  const [origin, setOrigin]               = useState(journey.origin || "Delhi");
  const [accommodation, setAccommodation] = useState(journey.accommodation || "");
  const [transport, setTransport]         = useState(journey.transport || "");
  const [travelStyle, setTravelStyle]     = useState(journey.travelStyle || "");
  const [season, setSeason]               = useState(journey.season || "");
  const [age, setAge]                     = useState<number | "">("");
  const [nationality, setNationality]     = useState("Indian");
  const [groupSize, setGroupSize]         = useState<number | "">(journey.groupSize || "");
  const [budget, setBudget]               = useState<number | "">(journey.budget || "");

  const seasonHint = getDestinationSeasonHint(destination);

  const canNext = () => {
    if (step === 0) return destination.trim().length > 0 && Number(duration) > 0;
    if (step === 1) return accommodation.length > 0;
    if (step === 2) return transport.length > 0;
    return true;
  };

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    const cleanDest = destination.trim().slice(0, 100);
    const cleanDuration = Math.max(1, Math.min(365, Math.abs(Number(duration)) || 7));
    const cleanBudget = budget !== "" ? Math.max(0, Number(budget)) : undefined;
    const cleanGroup = groupSize !== "" ? Math.max(1, Math.min(50, Number(groupSize))) : undefined;
    const cleanAge = age !== "" ? Math.max(1, Math.min(120, Number(age))) : undefined;

    const payload: TripRequest = {
      destination: cleanDest,
      duration: cleanDuration,
      ...(origin && { origin: origin.trim() }),
      ...(accommodation && { accommodation_type: accommodation }),
      ...(transport && { transportation_type: transport }),
      ...(travelStyle && { travel_style: travelStyle }),
      ...(season && { season }),
      ...(cleanAge !== undefined && { age: cleanAge }),
      ...(nationality && { nationality }),
      ...(cleanGroup !== undefined && { group_size: cleanGroup }),
      ...(cleanBudget !== undefined && { budget: cleanBudget }),
    };
    try {
      const res  = await fetch("/api/predict-cost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Cost prediction service is currently unavailable. Please check your connection.");
      const costData = data as PredictResponse;
      setResult(costData);
      setTripCost(costData, {
        selectedDestination: cleanDest,
        duration: cleanDuration,
        origin,
        accommodation,
        transport,
        travelStyle,
        season,
        groupSize: cleanGroup || 2,
        budget: cleanBudget,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong while calculating your prediction.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingStateCard message="Predicting Your Trip Cost..." />;
  }

  if (error) {
    return <ErrorStateCard message={error} onRetry={handleSubmit} />;
  }

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ResultCard
          result={result}
          destination={destination}
          duration={Number(duration)}
          onReset={() => { setResult(null); setStep(0); }}
        />
      </motion.div>
    );
  }

  return (
    <div className="card max-w-3xl w-full mx-auto shadow-2xl border border-[rgba(108,92,231,0.15)] overflow-hidden relative">
      {/* ── Top Indigo-to-Teal 2-Color Accent Bar ── */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#6C5CE7] to-[#00B894]" />

      <div className="p-6 sm:p-10">
        {journey.selectedDestination && (
          <div className="mb-8 p-4 rounded-2xl bg-[#EEECFC] border border-[#6C5CE7]/30 flex items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="text-base">✨</span>
              <p className="text-[#1A1636] font-semibold">
                Pre-filled from your itinerary: <strong className="text-[#6C5CE7] font-extrabold">{journey.selectedDestination}</strong> ({duration} days{journey.accommodation ? ` · ${journey.accommodation}` : ""})
              </p>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#6C5CE7] text-white shrink-0 shadow-xs">
              Connected Flow
            </span>
          </div>
        )}

      {/* ── Step content ─────────────────────────── */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {step === 0 && (
          <div className="flex flex-col gap-6">
            <div>
              <span className="badge-solid-coral inline-block text-[11px] font-extrabold uppercase px-3 py-0.5 rounded-full mb-2">
                Step 01 · Location &amp; Time
              </span>
              <h2 className="font-display font-[800] text-2xl sm:text-3xl text-[var(--color-text)] tracking-tight">
                Where are you headed? 🌍
              </h2>
              <p className="text-[var(--color-muted)] text-sm sm:text-base mt-1 font-normal">
                Tell us your target destination and estimated trip duration.
              </p>
            </div>

            {/* Responsive 2-Column Horizontal Layout for Destination + Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
              <div className="sm:col-span-8">
                <label className="text-sm font-extrabold font-display text-[var(--color-text)] mb-2 block">
                  Target Destination
                </label>
                <DestinationAutocomplete
                  id="destination-input"
                  value={destination}
                  onChange={setDestination}
                  placeholder="Goa, Manali, Jaipur, Kerala, Paris..."
                  showIcon={true}
                  size="md"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="text-sm font-extrabold font-display text-[var(--color-text)] mb-2 block">
                  Duration (Days)
                </label>
                <Field
                  id="duration-input"
                  label=""
                  type="number"
                  value={duration}
                  onChange={(v) => setDuration(v === "" ? "" : Number(v))}
                  placeholder="7"
                  min={1}
                  max={365}
                />
              </div>
            </div>
            
            {destination.trim().length > 0 && seasonHint && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-[var(--color-surface-warm)] border border-[rgba(108,92,231,0.18)] flex items-center gap-3 text-xs sm:text-sm text-[var(--color-text)] shadow-xs"
              >
                <span className="text-xl">☀️</span>
                <div>
                  <span className="font-extrabold text-[var(--color-coral)]">Best Time to Visit: </span>
                  <span className="font-semibold text-[var(--color-text)]">{seasonHint.text}</span>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div>
              <span className="badge-solid-coral inline-block text-[11px] font-extrabold uppercase px-3 py-0.5 rounded-full mb-2">
                Step 02 · Stay Comfort
              </span>
              <h2 className="font-display font-[800] text-2xl sm:text-3xl text-[var(--color-text)] tracking-tight">
                Where will you stay? 🏨
              </h2>
              <p className="text-[var(--color-muted)] text-sm sm:text-base mt-1 font-normal">
                Pick your preferred accommodation tier to calibrate nightly lodging pricing.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {ACCOMMODATION_TYPES.map((a) => (
                <Chip key={a} id={`acc-${a.toLowerCase()}`} value={a}
                  selected={accommodation === a} onClick={() => setAccommodation(a)} />
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div>
              <span className="badge-solid-coral inline-block text-[11px] font-extrabold uppercase px-3 py-0.5 rounded-full mb-2">
                Step 03 · Route Logistics
              </span>
              <h2 className="font-display font-[800] text-2xl sm:text-3xl text-[var(--color-text)] tracking-tight">
                How will you get there? ✈️
              </h2>
              <p className="text-[var(--color-muted)] text-sm sm:text-base mt-1 font-normal">
                Set origin city, transit method, travel style, and targeted season.
              </p>
            </div>

            {/* Where are you traveling from? */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-surface-warm)] border border-[var(--color-border-mid)]">
              <SectionLabel>Where are you traveling from?</SectionLabel>
              <Field
                id="origin-input"
                label=""
                value={origin}
                onChange={setOrigin}
                placeholder="e.g. Delhi, Mumbai, Bengaluru, London..."
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {POPULAR_ORIGINS.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setOrigin(o)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      origin.toLowerCase() === o.toLowerCase()
                        ? "bg-[var(--color-coral)] border-[var(--color-coral)] text-white shadow-xs"
                        : "bg-white border-[var(--color-border-mid)] text-[var(--color-muted)] hover:border-[var(--color-coral-mid)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    📍 {o}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <SectionLabel>Transportation Mode</SectionLabel>
              <div className="flex flex-wrap gap-3">
                {TRANSPORT_TYPES.map((t) => (
                  <Chip key={t} id={`transport-${t.toLowerCase().replace(/\s/g, "-")}`}
                    value={t} selected={transport === t} onClick={() => setTransport(t)} />
                ))}
              </div>
            </div>

            <div>
              <SectionLabel>Travel Style Tier</SectionLabel>
              <div className="flex flex-wrap gap-3">
                {TRAVEL_STYLES.map((s) => (
                  <Chip key={s} id={`style-${s.toLowerCase()}`}
                    value={s} selected={travelStyle === s} onClick={() => setTravelStyle(s)} />
                ))}
              </div>
            </div>

            <div>
              <SectionLabel>Travel Season</SectionLabel>
              <div className="flex flex-wrap gap-3">
                {SEASONS.map((s) => {
                  const isBest = seasonHint && seasonHint.raw.toLowerCase() === s.toLowerCase();
                  return (
                    <Chip
                      key={s}
                      id={`season-${s.toLowerCase()}`}
                      value={s}
                      selected={season === s}
                      onClick={() => setSeason(s)}
                      badge={isBest ? "Best" : undefined}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div>
              <span className="badge-solid-coral inline-block text-[11px] font-extrabold uppercase px-3 py-0.5 rounded-full mb-2">
                Step 04 · Traveler Profile
              </span>
              <h2 className="font-display font-[800] text-2xl sm:text-3xl text-[var(--color-text)] tracking-tight">
                Tell us about yourself 👤
              </h2>
              <p className="text-[var(--color-muted)] text-sm sm:text-base mt-1 font-normal">
                Optional demographic parameters to refine the machine learning model.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="age-input" label="Age (Years)" type="number"
                value={age} onChange={(v) => setAge(v === "" ? "" : Number(v))} placeholder="28" />
              <Field id="group-size-input" label="Group Size (Pax)" type="number"
                value={groupSize} onChange={(v) => setGroupSize(v === "" ? "" : Number(v))} placeholder="1" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="nationality-select" className="text-sm font-extrabold font-display text-[var(--color-text)]">
                Primary Nationality
              </label>
              <select
                id="nationality-select"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="input-base text-sm font-semibold"
              >
                {NATIONALITIES.map((n) => <option key={n} value={n}>{n}{n === "Indian" ? " (Default)" : ""}</option>)}
              </select>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-6">
            <div>
              <span className="badge-solid-coral inline-block text-[11px] font-extrabold uppercase px-3 py-0.5 rounded-full mb-2">
                Step 05 · Target Budget &amp; Review
              </span>
              <h2 className="font-display font-[800] text-2xl sm:text-3xl text-[var(--color-text)] tracking-tight">
                What&apos;s your budget? 💸
              </h2>
              <p className="text-[var(--color-muted)] text-sm sm:text-base mt-1 font-normal">
                Set a budget benchmark — if our ML model exceeds it, we&apos;ll supply instant optimization tips.
              </p>
            </div>

            <Field id="budget-input" label="Target Budget (₹ INR)" type="number"
              value={budget} onChange={(v) => setBudget(v === "" ? "" : Number(v))} placeholder="e.g. 50000" />

            {/* Trip summary with High-Contrast Editorial Styling */}
            <div className="rounded-2xl p-5 bg-saturated-midnight text-white border border-indigo-500/30 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-blueprint-grid-dark opacity-15 pointer-events-none" />
              <div className="relative z-10 flex flex-col gap-2.5">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <p className="font-display font-extrabold text-sm text-[#55EFC4] flex items-center gap-1.5">
                    📋 Configured Trip Blueprint
                  </p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white">
                    {duration} Days
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-indigo-200/90 pt-1">
                  <p>📍 Destination: <strong className="text-white">{destination}</strong></p>
                  {origin && <p>🛫 Origin: <strong className="text-white">{origin}</strong></p>}
                  <p>🏨 Lodging: <strong className="text-white">{accommodation || "Hotel"}</strong></p>
                  <p>✈️ Transit: <strong className="text-white">{transport || "Flight"}</strong></p>
                  {travelStyle && <p>🎒 Style: <strong className="text-white">{travelStyle}</strong></p>}
                  {season && <p>☀️ Season: <strong className="text-white">{season}</strong></p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Error ────────────────────────────────── */}
      {error && (
        <div className="mt-6 p-4 rounded-2xl bg-[#FDEAEA] border border-red-200 text-sm font-bold text-red-600 flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── Navigation Buttons ───────────────────── */}
      <div className="flex gap-4 mt-10 pt-6 border-t border-[var(--color-border)]">
        {step > 0 && (
          <button
            id="prev-step-btn"
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-[var(--color-text)] hover:bg-[var(--color-bg)] border border-[var(--color-border-mid)] transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}

        {step < STEPS.length - 1 ? (
          <button
            id="next-step-btn"
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            className="flex-1 flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-base font-extrabold text-white btn-3d-primary shadow-coral disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue Step <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            id="predict-submit-btn"
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-extrabold text-white btn-3d-primary shadow-coral disabled:opacity-60"
          >
            <span>⚡</span> Run XGBoost Cost Prediction
          </button>
        )}
      </div>
      </div>
    </div>
  );
}
