"use client";

import { RefreshCcw, TrendingDown, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import type { PredictResponse } from "@/types/api";
import { AnimatedProgressBar, motion } from "@/components/motion";

interface Props {
  result: PredictResponse;
  destination: string;
  duration: number;
  onReset: () => void;
}

function BudgetGauge({ predicted, budget }: { predicted: number; budget?: number }) {
  if (!budget) return null;
  const pct  = Math.min((predicted / budget) * 100, 100);
  const over = predicted > budget;
  return (
    <div className="mt-5 space-y-2">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-[var(--color-muted)]">Budget: ${budget.toLocaleString()}</span>
        <span style={{ color: over ? "var(--color-danger)" : "var(--color-success)" }}>
          {over
            ? `$${(predicted - budget).toLocaleString()} over`
            : `$${(budget - predicted).toLocaleString()} under`}
        </span>
      </div>
      <AnimatedProgressBar
        progress={pct}
        className="h-3 rounded-full bg-[var(--color-bg)] border border-[var(--color-border-mid)] overflow-hidden"
        barClassName={`h-full rounded-full ${
          over
            ? "bg-gradient-to-r from-amber-500 to-red-500"
            : "bg-gradient-to-r from-[var(--color-teal)] to-emerald-400"
        }`}
      />
    </div>
  );
}

const FIELD_LABELS: Record<string, string> = {
  season: "Season",
  duration: "Duration",
  travel_style: "Travel Style",
  accommodation_type: "Accommodation",
  transportation_type: "Transport",
};

export default function ResultCard({ result, destination, duration, onReset }: Props) {
  const { predicted_cost, budget, suggestions } = result;
  const withinBudget = !budget || predicted_cost <= budget;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45 }}
      className="w-full max-w-xl mx-auto flex flex-col gap-5"
    >
      {/* ── Main cost card ─────────────────────── */}
      <div className="card p-8 text-center shadow-coral">
        <p className="text-4xl mb-3 animate-bounce">🎉</p>
        <p className="text-sm font-medium text-[var(--color-muted)] uppercase tracking-wider mb-1">
          Estimated Trip Cost
        </p>
        <p className="font-heading font-900 text-6xl coral-text">
          ${predicted_cost.toLocaleString()}
        </p>
        <p className="mt-2 text-[var(--color-muted)] text-sm font-medium">
          {destination} · {duration} {duration === 1 ? "day" : "days"}
        </p>

        <BudgetGauge predicted={predicted_cost} budget={budget} />

        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-sm"
          style={
            withinBudget
              ? { background: "var(--color-success-light)", color: "var(--color-success)" }
              : { background: "var(--color-danger-light)", color: "var(--color-danger)" }
          }
        >
          {withinBudget
            ? <><CheckCircle2 className="w-4 h-4" /> Within Budget 🎯</>
            : <><AlertTriangle className="w-4 h-4" /> Over Budget — See suggestions below</>}
        </motion.div>
      </div>

      {/* ── Suggestions ────────────────────────── */}
      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-[var(--color-teal)]" />
            <h3 className="font-heading font-700 text-lg text-[var(--color-text)]">Ways to save 💡</h3>
          </div>
          <div className="flex flex-col gap-3">
            {suggestions.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.01, translateY: -2 }}
                className="flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200"
                style={{ background: "var(--color-surface-warm)", border: "1px solid rgba(108,92,231,0.10)" }}
              >
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs text-[var(--color-muted)] font-semibold uppercase tracking-wider">
                    {FIELD_LABELS[s.field] ?? s.field}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-[var(--color-muted)] line-through">{String(s.original_value)}</span>
                    <ArrowRight className="w-3 h-3 text-[var(--color-teal)]" />
                    <span className="font-semibold text-[var(--color-text)]">{String(s.suggested_value)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm" style={{ color: "var(--color-success)" }}>
                    ${s.predicted_cost.toLocaleString()}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">new cost</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Reset ──────────────────────────────── */}
      <button
        id="predict-reset-btn"
        type="button"
        onClick={onReset}
        className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white border border-[var(--color-border-mid)] transition-all duration-200 mx-auto btn-3d-secondary"
      >
        <RefreshCcw className="w-4 h-4" />
        Plan another trip
      </button>
    </motion.div>
  );
}
