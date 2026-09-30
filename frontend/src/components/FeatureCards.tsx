"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp, Map, Compass, Sparkles, CheckCircle2, ShieldAlert, Cpu, ArrowUpRight } from "lucide-react";
import { motion, TiltCard } from "@/components/motion";

export default function FeatureCards() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* ── Left Column: Large Saturated Midnight Featured Card (7 cols) ── */}
      <motion.div
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 28 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="lg:col-span-7 relative group"
      >
        {/* Breakout floating tag overlapping top boundary */}
        <div className="absolute -top-3.5 left-6 z-20">
          <span className="badge-solid-coral px-3.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-lg">
            <Cpu className="w-3.5 h-3.5 text-white" />
            Flagship ML Engine
          </span>
        </div>

        <Link href="/predict" id="feature-card-cost-predictor" className="block h-full">
          <TiltCard
            maxTilt={6}
            className="h-full rounded-3xl p-8 sm:p-10 bg-saturated-midnight text-white border border-indigo-500/25 shadow-2xl relative overflow-hidden flex flex-col justify-between group-hover:border-indigo-400/50 transition-all duration-300"
          >
            {/* Background Subtle Blueprint Dots */}
            <div className="absolute inset-0 bg-blueprint-grid-dark opacity-20 pointer-events-none" />
            
            {/* Ambient Radial Color Flares */}
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#6C5CE7]/30 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[#00B894]/25 blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-7 h-7 text-[#55EFC4]" />
                </div>
                <span className="px-3.5 py-1 rounded-full bg-[#00B894]/20 border border-[#00B894]/40 text-[#55EFC4] text-xs font-bold">
                  ★ R² 0.94 Precision
                </span>
              </div>

              <h3 className="font-display font-[800] text-3xl sm:text-4xl text-white tracking-tight leading-tight mb-3">
                Global Travel Cost Predictor
              </h3>
              
              <p className="text-indigo-200/80 text-sm sm:text-base font-normal max-w-lg leading-relaxed mb-8">
                Trained on real travel market pricing. Instant machine-learning estimations for flights, accommodation, food, and activities with automated savings opportunities.
              </p>

              {/* High-Contrast Interactive Simulator Card Preview */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 mb-8">
                <div className="flex items-center justify-between text-xs text-indigo-200 font-semibold mb-3">
                  <span className="flex items-center gap-1.5 text-white">
                    <span className="w-2 h-2 rounded-full bg-[#00B894] animate-pulse" />
                    Live ML Pipeline · India &amp; Global Routes
                  </span>
                  <span className="text-[#55EFC4]">XGBoost Regressor</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 rounded-xl bg-black/20 border border-white/5">
                    <p className="text-[10px] text-indigo-300/80 font-medium">Estimated Stay</p>
                    <p className="font-display font-bold text-base text-white mt-0.5">₹3,200/n</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/20 border border-white/5">
                    <p className="text-[10px] text-indigo-300/80 font-medium">Transport</p>
                    <p className="font-display font-bold text-base text-white mt-0.5">₹1,850</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/20 border border-white/5">
                    <p className="text-[10px] text-indigo-300/80 font-medium">Daily Food</p>
                    <p className="font-display font-bold text-base text-white mt-0.5">₹950</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA Row */}
            <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-xs text-indigo-200/70 font-medium">
                Over 138+ validated route models
              </span>
              <div className="flex items-center gap-2 text-sm font-extrabold text-[#55EFC4] group-hover:text-white transition-colors">
                <span>Predict Trip Now</span>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#55EFC4] group-hover:text-[#0D0A21] transition-colors">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </TiltCard>
        </Link>
      </motion.div>

      {/* ── Right Column: Staggered Asymmetrical Stack (5 cols) ── */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Card 2: AI Itinerary Planner */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 24 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="relative group flex-1"
        >
          <Link href="/itinerary" id="feature-card-itinerary-generator" className="block h-full">
            <TiltCard
              maxTilt={8}
              className="card h-full p-7 flex flex-col justify-between border-l-4 border-l-[var(--color-teal)] hover:border-[var(--color-teal)]/40 bg-white"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-teal-light)] flex items-center justify-center text-[var(--color-teal-dark)] group-hover:scale-110 transition-transform shadow-xs">
                    <Map className="w-6 h-6 text-[var(--color-teal)]" />
                  </div>
                  <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-[var(--color-teal-light)] text-[var(--color-teal-dark)] border border-[var(--color-teal)]/20">
                    ✨ AI Generator
                  </span>
                </div>

                <h3 className="font-display font-[800] text-2xl text-[var(--color-text)] tracking-tight mb-2">
                  Personalised Itinerary
                </h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed font-normal">
                  Day-by-day tailored travel schedules with smart timing, activity sequencing, and local tips adapted to your pace.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-[var(--color-border)] flex items-center justify-between text-xs font-bold text-[var(--color-teal-dark)]">
                <span>Build Custom Schedule</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </TiltCard>
          </Link>
        </motion.div>

        {/* Card 3: Destination Discover */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 24 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.22 }}
          className="relative group flex-1"
        >
          <Link href="/discover" id="feature-card-destination-discover" className="block h-full">
            <TiltCard
              maxTilt={8}
              className="card h-full p-7 flex flex-col justify-between border-l-4 border-l-[#FF5E36] hover:border-[#FF5E36]/40 bg-gradient-to-br from-white via-white to-[#FFF5F2]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF0EB] flex items-center justify-center text-[#D93810] group-hover:scale-110 transition-transform shadow-xs">
                    <Compass className="w-6 h-6 text-[#FF5E36]" />
                  </div>
                  <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-[#FFF0EB] text-[#D93810] border border-[#FF5E36]/30">
                    🔥 13,000+ Spots
                  </span>
                </div>

                <h3 className="font-display font-[800] text-2xl text-[var(--color-text)] tracking-tight mb-2">
                  Destination Discovery
                </h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed font-normal">
                  Explore curated attractions with AI-ranked ratings, persona matches, and authentic traveler reviews across India.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-[var(--color-border)] flex items-center justify-between text-xs font-bold text-[#D93810]">
                <span>Discover Attractions</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </TiltCard>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
