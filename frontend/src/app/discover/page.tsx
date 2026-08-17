"use client";

import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { motion, TiltCard, CursorGlow } from "@/components/motion";
import { JourneyBreadcrumb, JourneyNextStep } from "@/components/JourneyFlow";
import DestinationRecommendations from "@/components/DestinationRecommendations";
import { useUserJourney } from "@/context/UserJourneyContext";

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
  const router = useRouter();
  const { setTripInputs } = useUserJourney();

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
        <JourneyBreadcrumb currentStep={1} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-10"
        >
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold shadow-xs"
              style={{ background: "var(--color-teal-light)", color: "var(--color-teal-dark)" }}
            >
              🌏 Destination Recommender · Step 1 of 3
            </div>
          </div>
          <h1 className="font-heading font-800 text-4xl text-[var(--color-text)] leading-tight mb-3">
            Discover Your Next <span className="coral-text">Destination</span> 🇮🇳
          </h1>
          <p className="text-[var(--color-muted)] text-sm max-w-md mx-auto leading-relaxed font-medium">
            Explore India&apos;s top tourist places — search any destination or pick from our curated AI-ranked list. Select one to auto-fill your Itinerary.
          </p>
        </motion.div>

        {/* Top Recommendations Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <DestinationRecommendations />
        </div>

        {/* Featured Popular Destinations */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="font-heading font-700 text-2xl text-[var(--color-text)] mb-6 text-center">
            Featured Popular Spots 🌟
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
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
                        <button
                          type="button"
                          onClick={() => {
                            setTripInputs({ selectedDestination: place.name });
                            router.push("/itinerary");
                          }}
                          className="text-xs font-bold text-white px-3 py-1.5 rounded-xl coral-gradient shadow-xs group-hover:scale-105 transition-transform"
                        >
                          Select →
                        </button>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Next Step CTA */}
        <JourneyNextStep currentStep={1} />
      </main>
    </>
  );
}
