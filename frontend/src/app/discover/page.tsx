"use client";

import Navbar from "@/components/Navbar";
import { motion, TiltCard, CursorGlow } from "@/components/motion";
import { JourneyBreadcrumb, JourneyNextStep } from "@/components/JourneyFlow";

const PLACES = [
  { flag: "🇮🇳", name: "Taj Mahal",       city: "Agra",      category: "Historic",  rating: "4.9", fee: "₹250" },
  { flag: "🇮🇳", name: "Dal Lake",         city: "Srinagar",  category: "Natural",   rating: "4.8", fee: "₹200" },
  { flag: "🇮🇳", name: "Hawa Mahal",       city: "Jaipur",    category: "Historic",  rating: "4.5", fee: "₹75"  },
  { flag: "🇮🇳", name: "Kerala Backwaters",city: "Alleppey",  category: "Natural",   rating: "4.9", fee: "₹40"  },
  { flag: "🇮🇳", name: "Golden Temple",    city: "Amritsar",  category: "Religious", rating: "4.8", fee: "Free" },
  { flag: "🇮🇳", name: "Amber Fort",       city: "Jaipur",    category: "Historic",  rating: "4.8", fee: "₹50"  },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Historic:  { bg: "var(--color-coral-light)",  text: "var(--color-coral-dark)" },
  Natural:   { bg: "var(--color-teal-light)",   text: "var(--color-teal-dark)" },
  Religious: { bg: "var(--color-teal-light)", text: "var(--color-teal-dark)" },
  Cultural:  { bg: "var(--color-success-light)",text: "var(--color-success)" },
};

export default function DiscoverPage() {
  return (
    <>
      <CursorGlow />
      <Navbar />
      <main className="min-h-dvh pt-24 pb-20 px-6">
        {/* Animated Blob */}
        <div
          className="pointer-events-none fixed top-20 right-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-15 -z-10 animate-mesh"
          style={{ background: "radial-gradient(circle, #00B894, transparent 70%)" }}
        />

        {/* Top Step Breadcrumb */}
        <JourneyBreadcrumb currentStep={3} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-10"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 shadow-xs"
            style={{ background: "var(--color-teal-light)", color: "var(--color-teal-dark)" }}
          >
            ⚡ Phase 4 · 13,000+ Destinations · Step 3
          </div>
          <h1 className="font-heading font-800 text-4xl text-[var(--color-text)] leading-tight mb-3">
            Discover the World 🌏
          </h1>
          <p className="text-[var(--color-muted)] text-sm max-w-sm mx-auto leading-relaxed font-medium">
            AI-ranked recommendations starting with India&apos;s best — and expanding globally.
            Get personalised picks by season, crowd level, and your travel style.
          </p>
        </motion.div>

        {/* Preview cards with 3D Tilt & Staggered View Entrance */}
        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {PLACES.map((place, i) => {
            const cat = CATEGORY_COLORS[place.category] ?? CATEGORY_COLORS.Historic;
            return (
              <motion.div
                key={place.name}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <TiltCard maxTilt={7} className="card p-5 flex flex-col gap-3 h-full cursor-pointer select-none">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: cat.bg, color: cat.text }}
                    >
                      {place.category}
                    </span>
                    <span className="text-xs text-[var(--color-coral)] font-bold">★ {place.rating}</span>
                  </div>
                  <div>
                    <p className="font-heading font-700 text-[var(--color-text)] text-base">
                      {place.flag} {place.name}
                    </p>
                    <p className="text-xs text-[var(--color-muted)] mt-0.5">{place.city}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs font-medium text-[var(--color-muted)]">Entry: {place.fee}</span>
                    <div className="skeleton h-3 w-14 rounded-lg" />
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>

        {/* Info card */}
        <motion.div
          whileInView={{ opacity: 1, scale: 1 }}
          initial={{ opacity: 0, scale: 0.95 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto card p-6 text-center shadow-soft"
          style={{ border: "1.5px solid rgba(108,92,231,0.20)" }}
        >
          <p className="text-3xl mb-3 animate-bounce">🧭</p>
          <p className="font-heading font-700 text-[var(--color-text)] mb-2">India-Inclusive, Globally Extensible</p>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed">
            The Recommender starts with a rich{" "}
            <span className="font-semibold text-[var(--color-text)]">13,000-row Indian dataset</span>{" "}
            and is architected to integrate global destination data in future phases.
          </p>
        </motion.div>

        {/* Bottom Next Step CTA */}
        <JourneyNextStep currentStep={3} />
      </main>
    </>
  );
}
