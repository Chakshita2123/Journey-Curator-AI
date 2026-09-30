"use client";

import Navbar from "@/components/Navbar";
import PredictForm from "@/components/PredictForm";
import { motion } from "@/components/motion";
import { JourneyBreadcrumb, JourneyNextStep } from "@/components/JourneyFlow";
import { Sparkles, Globe, Cpu, ShieldCheck } from "lucide-react";

export default function PredictPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-dvh pt-24 sm:pt-28 pb-20 px-4 sm:px-6 relative overflow-hidden">
        {/* Subtle Background Blueprint Pattern & Gradient Flares */}
        <div className="absolute inset-0 bg-blueprint-grid opacity-20 pointer-events-none -z-10" />
        <div
          className="pointer-events-none fixed top-16 right-0 w-[460px] h-[380px] rounded-full blur-3xl opacity-25 -z-10 animate-mesh"
          style={{ background: "radial-gradient(ellipse, #6C5CE7, transparent 70%)" }}
        />
        <div
          className="pointer-events-none fixed bottom-10 left-0 w-[400px] h-[360px] rounded-full blur-3xl opacity-20 -z-10 animate-mesh"
          style={{ background: "radial-gradient(ellipse, #00B894, transparent 70%)", animationDelay: "4s" }}
        />

        {/* Top Step Breadcrumb */}
        <JourneyBreadcrumb currentStep={3} />

        {/* ── Bold Editorial Header Section (Asymmetric Left-Aligned) ── */}
        <div className="max-w-3xl mx-auto mb-10 text-left">
          {/* Integrated High-Contrast Badge Cluster */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="flex flex-wrap items-center gap-2.5 mb-6"
          >
            <span className="badge-solid-coral inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold shadow-sm">
              <Cpu className="w-3.5 h-3.5" />
              XGBoost ML Regressor
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-[#E6F8F4] text-[#008F73] border border-[#00B894]/30 shadow-xs">
              <Globe className="w-3.5 h-3.5 text-[#00B894]" />
              Works Worldwide · 138+ Routes
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white text-[var(--color-muted)] border border-[var(--color-border-mid)] shadow-xs">
              ★ R² 0.94 Precision
            </span>
          </motion.div>

          {/* Oversized Display Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display font-[900] text-4xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-super-tight text-[var(--color-text)] mb-4"
          >
            Predict Your <br />
            <span className="headline-accent-underline text-[var(--color-text)]">
              Trip Cost.
            </span>{" "}
            <span className="peach-text">Zero Guesswork.</span>
          </motion.h1>

          {/* High-Contrast Body Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-[var(--color-muted)] max-w-xl font-normal leading-relaxed"
          >
            Instant ML predictions for flights, stay, and daily expenses — pre-filled from your itinerary with automatic budget optimization.
          </motion.p>
        </div>

        {/* ── Form Card ── */}
        <PredictForm />

        {/* ── Bottom Next Step CTA ── */}
        <JourneyNextStep currentStep={3} />
      </main>
    </>
  );
}
