"use client";

import { useState } from "react";
import {
  Users, Share2, Copy, CheckCircle2,
  ChevronDown, ChevronUp, MessageCircle,
} from "lucide-react";

interface TripSplitterProps {
  totalCost: number;
  destination: string;
  /** Duration in days */
  duration?: number;
  /** Initial group size (1–20) */
  initialGroupSize?: number;
  /** If a trip has already been saved, include its direct URL in the share message */
  savedTripId?: string | null;
  /** Top 1-2 itinerary highlights (day 1 title etc.) for the share message */
  itinerarySummary?: string;
}

function splitCost(total: number, people: number, duration: number) {
  // Rough cost breakdown heuristics
  const accommodation = Math.round(total * 0.35); // ~35% accommodation
  const food = Math.round(total * 0.25);          // ~25% food
  const activities = Math.round(total * 0.20);    // ~20% activities/entry
  const transport = Math.round(total * 0.15);     // ~15% local transport
  const misc = total - accommodation - food - activities - transport; // rest

  const perPerson = Math.round(total / people);
  const accommodationPP = Math.round(accommodation / people);
  const foodPP = Math.round(food / people);      // food is individual
  const activitiesPP = Math.round(activities / people);
  const transportPP = Math.round(transport / people);

  return {
    total,
    perPerson,
    breakdown: [
      { label: "Accommodation", total: accommodation, perPerson: accommodationPP, shared: true },
      { label: "Food & Dining", total: food, perPerson: foodPP, shared: false },
      { label: "Activities & Entry", total: activities, perPerson: activitiesPP, shared: true },
      { label: "Local Transport", total: transport, perPerson: transportPP, shared: true },
      { label: "Miscellaneous", total: misc, perPerson: Math.round(misc / people), shared: false },
    ],
    durationDays: duration,
  };
}

function buildWhatsAppMessage(
  destination: string,
  totalCost: number,
  perPerson: number,
  people: number,
  duration: number,
  itinerarySummary: string,
  savedTripId?: string | null
): string {
  const tripUrl = savedTripId
    ? `\n🔗 Full itinerary: ${typeof window !== "undefined" ? window.location.origin : "https://journey-curator.app"}/my-trips/${savedTripId}`
    : "";

  const lines = [
    `✈️ *Journey Curator AI — Trip Plan*`,
    ``,
    `📍 *${destination}* · ${duration} day${duration !== 1 ? "s" : ""}`,
    `👥 ${people} traveller${people !== 1 ? "s" : ""}`,
    ``,
    `💰 *Total estimated cost:* ₹${totalCost.toLocaleString("en-IN")}`,
    `💸 *Per person:* ₹${perPerson.toLocaleString("en-IN")}`,
    itinerarySummary ? `\n📅 Highlights: ${itinerarySummary}` : "",
    tripUrl,
    ``,
    `🧳 Generated with Journey Curator AI`,
  ].filter((l) => l !== undefined);

  return lines.join("\n");
}

export default function TripSplitter({
  totalCost,
  destination,
  duration = 7,
  initialGroupSize = 2,
  savedTripId,
  itinerarySummary = "",
}: TripSplitterProps) {
  const [people, setPeople] = useState(initialGroupSize);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const split = splitCost(totalCost, people, duration);

  function handleWhatsApp() {
    const msg = buildWhatsAppMessage(
      destination,
      totalCost,
      split.perPerson,
      people,
      duration,
      itinerarySummary,
      savedTripId
    );
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function handleCopy() {
    const msg = buildWhatsAppMessage(
      destination,
      totalCost,
      split.perPerson,
      people,
      duration,
      itinerarySummary,
      savedTripId
    );
    try {
      await navigator.clipboard.writeText(msg);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silently fail
    }
  }

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        background: "var(--color-surface-warm)",
        border: "1px solid rgba(108,92,231,0.14)",
        boxShadow: "0 4px 24px rgba(108,92,231,0.06)",
      }}
    >
      {/* Header toggle */}
      <button
        type="button"
        id="trip-splitter-toggle"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        style={{ borderBottom: expanded ? "1px solid rgba(108,92,231,0.10)" : "none" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shrink-0"
            style={{ background: "linear-gradient(135deg,#6C5CE7,#A29BFE)" }}
          >
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">Split with friends</p>
            <p className="text-xs text-[var(--color-muted)]">
              {people === 1
                ? "1 person — add more to split costs"
                : `₹${split.perPerson.toLocaleString("en-IN")} per person for ${people} people`}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-[var(--color-muted)] shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[var(--color-muted)] shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-5 py-4 space-y-5">
          {/* Group size input */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-[var(--color-text)] shrink-0">
              Number of people
            </label>
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                id="splitter-decrease"
                onClick={() => setPeople((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-full border border-[var(--color-border-mid)] flex items-center justify-center text-[var(--color-muted)] hover:border-[var(--color-coral)] hover:text-[var(--color-coral)] transition-colors text-lg font-bold"
              >
                −
              </button>
              <input
                id="splitter-group-input"
                type="number"
                min={1}
                max={20}
                value={people}
                onChange={(e) => {
                  const v = Math.min(20, Math.max(1, parseInt(e.target.value) || 1));
                  setPeople(v);
                }}
                className="w-14 text-center font-bold text-[var(--color-text)] rounded-xl border border-[var(--color-border-mid)] py-1.5 text-sm focus:outline-none focus:border-[var(--color-coral)]"
              />
              <button
                type="button"
                id="splitter-increase"
                onClick={() => setPeople((p) => Math.min(20, p + 1))}
                className="w-8 h-8 rounded-full border border-[var(--color-border-mid)] flex items-center justify-center text-[var(--color-muted)] hover:border-[var(--color-coral)] hover:text-[var(--color-coral)] transition-colors text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Cost summary */}
          <div
            className="rounded-2xl p-4 text-center"
            style={{ background: "linear-gradient(135deg,rgba(108,92,231,0.08),rgba(0,184,148,0.08))" }}
          >
            <p className="text-xs text-[var(--color-muted)] mb-1 uppercase tracking-wider font-semibold">Per person</p>
            <p className="font-heading text-3xl font-bold" style={{ color: "var(--color-coral)" }}>
              ₹{split.perPerson.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-[var(--color-muted)] mt-1">
              Total: ₹{totalCost.toLocaleString("en-IN")} ÷ {people} {people === 1 ? "person" : "people"}
            </p>
          </div>

          {/* Breakdown */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">Cost breakdown</p>
            {split.breakdown.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-2.5 px-3 rounded-2xl"
                style={{ background: "white", border: "1px solid rgba(45,42,74,0.06)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--color-text)]">{item.label}</span>
                  {item.shared && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: "var(--color-teal-light)", color: "var(--color-teal-dark)" }}>
                      shared
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[var(--color-text)]">
                    ₹{item.perPerson.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-[var(--color-muted)]">
                    ₹{item.total.toLocaleString("en-IN")} total
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Share buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              id="splitter-whatsapp-btn"
              onClick={handleWhatsApp}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: "#25D366" }}
            >
              <MessageCircle className="w-4 h-4" />
              Share via WhatsApp
            </button>
            <button
              type="button"
              id="splitter-copy-btn"
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-semibold border transition-all duration-200"
              style={{
                border: "1px solid var(--color-border-mid)",
                color: copied ? "var(--color-success)" : "var(--color-muted)",
                background: copied ? "var(--color-success-light)" : "white",
              }}
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <p className="text-[11px] text-[var(--color-muted)] text-center">
            * Cost breakdown is an estimate based on typical trip patterns. Accommodation &amp; transport are shared; food &amp; misc are per-person.
          </p>
        </div>
      )}
    </div>
  );
}
