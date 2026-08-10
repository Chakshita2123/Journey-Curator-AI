"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, User, Wallet, Compass, Map, Sparkles, RefreshCcw } from "lucide-react";
import { useUserJourney } from "@/context/UserJourneyContext";
import { motion, TiltCard } from "@/components/motion";

export const STEPS_DATA = [
  { step: 1, title: "Travel Persona", icon: User, href: "/persona", emoji: "🧠", desc: "Discover your travel style & preferences" },
  { step: 2, title: "Cost Predictor", icon: Wallet, href: "/predict", emoji: "💰", desc: "Predict total trip cost with XGBoost ML" },
  { step: 3, title: "Discover Spots", icon: Compass, href: "/discover", emoji: "🌏", desc: "Explore 13,000+ AI-ranked destinations" },
  { step: 4, title: "AI Itinerary", icon: Map, href: "/itinerary", emoji: "🗺️", desc: "Generate custom day-by-day itineraries" },
];

/**
 * Top Breadcrumb Progress Stepper for Tool Pages
 */
export function JourneyBreadcrumb({ currentStep }: { currentStep: 1 | 2 | 3 | 4 }) {
  const { journey } = useUserJourney();

  return (
    <div className="max-w-4xl mx-auto mb-8 px-4">
      {/* Top Banner Status */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">
          <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-coral-light)] text-[var(--color-coral)]">
            Step {currentStep} of 4
          </span>
          <span>· Connected Travel Journey</span>
        </div>

        {/* Saved Session Info Badges */}
        <div className="flex items-center gap-2 text-xs flex-wrap justify-center">
          {journey.persona && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0EB] text-[#E05A36] font-bold border border-[#FF9776]/30 shadow-xs">
              🎭 {journey.persona.persona}
            </span>
          )}
          {journey.tripCost && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-teal-light)] text-[var(--color-teal-dark)] font-bold border border-[var(--color-teal)]/20 shadow-xs">
              💰 ${journey.tripCost.predicted_cost.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Visual Connecting Stepper Line */}
      <div className="grid grid-cols-4 gap-2 relative">
        {STEPS_DATA.map(({ step, title, href, icon: Icon }) => {
          const isDone = step < currentStep;
          const isActive = step === currentStep;

          return (
            <Link key={step} href={href} className="group flex flex-col items-center text-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isActive
                    ? "coral-gradient text-white scale-110 shadow-coral ring-4 ring-[var(--color-coral-light)]"
                    : isDone
                    ? "bg-[var(--color-teal)] text-white shadow-teal"
                    : "bg-white border-2 border-[var(--color-border-mid)] text-[var(--color-muted)] group-hover:border-[var(--color-coral)]"
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : step}
              </div>
              <span
                className={`mt-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "text-[var(--color-coral)] font-bold"
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
export function JourneyNextStep({ currentStep }: { currentStep: 1 | 2 | 3 | 4 }) {
  const { journey } = useUserJourney();

  const nextStepData = {
    1: {
      stepNum: 2,
      title: "Step 2: Predict Your Trip Cost 💰",
      desc: journey.persona
        ? `Use your ${journey.persona.persona} persona to calculate exact global trip costs & savings.`
        : "Get an instant XGBoost ML cost estimation for your next destination.",
      href: "/predict",
      btnText: "Continue to Cost Predictor",
    },
    2: {
      stepNum: 3,
      title: "Step 3: Discover Destination Spots 🌏",
      desc: "Explore 13,000+ attractions curated by AI to match your travel style & budget.",
      href: "/discover",
      btnText: "Explore Top Destinations",
    },
    3: {
      stepNum: 4,
      title: "Step 4: Generate Day-by-Day Itinerary 🗺️",
      desc: "Craft a full AI itinerary with restaurant picks, daily routes, and weather tips.",
      href: "/itinerary",
      btnText: "Generate My Itinerary",
    },
    4: {
      stepNum: 1,
      title: "Journey Complete! Plan Another Trip 🎉",
      desc: "Retake the quiz with a different vibe or explore custom route costs.",
      href: "/persona",
      btnText: "Retake Persona Quiz",
    },
  }[currentStep];

  return (
    <motion.section
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="mt-12 max-w-2xl mx-auto px-4"
    >
      <div
        className="card p-7 text-center relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #EEECFC 0%, #F4F2FA 50%, #FFF0EB 100%)",
          border: "1.5px solid rgba(108,92,231,0.18)",
          boxShadow: "0 12px 32px rgba(108,92,231,0.10)",
        }}
      >
        <span className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white text-[var(--color-coral)] border border-[var(--color-coral)]/20 mb-3 shadow-xs">
          Next Step in Your Journey
        </span>

        <h3 className="font-heading font-700 text-xl text-[var(--color-text)] mb-1">
          {nextStepData.title}
        </h3>
        <p className="text-sm text-[var(--color-muted)] mb-5 leading-relaxed font-medium">
          {nextStepData.desc}
        </p>

        <Link
          href={nextStepData.href}
          id={`next-step-btn-${currentStep}`}
          className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-semibold text-white btn-3d-primary btn-shimmer"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          {nextStepData.btnText}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.section>
  );
}

/**
 * Homepage visual 4-Step Journey Map Section
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
          Guided 4-Step Travel Blueprint
        </span>
        <h2 className="font-heading font-800 text-3xl md:text-4xl text-[var(--color-text)] mb-3">
          Your Connected <span className="coral-text">Travel Journey</span>
        </h2>
        <p className="text-[var(--color-muted)] max-w-lg mx-auto font-medium">
          Follow 4 simple steps to unlock complete travel clarity — from persona matching to full day-by-day plans.
        </p>
      </motion.div>

      {/* 4 Steps Grid with Connecting Line */}
      <div className="grid md:grid-cols-4 gap-6 relative">
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
