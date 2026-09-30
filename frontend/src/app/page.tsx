"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import FeatureCards from "@/components/FeatureCards";
import { Sparkles, ArrowRight, Globe, Plane, Compass, MapPin, TrendingDown, X } from "lucide-react";
import { motion, TiltCard, CursorGlow, CountUpNumber, MagneticCard } from "@/components/motion";
import dynamic from "next/dynamic";
import { JourneyMap } from "@/components/JourneyFlow";
import Hero3DScene from "@/components/Hero3DScene";
import { useSession } from "next-auth/react";

function GuestNudgeBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { data: session } = useSession();

  if (session || dismissed) return null;

  return (
    <div className="pt-20 px-6 max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-teal-500/10 via-indigo-500/10 to-coral-500/10 border border-[var(--color-border-mid)] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium text-[var(--color-text)] flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-base flex-shrink-0">💡</span>
          <span>
            <strong>Welcome traveler!</strong> Explore freely or sign in anytime to save your custom itineraries &amp; access them across devices.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-black/5 transition-colors flex-shrink-0"
          aria-label="Dismiss message"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

const InteractiveDestinationMap = dynamic(
  () => import("@/components/InteractiveDestinationMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[480px] max-w-6xl mx-auto my-12 rounded-3xl skeleton" />
    ),
  }
);

const SampleItineraryShowcase = dynamic(
  () => import("@/components/SampleItineraryShowcase"),
  { ssr: false }
);

const STATS = [
  { target: 3,     decimals: 0, prefix: "",  suffix: "",   label: "AI Models",    emoji: "🤖", badge: "XGBoost + RF" },
  { target: 0.94,  decimals: 2, prefix: "",  suffix: "",   label: "R² Accuracy",  emoji: "🎯", badge: "94% Precision" },
  { target: 13,    decimals: 0, prefix: "",  suffix: "K+", label: "Destinations", emoji: "🌏", badge: "India + Global" },
  { target: 138,   decimals: 0, prefix: "",  suffix: "",   label: "Global Routes", emoji: "✈️", badge: "Trained Pipelines" },
];

const SOCIAL_PROOF = [
  { flag: "🇫🇷", dest: "Paris", cost: "$1,850", days: "7 days", rotate: "-2deg" },
  { flag: "🇯🇵", dest: "Tokyo", cost: "$2,100", days: "10 days", rotate: "3deg" },
  { flag: "🇧🇷", dest: "Rio",   cost: "$1,450", days: "7 days", rotate: "-3deg" },
  { flag: "🇦🇺", dest: "Sydney",cost: "$2,350", days: "10 days", rotate: "2deg" },
  { flag: "🇮🇳", dest: "Bali",  cost: "$1,200", days: "8 days", rotate: "-1deg" },
];

export default function HomePage() {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      setMouseOffset({
        x: ((e.clientX - cx) / cx) * 12,
        y: ((e.clientY - cy) / cy) * 12,
      });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <>
      <CursorGlow />
      <Navbar />
      <GuestNudgeBanner />

      <main className="relative overflow-hidden">
        {/* ── Multi-Layered Animated Gradient Mesh Background ── */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          {/* Indigo Blob */}
          <div
            className="absolute -top-32 -right-32 w-[580px] h-[580px] rounded-full opacity-25 blur-3xl animate-mesh"
            style={{
              background: "radial-gradient(circle, #6C5CE7 0%, rgba(108,92,231,0) 70%)",
              transform: `translate3d(${mouseOffset.x * -1.2}px, ${mouseOffset.y * -1.2}px, 0)`,
            }}
          />
          {/* Teal Blob */}
          <div
            className="absolute top-1/3 -left-28 w-[480px] h-[480px] rounded-full opacity-20 blur-3xl animate-mesh"
            style={{
              background: "radial-gradient(circle, #00B894 0%, rgba(0,184,148,0) 70%)",
              animationDelay: "4s",
              transform: `translate3d(${mouseOffset.x * 1.5}px, ${mouseOffset.y * 1.5}px, 0)`,
            }}
          />
          {/* Warm Peach Accent Blob (3rd Accent) */}
          <div
            className="absolute -bottom-20 right-1/4 w-[420px] h-[420px] rounded-full opacity-18 blur-3xl animate-mesh"
            style={{
              background: "radial-gradient(circle, #FF9776 0%, rgba(255,151,118,0) 70%)",
              animationDelay: "8s",
              transform: `translate3d(${mouseOffset.x * -0.8}px, ${mouseOffset.y * -0.8}px, 0)`,
            }}
          />
        </div>

        {/* ── Hero Background Ambient Destination Collage with Ken Burns ── */}
        <div className="pointer-events-none absolute top-0 inset-x-0 h-[680px] overflow-hidden -z-10 opacity-12">
          <img
            src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1600&q=80"
            alt="Hero Background Travel Collage"
            className="w-full h-full object-cover animate-kenburns"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#F4F2FA]/60 via-[#F4F2FA]/85 to-[#F4F2FA]" />
        </div>

        {/* ── Hero Section (Asymmetric 60/40 Editorial Split) ── */}
        <section className="relative px-6 sm:px-8 pt-24 lg:pt-32 pb-16 max-w-7xl mx-auto">
          {/* Blueprint Grid Watermark in Background */}
          <div className="absolute inset-0 bg-blueprint-grid opacity-25 pointer-events-none -z-10" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* ── Left Column: Oversized Typography & Action Stack (7 cols) ── */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              
              {/* Top Badge with Solid Accent */}
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md border border-[var(--color-border-mid)] text-xs sm:text-sm font-semibold text-[var(--color-text)] mb-6 shadow-sm"
              >
                <Globe className="w-4 h-4 text-[var(--color-coral)]" />
                <span>Global Travel Cost AI · XGBoost Regressor</span>
                <span className="badge-solid-coral px-2.5 py-0.5 rounded-full text-[11px]">
                  ★ R² 0.94
                </span>
              </motion.div>

              {/* Oversized Display Headline (80-100px scale on desktop) */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.15 }}
                className="font-display font-[900] text-5xl sm:text-7xl lg:text-[5.5rem] xl:text-[6.25rem] leading-[0.92] tracking-super-tight text-[var(--color-text)] mb-6"
              >
                Plan Your <br className="hidden sm:inline" />
                Dream Trip. <br />
                <span className="headline-accent-underline text-[var(--color-text)]">
                  Know the Cost.
                </span> <br />
                <span className="peach-text">Travel Smarter.</span>
              </motion.h1>

              {/* Subtext — High Weight Contrast (Light body vs Ultra-Black display) */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.3 }}
                className="text-base sm:text-lg lg:text-xl text-[var(--color-muted)] max-w-xl leading-relaxed font-normal mb-8"
              >
                Instant machine-learning budget predictions across global routes, combined with AI-curated itineraries and 13,000+ top Indian attractions.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.45 }}
                className="flex flex-wrap gap-4 items-center"
              >
                <Link
                  href="/discover"
                  id="hero-start-journey-btn"
                  className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-white btn-3d-primary btn-shimmer text-base shadow-coral"
                >
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  Start 3-Step Blueprint
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/predict"
                  id="hero-predict-btn"
                  className="flex items-center gap-2.5 px-7 py-4 rounded-2xl font-bold btn-3d-secondary btn-shimmer text-base"
                >
                  💰 Predict Trip Cost
                </Link>
              </motion.div>

              {/* ── High-Density Micro-Stats Strip (Anchored directly under Hero) ── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.55 }}
                className="w-full max-w-2xl mt-10 p-4 sm:p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-[var(--color-border-mid)] shadow-soft grid grid-cols-2 sm:grid-cols-4 gap-4"
              >
                {STATS.map(({ target, decimals, prefix, suffix, label, emoji, badge }) => (
                  <div key={label} className="flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base">{emoji}</span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#FFF0EB] text-[#E05A36] border border-[#FF9776]/30">
                        {badge}
                      </span>
                    </div>
                    <p className="font-display font-[800] text-2xl text-[var(--color-text)]">
                      <CountUpNumber target={target} decimals={decimals} prefix={prefix} suffix={suffix} />
                    </p>
                    <p className="text-[11px] text-[var(--color-muted)] font-semibold mt-0.5">{label}</p>
                  </div>
                ))}
              </motion.div>

            </div>

            {/* ── Right Column: Visual Stage with Breakout Collage (5 cols) ── */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              <Hero3DScene />
            </div>

          </div>
        </section>

        {/* ── Interactive Destination Map (Phase 4 Recommender) ── */}
        <InteractiveDestinationMap />

        {/* ── Visual 4-Step Journey Map ────────────────────── */}
        <JourneyMap />

        {/* ── Feature Cards Section (Asymmetric Bento Grid) ─── */}
        <section className="px-6 md:px-12 pb-24 max-w-7xl mx-auto">
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
          >
            <div>
              <span className="badge-solid-coral inline-block text-xs font-extrabold tracking-wider uppercase px-3.5 py-1 rounded-full mb-3">
                Complete AI Travel Suite
              </span>
              <h2 className="font-display font-[800] text-3xl sm:text-5xl text-[var(--color-text)] tracking-tight">
                Everything you need to{" "}
                <span className="headline-accent-underline-teal text-[var(--color-text)]">travel smarter</span>
              </h2>
            </div>
            <p className="text-[var(--color-muted)] text-sm sm:text-base max-w-md font-normal leading-relaxed">
              Three intelligent ML &amp; LLM engines. One unified workspace. Zero guesswork for your next adventure.
            </p>
          </motion.div>
          <FeatureCards />
        </section>

        {/* ── Sample Itinerary Showcase (Phase 5 LLM Output) ──── */}
        <SampleItineraryShowcase />

        {/* ── Bottom CTA Strip (Punchy Saturated Midnight-Gradient Box) ── */}
        <section className="px-6 pb-24">
          <motion.div
            whileInView={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.95 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden bg-saturated-midnight text-white border border-indigo-400/30 shadow-2xl"
          >
            {/* Ambient Radial Color Flares */}
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#6C5CE7]/35 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#00B894]/30 blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-blueprint-grid-dark opacity-15 pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-extrabold text-[#55EFC4] mb-5 border border-white/15">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Free Instant ML Estimation
              </div>
              <h2 className="font-display font-[900] text-3xl sm:text-5xl text-white tracking-tight mb-4">
                Ready to plan your next adventure?
              </h2>
              <p className="text-indigo-200/80 text-base sm:text-lg mb-8 max-w-xl mx-auto font-normal leading-relaxed">
                Get an AI-powered cost estimate and custom itinerary with precise budget breakdown in under 60 seconds.
              </p>
              <Link
                href="/predict"
                id="bottom-predict-btn"
                className="inline-flex items-center gap-2.5 px-10 py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-[#6C5CE7] to-[#00B894] hover:opacity-95 shadow-coral text-base transition-transform duration-200 hover:scale-105"
              >
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                Start Predicting — It&apos;s Free
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
    </>
  );
}
