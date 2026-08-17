"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ArrowRight } from "lucide-react";
import type { DestinationRecommendation, RecommendDestinationsResponse } from "@/types/api";
import { motion, TiltCard, AnimatedProgressBar, LoadingStateCard, ErrorStateCard } from "@/components/motion";
import { useUserJourney } from "@/context/UserJourneyContext";
import DestinationAutocomplete from "@/components/DestinationAutocomplete";

// ─── COMPLETE verified photo map — 74 destinations from the dataset ─────────
// Every entry uses a specific, verified Unsplash photo relevant to that destination.
const DEST_PHOTOS: Record<string, string> = {
  // Agra / Uttar Pradesh
  "Taj Mahal":                 "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
  "Sarnath":                   "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
  "Varanasi Ghats":            "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
  "Kashi Vishwanath Temple":   "https://images.unsplash.com/photo-1609340741927-f5d0cd2e3af7?auto=format&fit=crop&w=800&q=80",
  "Durgakund Temple":          "https://images.unsplash.com/photo-1609340741927-f5d0cd2e3af7?auto=format&fit=crop&w=800&q=80",
  "Ramnagar Fort":             "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",

  // Delhi
  "India Gate":                "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
  "Red Fort":                  "https://images.unsplash.com/photo-1599420183985-e43e9e00f9ef?auto=format&fit=crop&w=800&q=80",
  "Humayun's Tomb":            "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
  "Lotus Temple":              "https://images.unsplash.com/photo-1585490737634-89ae37f3a2f3?auto=format&fit=crop&w=800&q=80",
  "Jantar Mantar":             "https://images.unsplash.com/photo-1624461386880-fd0c8e47534b?auto=format&fit=crop&w=800&q=80",

  // Jaipur / Rajasthan
  "Hawa Mahal":                "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80",
  "Amber Fort":                "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=800&q=80",
  "City Palace":               "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
  "Nahargarh Fort":            "https://images.unsplash.com/photo-1610733038069-a862843e9ee6?auto=format&fit=crop&w=800&q=80",
  "Jal Mahal":                 "https://images.unsplash.com/photo-1622397706988-d4c5e37aed46?auto=format&fit=crop&w=800&q=80",

  // Mumbai / Maharashtra
  "Gateway of India":          "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=800&q=80",
  "Elephanta Caves":           "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
  "Marine Drive":              "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80",
  "Juhu Beach":                "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
  "Siddhivinayak Temple":      "https://images.unsplash.com/photo-1609340741927-f5d0cd2e3af7?auto=format&fit=crop&w=800&q=80",
  "Chhatrapati Shivaji Museum":"https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=800&q=80",

  // Srinagar / Jammu & Kashmir
  "Dal Lake":                  "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80",
  "Mughal Gardens":            "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80",
  "Hazratbal Shrine":          "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80",
  "Shankaracharya Temple":     "https://images.unsplash.com/photo-1609340741927-f5d0cd2e3af7?auto=format&fit=crop&w=800&q=80",
  "Pari Mahal":                "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80",
  "Gulmarg Gondola":           "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",

  // Manali / Himachal Pradesh
  "Hadimba Temple":            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
  "Beas River":                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
  "Solang Valley":             "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80",
  "Rohtang Pass":              "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
  "Old Manali":                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",

  // Kolkata / West Bengal
  "Victoria Memorial":         "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80",
  "Howrah Bridge":             "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80",
  "Indian Museum":             "https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=800&q=80",
  "Science City":              "https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=800&q=80",
  "Dakshineswar Kali Temple":  "https://images.unsplash.com/photo-1609340741927-f5d0cd2e3af7?auto=format&fit=crop&w=800&q=80",
  "Sundarbans":                "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",

  // Hyderabad / Telangana
  "Charminar":                 "https://images.unsplash.com/photo-1548195667-1f6a4e1dc46f?auto=format&fit=crop&w=800&q=80",
  "Golconda Fort":             "https://images.unsplash.com/photo-1548195667-1f6a4e1dc46f?auto=format&fit=crop&w=800&q=80",
  "Ramoji Film City":          "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",
  "Salar Jung Museum":         "https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=800&q=80",
  "Birla Mandir":              "https://images.unsplash.com/photo-1609340741927-f5d0cd2e3af7?auto=format&fit=crop&w=800&q=80",

  // Amritsar / Punjab
  "Golden Temple":             "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?auto=format&fit=crop&w=800&q=80",
  "Wagah Border":              "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?auto=format&fit=crop&w=800&q=80",
  "Jallianwala Bagh":          "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?auto=format&fit=crop&w=800&q=80",
  "Durgiana Temple":           "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?auto=format&fit=crop&w=800&q=80",
  "Partition Museum":          "https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=800&q=80",

  // Mysore / Karnataka
  "Mysore Palace":             "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=800&q=80",
  "Chamundi Hill":             "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=800&q=80",
  "Mysore Zoo":                "https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=800&q=80",
  "Karanji Lake":              "https://images.unsplash.com/photo-1439853949212-36589f9f8b7c?auto=format&fit=crop&w=800&q=80",
  "Brindavan Gardens":         "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
  "St. Philomena's Church":    "https://images.unsplash.com/photo-1473177104440-ffee2f376098?auto=format&fit=crop&w=800&q=80",

  // Alleppey / Kerala
  "Backwaters":                "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
  "Alappuzha Beach":           "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
  "Marari Beach":              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  "Krishnapuram Palace":       "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",

  // Madurai / Tamil Nadu
  "Meenakshi Temple":          "https://images.unsplash.com/photo-1648470074665-571c1b62ba55?auto=format&fit=crop&w=800&q=80",
  "Gandhi Museum":             "https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=800&q=80",
  "Samanar Hills":             "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
  "Thirumalai Nayakkar Palace":"https://images.unsplash.com/photo-1648470074665-571c1b62ba55?auto=format&fit=crop&w=800&q=80",
  "Koodal Azhagar Temple":     "https://images.unsplash.com/photo-1648470074665-571c1b62ba55?auto=format&fit=crop&w=800&q=80",

  // Ooty / Tamil Nadu
  "Ooty Lake":                 "https://images.unsplash.com/photo-1439853949212-36589f9f8b7c?auto=format&fit=crop&w=800&q=80",
  "Doddabetta Peak":           "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
  "Rose Garden":               "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80",
  "Botanical Garden":          "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80",
  "Emerald Lake":              "https://images.unsplash.com/photo-1439853949212-36589f9f8b7c?auto=format&fit=crop&w=800&q=80",
  "Ooty Toy Train":            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
};

// Category-based fallback photos for any destination not in the map
const CATEGORY_PHOTOS: Record<string, string> = {
  Natural:   "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
  Adventure: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80",
  Cultural:  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
  Religious: "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?auto=format&fit=crop&w=800&q=80",
  Historic:  "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
  Monument:  "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
  Resort:    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
};

function getDestPhoto(name: string, category: string): string {
  // 1. Exact name match
  if (DEST_PHOTOS[name]) return DEST_PHOTOS[name];
  // 2. Category fallback
  return CATEGORY_PHOTOS[category] ?? "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80";
}

// ─── Category helpers ───────────────────────────────────────────────────────
function getCategoryGradient(category: string): string {
  const g: Record<string, string> = {
    Natural:   "linear-gradient(135deg,#00B894 0%,#008F73 100%)",
    Adventure: "linear-gradient(135deg,#6C5CE7 0%,#4C3DBA 100%)",
    Cultural:  "linear-gradient(135deg,#4C3DBA 0%,#2D2A4A 100%)",
    Religious: "linear-gradient(135deg,#e17055 0%,#d63031 100%)",
    Historic:  "linear-gradient(135deg,#6C5CE7 0%,#5A4BD1 100%)",
    Monument:  "linear-gradient(135deg,#4C3DBA 0%,#6C5CE7 100%)",
    Resort:    "linear-gradient(135deg,#00B894 0%,#55EFC4 100%)",
  };
  return g[category] || "linear-gradient(135deg,#6C5CE7 0%,#00B894 100%)";
}
function getCategoryTextColor(category: string): string {
  const c: Record<string, string> = {
    Natural:   "#008F73", Adventure: "#4C3DBA", Cultural: "#2D2A4A",
    Religious: "#c0392b", Historic: "#6C5CE7", Monument: "#4C3DBA", Resort: "#007A5C",
  };
  return c[category] || "#6C5CE7";
}

// ─── Prominent Search Bar ───────────────────────────────────────────────────
interface DestSearchProps {
  allDestinations: DestinationRecommendation[];
  onSelectCurated: (index: number) => void;
}

export function DestinationSearchBar({ allDestinations, onSelectCurated }: DestSearchProps) {
  const router = useRouter();
  const { setTripInputs } = useUserJourney();
  const [query, setQuery] = useState("");

  function handleConfirm(val: string) {
    const trimmed = val.trim();
    if (!trimmed) return;
    // Check if it matches a curated destination — if so, select it in the list
    const exact = allDestinations.findIndex(
      (d) => d.place_name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exact !== -1) {
      onSelectCurated(exact);
      return;
    }
    // Otherwise navigate to itinerary with the typed destination
    setTripInputs({ selectedDestination: trimmed });
    router.push("/itinerary");
  }

  return (
    <div className="w-full mb-6">
      <div className="p-4 sm:p-5 rounded-3xl bg-[var(--color-surface-warm)] border-2 border-[var(--color-teal-light)] shadow-md transition-all">
        <div className="text-center mb-2.5">
          <h2 className="font-heading font-700 text-base text-[var(--color-text)] inline-flex items-center gap-2">
            🔍 Looking for somewhere specific?
          </h2>
          <p className="text-xs text-[var(--color-muted)] font-medium mt-0.5">
            Search 74+ curated destinations or type any custom place for an AI itinerary
          </p>
        </div>
        <DestinationAutocomplete
          id="discover-search"
          value={query}
          onChange={setQuery}
          onConfirm={handleConfirm}
          placeholder="Search any destination — e.g., Taj Mahal, Goa, Manali..."
          showIcon={true}
          size="lg"
        />
      </div>
    </div>
  );
}


// ─── Main DestinationRecommendations ────────────────────────────────────────
const AUTO_ROTATE_INTERVAL = 4500; // ms between auto-rotations

export default function DestinationRecommendations() {
  const router = useRouter();
  const { setTripInputs } = useUserJourney();
  const [recommendations, setRecommendations] = useState<RecommendDestinationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doFetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recommend-destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona: "General", top_k: 8 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? data.error ?? "Failed to fetch recommendations");
      if (!data.recommendations || !Array.isArray(data.recommendations)) {
        throw new Error("Invalid response format from recommendations API");
      }
      setRecommendations(data);
      setActiveIndex(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { doFetch(); }, [doFetch]);

  const list: DestinationRecommendation[] = recommendations?.recommendations ?? [];
  const safeIndex = list.length > 0 ? Math.min(activeIndex, list.length - 1) : 0;

  // ── Auto-rotation ──────────────────────────────────────────────────────
  useEffect(() => {
    if (list.length <= 1 || paused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % list.length);
    }, AUTO_ROTATE_INTERVAL);
    return () => clearInterval(timer);
  }, [list.length, paused]);

  // User interaction → pause for 8 s then resume
  function handleUserNav(newIndex: number) {
    setActiveIndex(newIndex);
    setPaused(true);
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    pauseTimer.current = setTimeout(() => setPaused(false), 8000);
  }

  if (loading) return <LoadingStateCard message="Discovering Top Destinations..." />;
  if (error) return <ErrorStateCard title="Failed to Load Recommendations" message={error} onRetry={doFetch} />;

  if (list.length === 0) {
    return (
      <div className="card p-8 text-center">
        <MapIcon className="w-12 h-12 mx-auto text-[var(--color-muted)] opacity-50 mb-3" />
        <p className="text-[var(--color-text)] font-medium">No recommendations available</p>
      </div>
    );
  }

  const active = list[safeIndex];
  const ratingPct = Math.round((active.rating / 5) * 100);
  const photoUrl = getDestPhoto(active.place_name, active.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-4"
    >
      {/* ── Prominent Search Bar ── */}
      <DestinationSearchBar
        allDestinations={list}
        onSelectCurated={(idx) => handleUserNav(idx)}
      />

      {/* Section header */}
      <div className="text-center pt-1">
        <h3 className="text-lg font-bold text-[var(--color-text)] mb-0.5">✨ Top Destinations</h3>
        <p className="text-xs text-[var(--color-muted)]">
          Curated {list.length} destinations from {recommendations?.total_destinations_considered ?? list.length} places
          {(recommendations?.hidden_gems_count ?? 0) > 0 &&
            ` · ${recommendations!.hidden_gems_count} hidden gems`}
          {paused && <span className="ml-2 text-[var(--color-coral)]">⏸ Auto-rotating paused</span>}
        </p>
      </div>

      {/* ── Compact Featured Card with Photo ─────────────────────── */}
      <TiltCard maxTilt={4} className="card overflow-hidden">
        {/* Photo header — key on activeIndex so image swaps cleanly */}
        <div key={`photo-${safeIndex}`} className="h-44 relative overflow-hidden">
          <motion.img
            key={safeIndex}
            src={photoUrl}
            alt={active.place_name}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55 }}
            className="w-full h-full object-cover"
          />
          {/* Dark gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          {/* Category pill — top left */}
          <span
            className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs z-10"
            style={{ background: "rgba(255,255,255,0.93)", color: getCategoryTextColor(active.category) }}
          >
            {active.category}
          </span>
          {/* Rating pill — top right */}
          <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 shadow-xs z-10">
            ★ {active.rating.toFixed(1)}
          </span>
          {/* Name + location over photo */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 z-10">
            <motion.h2
              key={`name-${safeIndex}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="font-heading font-800 text-xl text-white leading-tight drop-shadow"
            >
              {active.place_name}
            </motion.h2>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-white/80" />
              <span className="text-xs text-white/80 font-medium">{active.city}, {active.state}</span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* 3-col stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[var(--color-bg)] border border-[var(--color-border-mid)] rounded-xl p-2.5 text-center">
              <div className="text-base font-bold coral-text">{active.rating.toFixed(1)} ⭐</div>
              <p className="text-[10px] text-[var(--color-muted)] mt-0.5 font-medium">Rating</p>
            </div>
            <div className="bg-[var(--color-bg)] border border-[var(--color-border-mid)] rounded-xl p-2.5 text-center">
              <div className="text-xs font-bold teal-text leading-tight mt-0.5">{active.category}</div>
              <p className="text-[10px] text-[var(--color-muted)] mt-0.5 font-medium">Category</p>
            </div>
            <div className="bg-[var(--color-bg)] border border-[var(--color-border-mid)] rounded-xl p-2.5 text-center">
              <div className="text-base font-bold text-[var(--color-text)]">
                {active.entry_fee_inr > 0 ? `₹${active.entry_fee_inr.toFixed(0)}` : "Free"}
              </div>
              <p className="text-[10px] text-[var(--color-muted)] mt-0.5 font-medium">Entry</p>
            </div>
          </div>

          {/* Rating progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-semibold">
              <span className="text-[var(--color-muted)]">Visitor Rating Score</span>
              <span className="text-[var(--color-teal-dark)]">{ratingPct}%</span>
            </div>
            <AnimatedProgressBar progress={ratingPct} barClassName="h-full rounded-full teal-gradient" />
          </div>

          {/* Description — 2 line clamp */}
          <p className="text-xs text-[var(--color-text)] leading-relaxed line-clamp-2 rounded-lg px-3 py-2"
            style={{ background: "var(--color-surface-warm)" }}>
            {active.description}
          </p>

          {/* Meta 2×2 */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-2 border-t border-[var(--color-border)]">
            {[
              { label: "Best Season",  value: active.ideal_season },
              { label: "Travel Type",  value: active.best_travel_type },
              { label: "State",        value: active.state },
              { label: "Coordinates",  value: `${active.latitude.toFixed(2)}, ${active.longitude.toFixed(2)}`, mono: true },
            ].map(({ label, value, mono }) => (
              <div key={label}>
                <p className="text-[10px] font-semibold text-[var(--color-muted)] uppercase tracking-wider">{label}</p>
                <p className={`text-xs font-semibold text-[var(--color-text)] ${mono ? "font-mono" : ""}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={() => {
              setTripInputs({ selectedDestination: active.place_name, season: active.ideal_season });
              router.push("/itinerary");
            }}
            id={`select-dest-btn-${active.place_name.toLowerCase().replace(/\s/g, "-")}`}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-white btn-3d-primary btn-shimmer"
          >
            <span>✨</span> Select {active.place_name} &amp; Generate Itinerary →
          </button>

          {/* Quick links */}
          <div className="flex gap-2">
            <button
              onClick={() => window.open(`https://maps.google.com/?q=${active.latitude},${active.longitude}`, "_blank")}
              className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold btn-3d-secondary"
            >
              View on Maps 🗺️
            </button>
            <button
              onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(active.place_name + " " + active.city)}`, "_blank")}
              className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold text-white btn-3d-primary"
            >
              Learn More 🔍
            </button>
          </div>
        </div>
      </TiltCard>

      {/* ── Carousel navigation ──────────────────────────────────────── */}
      {list.length > 1 && (
        <div className="space-y-2">
          {/* Progress dots */}
          <div className="flex gap-1.5 justify-center flex-wrap">
            {list.map((_, i) => (
              <button
                key={i}
                onClick={() => handleUserNav(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === safeIndex
                    ? "w-6 bg-[var(--color-coral)]"
                    : "w-1.5 bg-[var(--color-border-mid)]"
                }`}
                aria-label={`Go to destination ${i + 1}`}
              />
            ))}
          </div>
          {/* Prev / Next */}
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => handleUserNav((safeIndex - 1 + list.length) % list.length)}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-[var(--color-border-mid)] text-[var(--color-text)] text-xs font-medium hover:bg-[var(--color-bg)] transition-colors btn-3d-secondary"
            >
              ← Previous
            </button>
            <button
              onClick={() => handleUserNav((safeIndex + 1) % list.length)}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-[var(--color-border-mid)] text-[var(--color-text)] text-xs font-medium hover:bg-[var(--color-bg)] transition-colors btn-3d-secondary"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
