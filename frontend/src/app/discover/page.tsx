"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { motion, TiltCard, CursorGlow } from "@/components/motion";
import { JourneyBreadcrumb, JourneyNextStep } from "@/components/JourneyFlow";
import DestinationRecommendations from "@/components/DestinationRecommendations";
import { useUserJourney } from "@/context/UserJourneyContext";
import { ALL_74_DESTINATIONS, type DestinationItem } from "@/data/allDestinations";
import { CATEGORY_FALLBACK_IMAGES } from "@/data/destinationImages";
import { MapPin, Search, Sparkles, Filter, CheckCircle2, ShieldCheck } from "lucide-react";

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Historic:  { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5" },
  Natural:   { bg: "#D1FAE5", text: "#065F46", border: "#6EE7B7" },
  Religious: { bg: "#FFEDD5", text: "#9A3412", border: "#FDBA74" },
  Cultural:  { bg: "#EDE9FE", text: "#4C3DBA", border: "#C4B5FD" },
  Monument:  { bg: "#F1F5F9", text: "#334155", border: "#CBD5E1" },
  Adventure: { bg: "#E0F2FE", text: "#0369A1", border: "#7DD3FC" },
  Resort:    { bg: "#CCFBF1", text: "#0F766E", border: "#5EEAD4" },
};

const CATEGORIES = ["All", "Historic", "Natural", "Religious", "Cultural", "Monument", "Adventure", "Resort"] as const;

export default function DiscoverPage() {
  const router = useRouter();
  const { setTripInputs } = useUserJourney();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"rating" | "name" | "city">("rating");

  // Filter and sort the complete 74 destinations list
  const filteredPlaces = useMemo(() => {
    return ALL_74_DESTINATIONS.filter((place) => {
      const matchesCategory =
        selectedCategory === "All" || place.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        place.name.toLowerCase().includes(q) ||
        place.city.toLowerCase().includes(q) ||
        place.state.toLowerCase().includes(q) ||
        place.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "city") return a.city.localeCompare(b.city);
      return 0;
    });
  }, [selectedCategory, searchQuery, sortBy]);

  // Counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: ALL_74_DESTINATIONS.length };
    ALL_74_DESTINATIONS.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <>
      <CursorGlow />
      <Navbar />
      <main className="min-h-dvh pt-24 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Ambient background glow */}
        <div
          className="pointer-events-none fixed top-20 right-0 w-[450px] h-[450px] rounded-full blur-3xl opacity-15 -z-10 animate-mesh"
          style={{ background: "radial-gradient(circle, #00B894, transparent 70%)" }}
        />

        {/* Step Breadcrumb */}
        <JourneyBreadcrumb currentStep={1} />

        {/* Header Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-8"
        >
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <span
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold shadow-xs"
              style={{ background: "var(--color-teal-light)", color: "var(--color-teal-dark)" }}
            >
              🌏 Destination Discovery · Step 1 of 3
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-xs bg-amber-50 text-amber-800 border border-amber-200"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              100% Verified Indian Landmark Photos
            </span>
          </div>

          <h1 className="font-heading font-800 text-3xl sm:text-4xl text-[var(--color-text)] leading-tight mb-3">
            Discover India&apos;s <span className="coral-text">74 Curated Destinations</span> 🇮🇳
          </h1>
          <p className="text-[var(--color-muted)] text-sm max-w-xl mx-auto leading-relaxed font-medium">
            Explore authentic monuments, spiritual sanctuaries, Himalayan peaks, and serene backwaters. Select any destination to build an instant AI-powered travel plan.
          </p>
        </motion.div>

        {/* AI Recommendations Carousel Section */}
        <div className="max-w-2xl mx-auto mb-14">
          <DestinationRecommendations />
        </div>

        {/* Full 74 Destinations Exploration Section */}
        <div className="w-full mt-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-[var(--color-border)]">
            <div>
              <h2 className="font-heading font-800 text-2xl text-[var(--color-text)] flex items-center gap-2">
                <span>Explore All Curated Destinations</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--color-coral-light)] text-[var(--color-coral-dark)]">
                  {filteredPlaces.length} places
                </span>
              </h2>
              <p className="text-xs text-[var(--color-muted)] mt-1 font-medium">
                Verified dataset of top Indian travel destinations with high-resolution imagery and genuine attributes
              </p>
            </div>

            {/* Live Search & Sort Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-[var(--color-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by name, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-[var(--color-border-mid)] focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)]"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-[var(--color-border-mid)] text-[var(--color-text)] focus:outline-none"
              >
                <option value="rating">Sort: Top Rated ⭐</option>
                <option value="name">Sort: Name (A-Z)</option>
                <option value="city">Sort: City (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              const count = categoryCounts[cat] || 0;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                    active
                      ? "bg-[var(--color-coral)] text-white shadow-md scale-102"
                      : "bg-white text-[var(--color-text)] border border-[var(--color-border-mid)] hover:border-[var(--color-coral)] hover:bg-[var(--color-surface-warm)]"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      active ? "bg-white/20 text-white" : "bg-gray-100 text-[var(--color-muted)]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Grid of 74 Places */}
          {filteredPlaces.length === 0 ? (
            <div className="p-12 text-center card bg-white rounded-3xl border border-[var(--color-border)]">
              <p className="text-lg font-bold text-[var(--color-text)] mb-1">No destinations found</p>
              <p className="text-xs text-[var(--color-muted)] mb-4">Try adjusting your category filter or search keywords.</p>
              <button
                onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
                className="px-4 py-2 text-xs font-bold text-white rounded-xl coral-gradient"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredPlaces.map((place, i) => {
                const catStyle = CATEGORY_COLORS[place.category] || CATEGORY_COLORS.Historic;
                return (
                  <motion.div
                    key={place.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.3) }}
                  >
                    <TiltCard
                      maxTilt={5}
                      className="card overflow-hidden flex flex-col h-full cursor-pointer select-none border border-[var(--color-border)] hover:border-[var(--color-coral)] shadow-soft hover:shadow-xl transition-all duration-300 group bg-white rounded-2xl"
                    >
                      {/* Photo Container with overlay */}
                      <div className="h-44 w-full relative overflow-hidden bg-slate-100">
                        <img
                          src={place.image}
                          alt={place.name}
                          loading="lazy"
                          onError={(e) => {
                            // Safe fallback to category image if network blocks or errors
                            const target = e.currentTarget;
                            const fallback = CATEGORY_FALLBACK_IMAGES[place.category] || CATEGORY_FALLBACK_IMAGES.Default;
                            if (target.src !== fallback) {
                              target.src = fallback;
                            }
                          }}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                        {/* Top Category Badge */}
                        <div className="absolute top-2.5 left-2.5 z-10">
                          <span
                            className="text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm"
                            style={{ background: catStyle.bg, color: catStyle.text, border: `1px solid ${catStyle.border}` }}
                          >
                            {place.category}
                          </span>
                        </div>

                        {/* Top Rating Badge */}
                        <div className="absolute top-2.5 right-2.5 z-10">
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-black/65 backdrop-blur-md text-amber-300 shadow-xs flex items-center gap-1">
                            ★ {place.rating.toFixed(1)}
                          </span>
                        </div>

                        {/* Bottom Location Over Photo */}
                        <div className="absolute bottom-2.5 left-3 right-3 z-10">
                          <p className="font-heading font-800 text-white text-base leading-tight drop-shadow-md group-hover:text-amber-200 transition-colors">
                            {place.flag} {place.name}
                          </p>
                          <div className="flex items-center gap-1 text-white/90 text-xs mt-0.5">
                            <MapPin className="w-3 h-3 text-white/80 shrink-0" />
                            <span className="truncate">{place.city}, {place.state}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                        <p className="text-xs text-[var(--color-muted)] leading-relaxed line-clamp-2">
                          {place.description}
                        </p>

                        {/* Metadata Tags */}
                        <div className="flex items-center justify-between text-[11px] font-medium pt-2 border-t border-[var(--color-border)]">
                          <span className="text-[var(--color-muted)]">
                            Entry: <strong className="text-[var(--color-text)] font-bold">{place.entryFee}</strong>
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[var(--color-surface-warm)] text-[var(--color-muted)]">
                            {place.season}
                          </span>
                        </div>

                        {/* CTA Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setTripInputs({
                              selectedDestination: place.name,
                              season: place.season,
                            });
                            router.push("/itinerary");
                          }}
                          className="w-full text-xs font-bold text-white py-2.5 rounded-xl coral-gradient shadow-xs group-hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>Plan Trip Here</span>
                          <span>→</span>
                        </button>
                      </div>
                    </TiltCard>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Next Step Flow CTA */}
        <div className="mt-14">
          <JourneyNextStep currentStep={1} />
        </div>
      </main>
    </>
  );
}
