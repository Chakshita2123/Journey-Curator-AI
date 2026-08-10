"use client";

import { useState } from "react";
import {
  Sparkles,
  Calendar,
  Clock,
  User,
  Compass,
  ArrowRight,
  X,
  MapPin,
  Utensils,
  Sun,
  PackageCheck,
  CheckCircle2,
  DollarSign,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence, TiltCard } from "@/components/motion";
import Link from "next/link";
import sampleItinerariesData from "@/data/sampleItineraries.json";
import type { ItineraryDay } from "@/types/api";

export interface SampleItinerary {
  id: string;
  title: string;
  flag: string;
  destination: string;
  duration: number;
  persona: string;
  persona_title: string;
  persona_badge: string;
  group_size: string;
  budget: number;
  accommodation_type: string;
  transportation_type: string;
  cost_summary: string;
  budget_advice: string;
  generated_by: string;
  itinerary: ItineraryDay[];
}

const DESTINATION_PHOTOS: Record<string, string> = {
  "goa-5d-relaxed": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
  "rajasthan-7d-culture": "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=800&q=80",
  "himachal-4d-adventurer": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
  "kerala-6d-wellness": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
};

export default function SampleItineraryShowcase() {
  const [activeModalId, setActiveModalId] = useState<string | null>(null);

  const itineraries: SampleItinerary[] = sampleItinerariesData as SampleItinerary[];
  const selectedItinerary = itineraries.find((it) => it.id === activeModalId) ?? null;

  return (
    <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
      {/* Section Header */}
      <motion.div
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-[#FFF0EB] text-[#E05A36] mb-3 border border-[#FF9776]/30 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#E05A36] animate-pulse" />
          Phase 5 LLM Pipeline · Real Output Samples
        </div>
        <h2 className="font-heading font-800 text-3xl md:text-4xl text-[var(--color-text)] mb-3">
          See What <span className="peach-text">Journey Curator AI</span> Creates
        </h2>
        <p className="text-[var(--color-muted)] max-w-lg mx-auto font-medium text-sm leading-relaxed">
          Pre-generated day-by-day plans built by our Gemini AI engine. Explore complete schedules, restaurant picks, route tips, and weather notes.
        </p>
      </motion.div>

      {/* Grid of 4 Sample Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {itineraries.map((item, index) => {
          const day1 = item.itinerary[0];
          const remainingDays = item.duration - 1;
          const photoUrl = DESTINATION_PHOTOS[item.id] ?? DESTINATION_PHOTOS["goa-5d-relaxed"];

          return (
            <motion.div
              key={item.id}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 24 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
            >
              <TiltCard
                maxTilt={6}
                onClick={() => setActiveModalId(item.id)}
                className="card overflow-hidden flex flex-col justify-between h-full cursor-pointer select-none group border border-[var(--color-border)] hover:border-[var(--color-coral-mid)] transition-all duration-300 shadow-soft"
              >
                <div>
                  {/* Photo Header */}
                  <div className="h-44 w-full relative overflow-hidden img-card-container indigo-duotone-overlay">
                    <img
                      src={photoUrl}
                      alt={item.title}
                      className="w-full h-full object-cover img-card-zoom"
                    />
                    <div className="absolute top-3 left-3 z-10">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-white/95 text-[var(--color-coral-dark)] shadow-xs">
                        <User className="w-3 h-3 text-[var(--color-coral)]" />
                        {item.persona_badge}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 z-10">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 shadow-xs">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        ✨ AI Generated
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 z-10 text-white">
                      <h3 className="font-heading font-800 text-lg leading-snug drop-shadow-md">
                        {item.flag} {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-3 text-xs text-[var(--color-muted)] font-semibold mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[var(--color-coral)]" /> {item.duration} Days
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[var(--color-teal)]" /> {item.destination}
                      </span>
                      <span>·</span>
                      <span className="text-[var(--color-coral-dark)] font-bold">
                        ₹{item.budget.toLocaleString()}
                      </span>
                    </div>

                    {/* Day 1 Teaser Preview */}
                    <div className="p-3.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[var(--color-text)]">
                          Day 1: {day1?.title}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-[var(--color-muted)] border border-[var(--color-border)]">
                          Teaser
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-muted)] line-clamp-2 leading-relaxed font-medium">
                        {day1?.summary}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Indicator & Expansion Button */}
                <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--color-coral-dark)] px-2.5 py-1 rounded-lg bg-[var(--color-coral-light)]">
                    +{remainingDays} more days planned
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-coral)] group-hover:translate-x-1 transition-transform">
                    View Full Itinerary
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </TiltCard>
            </motion.div>
          );
        })}
      </div>

      {/* Quiz Call To Action Strip */}
      <motion.div
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-12 text-center"
      >
        <div className="inline-flex flex-wrap items-center justify-center gap-4 p-5 rounded-2xl bg-white border border-[var(--color-border-mid)] shadow-soft">
          <div className="text-left">
            <p className="font-heading font-700 text-base text-[var(--color-text)]">
              Want your own personalized itinerary?
            </p>
            <p className="text-xs text-[var(--color-muted)] font-medium">
              Discover your travel persona & get custom AI recommendations in 60 seconds.
            </p>
          </div>
          <Link
            href="/persona"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-white btn-3d-primary shadow-xs"
          >
            Take the Quiz
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      {/* Full Itinerary Modal Expansion */}
      <AnimatePresence>
        {selectedItinerary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalId(null)}
              className="fixed inset-0 bg-[#2D2A4A]/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-[var(--color-border-mid)] overflow-y-auto z-10 p-6 md:p-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModalId(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="mb-8 pr-8">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-[var(--color-coral-light)] text-[var(--color-coral-dark)] border border-[var(--color-coral-mid)]/40">
                    <User className="w-3.5 h-3.5 text-[var(--color-coral)]" />
                    {selectedItinerary.persona_title}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-[#E6F8F4] text-[#008F73] border border-[#55EFC4]/40">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00B894]" />
                    Real Phase 5 LLM Output
                  </span>
                </div>

                <h2 className="font-heading font-800 text-2xl md:text-3xl text-[var(--color-text)] leading-tight">
                  {selectedItinerary.flag} {selectedItinerary.title}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--color-muted)] font-semibold mt-2">
                  <span>🗓️ {selectedItinerary.duration} Days</span>
                  <span>·</span>
                  <span>👥 {selectedItinerary.group_size}</span>
                  <span>·</span>
                  <span>🏨 {selectedItinerary.accommodation_type}</span>
                  <span>·</span>
                  <span>🚗 {selectedItinerary.transportation_type}</span>
                </div>
              </div>

              {/* Cost & Budget Summary Banner */}
              <div className="mb-8 grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[var(--color-surface-warm)] border border-[var(--color-border)]">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-coral-dark)] uppercase tracking-wider mb-1">
                    <DollarSign className="w-4 h-4 text-[var(--color-coral)]" />
                    Cost Summary
                  </div>
                  <p className="text-xs text-[var(--color-text)] font-medium leading-relaxed">
                    {selectedItinerary.cost_summary}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--color-surface-teal)] border border-[var(--color-border)]">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-teal-dark)] uppercase tracking-wider mb-1">
                    <Sparkles className="w-4 h-4 text-[var(--color-teal)]" />
                    Budget Advice
                  </div>
                  <p className="text-xs text-[var(--color-text)] font-medium leading-relaxed">
                    {selectedItinerary.budget_advice}
                  </p>
                </div>
              </div>

              {/* Day-by-Day Timeline List (Identical styling to real Itinerary Page) */}
              <div className="space-y-6">
                <h3 className="font-heading font-700 text-xl text-[var(--color-text)] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[var(--color-coral)]" />
                  Day-by-Day Detailed Itinerary
                </h3>

                {selectedItinerary.itinerary.map((day) => (
                  <article
                    key={day.day}
                    className="card p-6 space-y-4 border border-[var(--color-border)] bg-white rounded-2xl shadow-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl teal-gradient flex items-center justify-center text-white shadow-teal text-lg font-bold shrink-0">
                        {day.day}
                      </div>
                      <div>
                        <h4 className="font-heading font-700 text-lg text-[var(--color-text)] leading-snug">
                          {day.title}
                        </h4>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5 leading-relaxed font-medium">
                          {day.summary}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 pt-2 border-t border-[var(--color-border)]">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[var(--color-muted)] mb-2 font-bold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[var(--color-coral)]" /> Top Attractions
                        </p>
                        <ul className="space-y-1 text-xs text-[var(--color-text)] font-medium">
                          {day.attractions.map((item, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-teal)] shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[var(--color-muted)] mb-2 font-bold flex items-center gap-1">
                          <Utensils className="w-3.5 h-3.5 text-[var(--color-peach-dark)]" /> Restaurant Picks
                        </p>
                        <ul className="space-y-1 text-xs text-[var(--color-text)] font-medium">
                          {day.restaurants.map((item, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-peach-dark)] shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 pt-2">
                      <div className="rounded-xl p-3.5 bg-[var(--color-surface-teal)]">
                        <p className="text-[var(--color-muted)] text-[10px] uppercase tracking-wider mb-1 font-bold">Route Suggestion</p>
                        <p className="text-xs text-[var(--color-text)] font-medium leading-relaxed">{day.route_suggestion}</p>
                      </div>
                      <div className="rounded-xl p-3.5 bg-[var(--color-surface-warm)]">
                        <p className="text-[var(--color-muted)] text-[10px] uppercase tracking-wider mb-1 font-bold flex items-center gap-1">
                          <Sun className="w-3 h-3 text-[var(--color-peach-dark)]" /> Weather Note
                        </p>
                        <p className="text-xs text-[var(--color-text)] font-medium leading-relaxed">{day.weather_note}</p>
                      </div>
                    </div>

                    {day.packing && day.packing.length > 0 && (
                      <div className="rounded-xl p-3.5 bg-[var(--color-bg)] border border-[var(--color-border)]">
                        <p className="text-[var(--color-muted)] text-[10px] uppercase tracking-wider mb-1 font-bold flex items-center gap-1">
                          <PackageCheck className="w-3.5 h-3.5 text-[var(--color-coral)]" /> Packing Checklist
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs text-[var(--color-text)]">
                          {day.packing.map((item, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-[var(--color-border)] font-medium shadow-2xs">
                              ✓ {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>

              {/* Modal Footer CTA */}
              <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex items-center justify-between gap-4">
                <button
                  onClick={() => setActiveModalId(null)}
                  className="px-5 py-2.5 rounded-xl border border-[var(--color-border-mid)] text-xs font-bold text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
                <Link
                  href="/predict"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white btn-3d-primary shadow-xs"
                >
                  Generate My Custom Trip
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
