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
  "American", "British", "Canadian", "Australian", "Indian", "Chinese",
  "German", "French", "Japanese", "Korean", "Brazilian", "Spanish",
  "Italian", "Dutch", "Vietnamese", "Indonesian", "Thai", "Emirati",
];

/* ── Step progress bar ──────────────────────────────────── */
function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map(({ label, icon: Icon }, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center gap-1.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                active
                  ? "coral-gradient text-white scale-110 shadow-coral"
                  : done
                  ? "bg-[var(--color-success-light)] text-[var(--color-success)]"
                  : "bg-[var(--color-bg)] border border-[var(--color-border-mid)] text-[var(--color-muted-light)]"
              }`}
            >
              {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
            </div>
            <span className={`hidden sm:block text-xs font-medium transition-colors ${active ? "text-[var(--color-coral)] font-semibold" : "text-[var(--color-muted-light)]"}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className="w-5 h-0.5 rounded-full mx-1 transition-colors duration-500"
                style={{ background: done ? "var(--color-coral-mid)" : "var(--color-border-mid)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Option chip with Micro-interaction scale bounce ─────────── */
function Chip({ value, selected, onClick, id }: {
  value: string; selected: boolean; onClick: () => void; id: string;
}) {
  return (
    <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.04 }}>
      <button
        id={id}
        type="button"
        onClick={onClick}
        className={`px-4 py-2 rounded-2xl text-sm font-medium border-2 transition-all duration-200 ${
          selected
            ? "border-[var(--color-coral)] bg-[var(--color-coral-light)] text-[var(--color-coral)] font-semibold shadow-[0_2px_12px_rgba(108,92,231,0.20)]"
            : "border-[var(--color-border-mid)] text-[var(--color-muted)] hover:border-[var(--color-coral-mid)] hover:text-[var(--color-text)] bg-white"
        }`}
      >
        {value}
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
      <label htmlFor={id} className="text-sm font-medium text-[var(--color-text)]">{label}</label>
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
  return <p className="text-sm font-semibold text-[var(--color-text)] mb-2">{children}</p>;
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
  const [accommodation, setAccommodation] = useState(journey.accommodation || "");
  const [transport, setTransport]         = useState(journey.transport || "");
  const [travelStyle, setTravelStyle]     = useState(journey.travelStyle || (journey.persona?.recommended_styles[0] ?? ""));
  const [season, setSeason]               = useState(journey.season || "");
  const [age, setAge]                     = useState<number | "">("");
  const [nationality, setNationality]     = useState("");
  const [groupSize, setGroupSize]         = useState<number | "">(journey.groupSize || "");
  const [budget, setBudget]               = useState<number | "">(journey.budget || "");

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
    <div className="card p-8 max-w-xl w-full mx-auto">
      <StepBar current={step} />

      {/* ── Step content ─────────────────────────── */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="font-heading font-700 text-2xl text-[var(--color-text)]">Where are you headed? 🌍</h2>
              <p className="text-[var(--color-muted)] text-sm mt-1">Tell us your destination and trip length.</p>
            </div>
            <Field id="destination-input" label="Destination" value={destination}
              onChange={setDestination} placeholder="Paris, Bali, Tokyo, New York…" />
            <Field id="duration-input" label="How many days?" type="number"
              value={duration} onChange={(v) => setDuration(v === "" ? "" : Number(v))}
              placeholder="7" min={1} max={365} />
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="font-heading font-700 text-2xl text-[var(--color-text)]">Where will you stay? 🏨</h2>
              <p className="text-[var(--color-muted)] text-sm mt-1">Pick your accommodation type.</p>
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
              <h2 className="font-heading font-700 text-2xl text-[var(--color-text)]">How will you get there? ✈️</h2>
              <p className="text-[var(--color-muted)] text-sm mt-1">Transport type, travel style, and season.</p>
            </div>
            <div>
              <SectionLabel>Transport</SectionLabel>
              <div className="flex flex-wrap gap-3">
                {TRANSPORT_TYPES.map((t) => (
                  <Chip key={t} id={`transport-${t.toLowerCase().replace(/\s/g, "-")}`}
                    value={t} selected={transport === t} onClick={() => setTransport(t)} />
                ))}
              </div>
            </div>
            <div>
              <SectionLabel>Travel style</SectionLabel>
              <div className="flex flex-wrap gap-3">
                {TRAVEL_STYLES.map((s) => (
                  <Chip key={s} id={`style-${s.toLowerCase()}`}
                    value={s} selected={travelStyle === s} onClick={() => setTravelStyle(s)} />
                ))}
              </div>
            </div>
            <div>
              <SectionLabel>Season</SectionLabel>
              <div className="flex flex-wrap gap-3">
                {SEASONS.map((s) => (
                  <Chip key={s} id={`season-${s.toLowerCase()}`}
                    value={s} selected={season === s} onClick={() => setSeason(s)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="font-heading font-700 text-2xl text-[var(--color-text)]">Tell us about yourself 👤</h2>
              <p className="text-[var(--color-muted)] text-sm mt-1">Optional — helps the model personalise predictions.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field id="age-input" label="Age" type="number"
                value={age} onChange={(v) => setAge(v === "" ? "" : Number(v))} placeholder="28" />
              <Field id="group-size-input" label="Group size" type="number"
                value={groupSize} onChange={(v) => setGroupSize(v === "" ? "" : Number(v))} placeholder="1" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="nationality-select" className="text-sm font-medium text-[var(--color-text)]">Nationality</label>
              <select
                id="nationality-select"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="input-base"
              >
                <option value="">Select…</option>
                {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="font-heading font-700 text-2xl text-[var(--color-text)]">What&apos;s your budget? 💸</h2>
              <p className="text-[var(--color-muted)] text-sm mt-1">
                Optional — if the predicted cost exceeds this, we&apos;ll suggest ways to save.
              </p>
            </div>
            <Field id="budget-input" label="Budget (USD)" type="number"
              value={budget} onChange={(v) => setBudget(v === "" ? "" : Number(v))} placeholder="e.g. 2000" />

            {/* Trip summary */}
            <div
              className="rounded-2xl p-4 flex flex-col gap-2 text-sm"
              style={{ background: "var(--color-surface-warm)", border: "1px solid rgba(108,92,231,0.12)" }}
            >
              <p className="font-semibold text-[var(--color-text)] mb-1">📋 Trip summary</p>
              <p className="text-[var(--color-muted)]">📍 <strong>{destination}</strong> · {duration} days</p>
              <p className="text-[var(--color-muted)]">🏨 {accommodation} &nbsp;·&nbsp; ✈️ {transport}</p>
              {travelStyle && <p className="text-[var(--color-muted)]">🎒 {travelStyle} style{season ? ` · ${season}` : ""}</p>}
              {age && <p className="text-[var(--color-muted)]">👤 Age {age}{nationality ? ` · ${nationality}` : ""}</p>}
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Error ────────────────────────────────── */}
      {error && (
        <div className="mt-4 p-3 rounded-xl text-sm" style={{ background: "var(--color-danger-light)", color: "var(--color-danger)" }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Navigation ───────────────────────────── */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <button
            id="prev-step-btn"
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] border border-[var(--color-border-mid)] transition-all duration-200"
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
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-white btn-3d-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            id="predict-submit-btn"
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-white btn-3d-primary disabled:opacity-60"
          >
            <span>✨</span> Predict My Cost
          </button>
        )}
      </div>
    </div>
  );
}
