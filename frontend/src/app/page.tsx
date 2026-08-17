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

        {/* ── Hero Section ──────────────────────────────────── */}
        <section className="relative flex flex-col items-center justify-center px-6 pt-28 pb-12 text-center max-w-6xl mx-auto">
          
          {/* Top Badge with Warm Peach Highlight */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-[var(--color-border)] text-sm font-medium text-[var(--color-muted)] mb-8 shadow-soft"
          >
            <Globe className="w-4 h-4 text-[var(--color-teal)] animate-idle" />
            Global Trip Cost AI · XGBoost ML Model
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#FFF0EB] text-[#E05A36] border border-[#FF9776]/30">
              ★ R² 0.94
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="font-heading font-900 text-5xl md:text-7xl leading-[1.1] tracking-tight max-w-4xl text-[var(--color-text)]"
          >
            Plan Your Dream Trip.{" "}
            <span className="coral-text">Know the Cost.</span>{" "}
            <span className="peach-text">Travel Smarter.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="mt-6 text-lg md:text-xl text-[var(--color-muted)] max-w-2xl leading-relaxed font-medium"
          >
            Predict your trip cost anywhere in the world — and discover India&apos;s best destinations with AI-curated recommendations.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.45 }}
            className="mt-10 flex flex-wrap gap-4 justify-center"
          >
            <Link
              href="/discover"
              id="hero-start-journey-btn"
              className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-semibold text-white btn-3d-primary btn-shimmer text-base"
            >
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              Start 3-Step Journey Blueprint
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/predict"
              id="hero-predict-btn"
              className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-semibold btn-3d-secondary btn-shimmer text-base"
            >
              💰 Predict Trip Cost
            </Link>
          </motion.div>

          {/* Signature 3D Parallax Hero Scene */}
          <Hero3DScene />
        </section>

        {/* ── Stats Section (Scroll Animated Count-Up Numbers) ─ */}
        <section className="px-6 pb-20">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-5">
            {STATS.map(({ target, decimals, prefix, suffix, label, emoji, badge }, i) => (
              <motion.div
                key={label}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 24 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
              >
                <MagneticCard pullStrength={6} className="card p-6 text-center cursor-default group h-full">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl group-hover:scale-110 transition-transform">{emoji}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF0EB] text-[#E05A36] border border-[#FF9776]/30">
                      {badge}
                    </span>
                  </div>
                  <p className="font-heading font-900 text-4xl coral-text">
                    <CountUpNumber target={target} decimals={decimals} prefix={prefix} suffix={suffix} />
                  </p>
                  <p className="text-xs text-[var(--color-muted)] mt-1.5 font-semibold leading-tight">{label}</p>
                </MagneticCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Interactive Destination Map (Phase 4 Recommender) ── */}
        <InteractiveDestinationMap />

        {/* ── Visual 4-Step Journey Map ────────────────────── */}
        <JourneyMap />

        {/* ── Feature Cards Section (3D Rotate Entrance) ─────── */}
        <section className="px-6 md:px-12 pb-24 max-w-6xl mx-auto">
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="inline-block text-xs font-bold tracking-widest uppercase px-3.5 py-1 rounded-full bg-[#FFF0EB] text-[#E05A36] mb-3 border border-[#FF9776]/30">
              Complete AI Travel Suite
            </span>
            <h2 className="font-heading font-700 text-3xl md:text-4xl text-[var(--color-text)] mb-3">
              Everything you need to{" "}
              <span className="teal-text">travel smarter</span>
            </h2>
            <p className="text-[var(--color-muted)] max-w-md mx-auto font-medium">
              Three intelligent ML & LLM tools. One seamless experience. Zero guesswork.
            </p>
          </motion.div>
          <FeatureCards />
        </section>

        {/* ── Sample Itinerary Showcase (Phase 5 LLM Output) ──── */}
        <SampleItineraryShowcase />

        {/* ── Bottom CTA Strip (Elevated Soft 3D Box) ───────── */}
        <section className="px-6 pb-24">
          <motion.div
            whileInView={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.95 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto rounded-3xl p-12 text-center relative overflow-hidden card"
            style={{
              background: "linear-gradient(135deg, #EEECFC 0%, #F4F2FA 40%, #FFF0EB 75%, #E6F8F4 100%)",
              border: "1.5px solid rgba(108,92,231,0.18)",
              boxShadow: "0 20px 50px rgba(108,92,231,0.16)",
            }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 text-xs font-bold text-[var(--color-coral)] mb-4 shadow-xs border border-[var(--color-coral)]/20">
              ✨ Free Instant AI Prediction
            </div>
            <h2 className="font-heading font-800 text-3xl md:text-4xl text-[var(--color-text)] mb-3">
              Ready to plan your next adventure?
            </h2>
            <p className="text-[var(--color-muted)] mb-8 max-w-lg mx-auto font-medium">
              Get an AI-powered cost estimate and custom itinerary in under 60 seconds.
            </p>
            <Link
              href="/predict"
              id="bottom-predict-btn"
              className="inline-flex items-center gap-2.5 px-9 py-4 rounded-2xl font-semibold text-white btn-3d-primary btn-shimmer text-base"
            >
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              Start Predicting — It&apos;s Free
            </Link>
          </motion.div>
        </section>
      </main>
    </>
  );
}
