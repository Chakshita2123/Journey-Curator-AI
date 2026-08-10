"use client";

import Navbar from "@/components/Navbar";
import { motion, TiltCard, CursorGlow } from "@/components/motion";
import { JourneyBreadcrumb, JourneyNextStep } from "@/components/JourneyFlow";

const PLACES = [
  {
    flag: "🕌",
    name: "Taj Mahal",
    city: "Agra",
    category: "Historic",
    rating: "4.9",
    fee: "₹250",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80",
  },
  {
    flag: "🚣",
    name: "Dal Lake",
    city: "Srinagar",
    category: "Natural",
    rating: "4.8",
    fee: "Free",
    image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=600&q=80",
  },
  {
    flag: "🏰",
    name: "Hawa Mahal",
    city: "Jaipur",
    category: "Historic",
    rating: "4.5",
    fee: "₹75",
    image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=600&q=80",
  },
  {
    flag: "🌴",
    name: "Kerala Backwaters",
    city: "Alleppey",
    category: "Natural",
    rating: "4.9",
    fee: "Free",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80",
  },
  {
    flag: "🛕",
    name: "Golden Temple",
    city: "Amritsar",
    category: "Religious",
    rating: "4.9",
    fee: "Free",
    image: "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?auto=format&fit=crop&w=600&q=80",
  },
  {
    flag: "🏰",
    name: "Amber Fort",
    city: "Jaipur",
    category: "Historic",
    rating: "4.8",
    fee: "₹50",
    image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=600&q=80",
  },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Historic:  { bg: "var(--color-coral-light)",  text: "var(--color-coral-dark)" },
  Natural:   { bg: "var(--color-teal-light)",   text: "var(--color-teal-dark)" },
  Religious: { bg: "var(--color-peach-light)", text: "var(--color-peach-dark)" },
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
            🇮🇳 Phase 4 Recommender · India Dataset (Expanding Globally) · Step 3
          </div>
          <h1 className="font-heading font-800 text-4xl text-[var(--color-text)] leading-tight mb-3">
            Discover India&apos;s Destinations 🇮🇳
          </h1>
          <p className="text-[var(--color-muted)] text-sm max-w-md mx-auto leading-relaxed font-medium">
            AI-ranked recommendations currently focused on India&apos;s top tourist places — with architecture built for global expansion in upcoming phases.
          </p>
        </motion.div>

        {/* Preview cards with 3D Tilt & Image Zoom */}
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-5 mb-12">
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
                <TiltCard maxTilt={7} className="card overflow-hidden flex flex-col h-full cursor-pointer select-none border border-[var(--color-border)] shadow-soft group">
                  {/* Real Photo Card Header */}
                  <div className="h-36 w-full relative overflow-hidden img-card-container indigo-duotone-overlay">
                    <img
                      src={place.image}
                      alt={place.name}
                      className="w-full h-full object-cover img-card-zoom"
                    />
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs"
                        style={{ background: "rgba(255,255,255,0.95)", color: cat.text }}
                      >
                        {place.category}
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 shadow-xs">
                        ★ {place.rating}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 flex flex-col flex-1 justify-between gap-3 bg-white">
                    <div>
                      <p className="font-heading font-700 text-[var(--color-text)] text-base leading-snug group-hover:text-[var(--color-coral)] transition-colors">
                        {place.flag} {place.name}
                      </p>
                      <p className="text-xs text-[var(--color-muted)] font-medium mt-0.5">{place.city}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-[var(--color-border)]">
                      <span className="text-xs font-semibold text-[var(--color-muted)]">Entry: <strong className="text-[var(--color-text)]">{place.fee}</strong></span>
                      <span className="text-xs font-bold text-[var(--color-coral)] group-hover:translate-x-1 transition-transform">
                        Explore →
                      </span>
                    </div>
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
