"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, User, Wallet, Compass, Map, Sparkles, RefreshCcw } from "lucide-react";
import { useUserJourney } from "@/context/UserJourneyContext";
import { motion, TiltCard } from "@/components/motion";

export const STEPS_DATA = [
  { step: 1, title: "Discover Spots", icon: Compass, href: "/discover", emoji: "🌏", desc: "Explore AI-ranked destinations in India" },
  { step: 2, title: "AI Itinerary", icon: Map, href: "/itinerary", emoji: "🗺️", desc: "Generate pre-filled day-by-day plans" },
  { step: 3, title: "Cost Predictor", icon: Wallet, href: "/predict", emoji: "💰", desc: "Predict total trip cost & check budget" },
];

/**
 * Top Breadcrumb Progress Stepper for Tool Pages
 */
export function JourneyBreadcrumb({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  const { journey } = useUserJourney();

  return (
    <div className="max-w-3xl mx-auto mb-10 px-2 sm:px-0">
      {/* Top Banner Status */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 pb-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">
          <span className="badge-solid-coral px-3 py-0.5 rounded-full text-[11px]">
            Step 0{currentStep} of 03
          </span>
          <span className="text-[var(--color-text)] font-extrabold">· Connected Journey Flow</span>
        </div>

        {/* Saved Session Info Badges */}
        <div className="flex items-center gap-2 text-xs flex-wrap justify-center">
          {journey.selectedDestination && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EEECFC] text-[#6C5CE7] font-extrabold border border-[#6C5CE7]/25 shadow-xs">
              📍 {journey.selectedDestination}
            </span>
          )}
          {journey.tripCost && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E6F8F4] text-[#008F73] font-extrabold border border-[#00B894]/30 shadow-xs">
              💰 ₹{journey.tripCost.predicted_cost.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>

      {/* Visual Connecting Stepper Line */}
      <div className="grid grid-cols-3 gap-3 relative max-w-xl mx-auto">
        {STEPS_DATA.map(({ step, title, href }) => {
          const isDone = step < currentStep;
          const isActive = step === currentStep;

          return (
            <Link key={step} href={href} className="group flex flex-col items-center text-center">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isActive
                    ? "coral-gradient text-white scale-110 shadow-coral ring-4 ring-[#6C5CE7]/20 font-extrabold"
                    : isDone
                    ? "bg-[var(--color-teal)] text-white shadow-teal"
                    : "bg-white border-2 border-[var(--color-border-mid)] text-[var(--color-muted)] group-hover:border-[var(--color-coral)]"
                }`}
              >
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : `0${step}`}
              </div>
              <span
                className={`mt-2 text-xs font-bold font-display tracking-tight transition-colors ${
                  isActive
                    ? "text-[var(--color-coral)] font-extrabold"
                    : isDone
                    ? "text-[var(--color-teal-dark)]"
                    : "text-[var(--color-muted)] group-hover:text-[var(--color-text)]"
                }`}
              >
                {title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Bottom Next Step CTA for Tool Pages
 */
export function JourneyNextStep({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  const { journey } = useUserJourney();

  const nextStepData = {
    1: {
      stepNum: 2,
      badge: "Next Step 02",
      title: "Generate Day-by-Day Itinerary 🗺️",
      desc: journey.selectedDestination
        ? `Generate a tailored AI itinerary for your selected destination: ${journey.selectedDestination}.`
        : "Generate a custom day-by-day itinerary with daily routes & weather notes.",
      href: "/itinerary",
      btnText: journey.selectedDestination ? `Generate Itinerary for ${journey.selectedDestination}` : "Continue to AI Itinerary",
    },
    2: {
      stepNum: 3,
      badge: "Next Step 03",
      title: "Predict & Optimize Trip Cost 💰",
      desc: journey.selectedDestination
        ? `Calculate total estimated cost and check budget for your trip to ${journey.selectedDestination}.`
        : "Predict trip cost with XGBoost ML model and get budget optimization tips.",
      href: "/predict",
      btnText: "Continue to Cost Predictor (Pre-filled)",
    },
    3: {
      stepNum: 1,
      badge: "✨ Full Journey Complete",
      title: "Journey Complete! Plan Another Trip 🎉",
      desc: "You've successfully explored destinations, generated custom itineraries, and predicted trip costs. Ready for your next route?",
      href: "/discover",
      btnText: "Explore More Destinations",
    },
  }[currentStep];

  if (!nextStepData) return null;

  const isComplete = currentStep === 3;

  return (
    <motion.section
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="mt-14 max-w-3xl mx-auto px-2 sm:px-0"
    >
      <div
        className={`rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl transition-all ${
          isComplete
            ? "bg-[#0D0A24] text-white border border-indigo-500/30"
            : "bg-white text-[var(--color-text)] border border-[var(--color-border-mid)] shadow-lg"
        }`}
      >
        {/* Background Decorative Pattern & Radiant Ambient Glow for Complete State */}
        {isComplete && (
          <>
            <div className="absolute inset-0 bg-blueprint-grid-dark opacity-15 pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#6C5CE7]/30 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#00B894]/25 blur-3xl pointer-events-none" />
          </>
        )}

        <div className="relative z-10 flex flex-col items-center">
          {/* Badge */}
          <div className="mb-4">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-sm ${
                isComplete
                  ? "badge-solid-coral"
                  : "bg-[var(--color-coral-light)] text-[var(--color-coral)] border border-[var(--color-coral)]/20"
              }`}
            >
              {nextStepData.badge}
            </span>
          </div>

          {/* Heading — High Contrast & No Overlap */}
          <h3
            className={`font-display font-[900] text-2xl sm:text-4xl tracking-tight leading-snug mb-3 ${
              isComplete ? "text-white" : "text-[var(--color-text)]"
            }`}
          >
            {nextStepData.title}
          </h3>
          
          {/* Subtext — High Contrast & Readable */}
          <p
            className={`text-sm sm:text-base mb-8 leading-relaxed font-normal max-w-xl mx-auto ${
              isComplete ? "text-white/90" : "text-[var(--color-muted)]"
            }`}
          >
            {nextStepData.desc}
          </p>

          {/* CTA Action Button */}
          <Link
            href={nextStepData.href}
            id={`next-step-btn-${currentStep}`}
            className="inline-flex items-center gap-2.5 px-9 py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-[#6C5CE7] to-[#00B894] hover:opacity-95 shadow-coral text-base hover:scale-105 transition-transform"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{nextStepData.btnText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.section>
  );
}

/**
 * Homepage visual 3-Step Journey Map Section
 */
export function JourneyMap() {
  return (
    <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
      <motion.div
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-14"
      >
        <span className="inline-block text-xs font-bold tracking-widest uppercase px-3.5 py-1 rounded-full bg-[#FFF0EB] text-[#E05A36] mb-3 border border-[#FF9776]/30">
          Guided 3-Step Travel Blueprint
        </span>
        <h2 className="font-heading font-800 text-3xl md:text-4xl text-[var(--color-text)] mb-3">
          Your Connected <span className="coral-text">Travel Journey</span>
        </h2>
        <p className="text-[var(--color-muted)] max-w-lg mx-auto font-medium">
          Follow 3 simple steps for complete trip clarity — from destination discovery to day-by-day itineraries and ML cost predictions.
        </p>
      </motion.div>

      {/* 3 Steps Grid with Connecting Line */}
      <div className="grid md:grid-cols-3 gap-6 relative">
        {STEPS_DATA.map(({ step, title, href, emoji, desc }, index) => (
          <motion.div
            key={step}
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 24 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link href={href} id={`journey-map-step-${step}`} className="block h-full group">
              <TiltCard maxTilt={6} className="card p-6 h-full flex flex-col justify-between border-t border-white/90 relative">
                {/* Step badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-full coral-gradient text-white flex items-center justify-center font-heading font-800 text-sm shadow-coral">
                    {step}
                  </span>
                  <span className="text-3xl group-hover:animate-wiggle">{emoji}</span>
                </div>

                <div>
                  <h3 className="font-heading font-700 text-lg text-[var(--color-text)] mb-1 group-hover:text-[var(--color-coral)] transition-colors">
                    {title}
                  </h3>
                  <p className="text-xs text-[var(--color-muted)] leading-relaxed font-medium mb-4">
                    {desc}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-coral)] group-hover:gap-2.5 transition-all">
                  Start Step {step}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </TiltCard>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
