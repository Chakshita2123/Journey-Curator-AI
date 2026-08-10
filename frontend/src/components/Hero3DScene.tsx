"use client";

import { useEffect, useState } from "react";
import { Plane, Compass, Sparkles, TrendingUp, ShieldCheck, MapPin, Globe } from "lucide-react";
import { motion, TiltCard } from "@/components/motion";

const HERO_PLACES = [
  {
    name: "Taj Mahal",
    location: "Agra, UP",
    flag: "🕌",
    cost: "₹4,200",
    days: "3 Days",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=500&q=80",
    rotate: "-3deg",
    shiftY: 0,
  },
  {
    name: "Kerala Houseboat",
    location: "Alleppey, KL",
    flag: "🚣",
    cost: "₹7,500",
    days: "5 Days",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=500&q=80",
    rotate: "2deg",
    shiftY: -12,
  },
  {
    name: "Goa Beach",
    location: "North Goa",
    flag: "🌴",
    cost: "₹5,800",
    days: "4 Days",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=500&q=80",
    rotate: "-2deg",
    shiftY: 8,
  },
  {
    name: "Solang Valley",
    location: "Manali, HP",
    flag: "🏔️",
    cost: "₹6,200",
    days: "4 Days",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=500&q=80",
    rotate: "3deg",
    shiftY: -4,
  },
];

export default function Hero3DScene() {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      setMouseOffset({
        x: ((e.clientX - cx) / cx) * 16,
        y: ((e.clientY - cy) / cy) * 16,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto my-8 py-6 flex flex-col items-center select-none">
      {/* ── Background Layer 1: Ambient Parallax Orbs & Grid ── */}
      <div
        className="absolute inset-0 pointer-events-none transition-transform duration-500 ease-out -z-10"
        style={{
          transform: `translate3d(${mouseOffset.x * -0.5}px, ${mouseOffset.y * -0.5}px, 0)`,
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-[#6C5CE7]/15 via-[#00B894]/15 to-[#FF9776]/15 rounded-full blur-3xl" />
      </div>

      {/* ── Layer 2: Floating Decorative Parallax Badges (z-30 to float ABOVE cards) ── */}
      <div
        className="absolute -top-5 left-2 sm:left-6 z-30 transition-transform duration-300 ease-out"
        style={{ transform: `translate3d(${mouseOffset.x * -1.8}px, ${mouseOffset.y * -1.8}px, 0)` }}
      >
        <div className="card px-4 py-2 flex items-center gap-2.5 bg-white/95 backdrop-blur-md shadow-coral border border-[var(--color-coral)]/30 text-xs font-bold text-[var(--color-coral-dark)]">
          <Plane className="w-4 h-4 text-[var(--color-coral)] animate-idle" />
          <span>Flight & Stay ML Prediction</span>
        </div>
      </div>

      <div
        className="absolute -top-3 right-2 sm:right-6 z-30 transition-transform duration-300 ease-out"
        style={{ transform: `translate3d(${mouseOffset.x * 2.2}px, ${mouseOffset.y * 2.2}px, 0)` }}
      >
        <div className="card px-4 py-2 flex items-center gap-2.5 bg-white/95 backdrop-blur-md shadow-teal border border-[var(--color-teal)]/30 text-xs font-bold text-[var(--color-teal-dark)]">
          <Compass className="w-4 h-4 text-[var(--color-teal)] animate-spin" style={{ animationDuration: "14s" }} />
          <span>96% Persona Match</span>
        </div>
      </div>

      <div
        className="absolute -bottom-5 right-8 sm:right-12 z-30 transition-transform duration-300 ease-out hidden sm:flex"
        style={{ transform: `translate3d(${mouseOffset.x * -1.4}px, ${mouseOffset.y * 1.4}px, 0)` }}
      >
        <div className="card px-4 py-2 flex items-center gap-2 bg-[#FFF0EB] backdrop-blur-md border border-[#FF9776]/40 text-xs font-bold text-[#E05A36] shadow-peach">
          <TrendingUp className="w-4 h-4 text-[#E05A36]" />
          <span>₹4,500 Savings Tip</span>
        </div>
      </div>

      {/* ── Layer 3: Interactive 3D Stacked Destination Photo Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 w-full px-4 z-10">
        {HERO_PLACES.map((place, i) => (
          <motion.div
            key={place.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
            style={{
              transform: `translate3d(${mouseOffset.x * (i % 2 === 0 ? 0.8 : -0.8)}px, ${mouseOffset.y * (i < 2 ? 0.8 : -0.8) + place.shiftY}px, 0)`,
            }}
            className="transition-transform duration-300 ease-out"
          >
            <TiltCard
              maxTilt={12}
              className="card overflow-hidden cursor-pointer select-none border border-white/80 shadow-soft group hover:shadow-coral transition-all duration-300"
            >
              {/* Photo Header */}
              <div className="h-32 w-full relative overflow-hidden img-card-container">
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-full object-cover img-card-zoom"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-extrabold text-[var(--color-text)] shadow-xs">
                  {place.flag} {place.days}
                </span>
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-[10px] font-bold text-amber-300">
                  ★ {place.rating}
                </span>
              </div>

              {/* Card Content */}
              <div className="p-3 bg-white flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-700 text-xs text-[var(--color-text)] leading-snug group-hover:text-[var(--color-coral)] transition-colors">
                    {place.name}
                  </h4>
                  <p className="text-[10px] text-[var(--color-muted)] font-medium flex items-center gap-0.5 mt-0.5">
                    <MapPin className="w-2.5 h-2.5 text-[var(--color-coral)]" />
                    {place.location}
                  </p>
                </div>
                <span className="text-xs font-bold text-[var(--color-coral-dark)] px-2 py-1 rounded-lg bg-[var(--color-coral-light)]">
                  {place.cost}
                </span>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
