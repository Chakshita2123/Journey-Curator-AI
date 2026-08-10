"use client";

import { useState, useEffect } from "react";
import { MapPin, Star, DollarSign, AlertCircle, MapIcon } from "lucide-react";
import type { DestinationRecommendation, RecommendDestinationsResponse } from "@/types/api";
import { motion, TiltCard, AnimatedProgressBar, LoadingStateCard, ErrorStateCard } from "@/components/motion";

interface DestinationRecommendationsProps {
  persona: string;
}

export default function DestinationRecommendations({ persona }: DestinationRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendDestinationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/recommend-destinations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ persona, top_k: 8 }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail ?? "Failed to fetch recommendations");
        setRecommendations(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [persona]);

  if (loading) {
    return <LoadingStateCard message="Discovering Perfect Destinations..." />;
  }

  if (error) {
    return (
      <ErrorStateCard
        title="Failed to Load Recommendations"
        message={error}
        onRetry={() => {
          setLoading(true);
          setError(null);
          fetch("/api/recommend-destinations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ persona, top_k: 8 }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.detail) throw new Error(data.detail);
              setRecommendations(data);
            })
            .catch((err) => setError(err instanceof Error ? err.message : "Failed to load recommendations"))
            .finally(() => setLoading(false));
        }}
      />
    );
  }

  if (!recommendations || recommendations.recommendations.length === 0) {
    return (
      <div className="card p-8 text-center">
        <MapIcon className="w-12 h-12 mx-auto text-[var(--color-muted)] opacity-50 mb-3" />
        <p className="text-[var(--color-text)] font-medium">No recommendations available</p>
      </div>
    );
  }

  const active = recommendations.recommendations[activeIndex];
  const matchPct = Math.round(active.match_score * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-[var(--color-text)] mb-1">
          ✨ Recommended Destinations
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          Curated {recommendations.recommendations.length} destinations from {recommendations.total_destinations_considered} places
          {recommendations.hidden_gems_count > 0 && ` (includes ${recommendations.hidden_gems_count} hidden gems)`}
        </p>
      </div>

      {/* Main 3D Tilt Card - Active Destination */}
      <TiltCard maxTilt={6} className="card overflow-hidden">
        {/* Gradient header based on category */}
        <div
          className="h-32 relative flex items-center justify-center text-6xl shadow-inner"
          style={{
            background: getCategoryGradient(active.category),
          }}
        >
          <span className="animate-bounce" style={{ animationDuration: "3s" }}>
            {getCategoryEmoji(active.category)}
          </span>
        </div>

        <div className="p-6 space-y-4">
          {/* Destination Name & Location */}
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">
              {active.place_name}
            </h2>
            <div className="flex items-center gap-1 text-[var(--color-muted)]">
              <MapPin className="w-4 h-4 text-[var(--color-teal)]" />
              <span className="text-sm font-medium">
                {active.city}, {active.state}
              </span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Rating */}
            <div className="bg-[var(--color-bg)] border border-[var(--color-border-mid)] rounded-xl p-3 text-center">
              <div className="text-xl font-bold coral-text">
                {active.rating.toFixed(1)} ⭐
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1 font-medium">Rating</p>
            </div>

            {/* Match Score */}
            <div className="bg-[var(--color-bg)] border border-[var(--color-border-mid)] rounded-xl p-3 text-center">
              <div className="text-xl font-bold teal-text">
                {matchPct}%
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1 font-medium">Match</p>
            </div>

            {/* Entry Fee */}
            <div className="bg-[var(--color-bg)] border border-[var(--color-border-mid)] rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-[var(--color-text)]">
                ₹{active.entry_fee_inr > 0 ? active.entry_fee_inr.toFixed(0) : "Free"}
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-1 font-medium">Entry</p>
            </div>
          </div>

          {/* Match Score Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[var(--color-muted)]">AI Affinity Match</span>
              <span className="text-[var(--color-teal-dark)]">{matchPct}%</span>
            </div>
            <AnimatedProgressBar progress={matchPct} barClassName="h-full rounded-full teal-gradient" />
          </div>

          {/* Description */}
          <div className="rounded-xl p-3.5" style={{ background: "var(--color-surface-warm)" }}>
            <p className="text-sm text-[var(--color-text)] leading-relaxed">{active.description}</p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--color-border)]">
            <div>
              <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1">
                Category
              </p>
              <p className="font-semibold text-[var(--color-text)]">{active.category}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1">
                Best Season
              </p>
              <p className="font-semibold text-[var(--color-text)]">{active.ideal_season}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1">
                Travel Type
              </p>
              <p className="font-semibold text-[var(--color-text)]">{active.best_travel_type}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1">
                Coordinates
              </p>
              <p className="font-mono text-xs text-[var(--color-text)]">
                {active.latitude.toFixed(2)}, {active.longitude.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </TiltCard>

      {/* Carousel Navigation */}
      {recommendations.recommendations.length > 1 && (
        <div className="space-y-3">
          {/* Dots */}
          <div className="flex gap-2 justify-center flex-wrap">
            {recommendations.recommendations.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex ? "w-8 bg-[var(--color-coral)]" : "w-2 bg-[var(--color-border-mid)]"
                }`}
                aria-label={`Go to recommendation ${i + 1}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setActiveIndex((prev) => (prev - 1 + recommendations.recommendations.length) % recommendations.recommendations.length)}
              className="px-4 py-2 rounded-xl bg-white border border-[var(--color-border-mid)] text-[var(--color-text)] font-medium hover:bg-[var(--color-bg)] transition-colors btn-3d-secondary"
            >
              ← Previous
            </button>
            <button
              onClick={() => setActiveIndex((prev) => (prev + 1) % recommendations.recommendations.length)}
              className="px-4 py-2 rounded-xl bg-white border border-[var(--color-border-mid)] text-[var(--color-text)] font-medium hover:bg-[var(--color-bg)] transition-colors btn-3d-secondary"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="flex gap-3">
        <button
          onClick={() => window.open(`https://maps.google.com/?q=${active.latitude},${active.longitude}`, '_blank')}
          className="flex-1 px-4 py-3 rounded-2xl text-sm font-semibold btn-3d-secondary"
        >
          View on Maps 🗺️
        </button>
        <button
          onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(active.place_name + ' ' + active.city)}`, '_blank')}
          className="flex-1 px-4 py-3 rounded-2xl text-sm font-semibold text-white btn-3d-primary"
        >
          Learn More 🔍
        </button>
      </div>
    </motion.div>
  );
}

function getCategoryGradient(category: string): string {
  const gradients: Record<string, string> = {
    Natural: "linear-gradient(135deg, #00B894 0%, #008F73 100%)",
    Adventure: "linear-gradient(135deg, #6C5CE7 0%, #4C3DBA 100%)",
    Cultural: "linear-gradient(135deg, #4C3DBA 0%, #2D2A4A 100%)",
    Religious: "linear-gradient(135deg, #00B894 0%, #008F73 100%)",
    Historic: "linear-gradient(135deg, #6C5CE7 0%, #5A4BD1 100%)",
    Monument: "linear-gradient(135deg, #4C3DBA 0%, #6C5CE7 100%)",
    Resort: "linear-gradient(135deg, #00B894 0%, #55EFC4 100%)",
  };
  return gradients[category] || "linear-gradient(135deg, #6C5CE7 0%, #00B894 100%)";
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    Natural: "🌿",
    Adventure: "🧗",
    Cultural: "🎨",
    Religious: "🙏",
    Historic: "🏛️",
    Monument: "🗿",
    Resort: "🏨",
  };
  return emojis[category] || "📍";
}
