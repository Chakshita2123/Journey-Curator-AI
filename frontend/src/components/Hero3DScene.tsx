"use client";

import { useEffect, useState } from "react";
import { Plane, Compass, Sparkles, TrendingUp, MapPin, ArrowUpRight, ShieldCheck } from "lucide-react";
import { motion, TiltCard } from "@/components/motion";

export default function Hero3DScene() {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      setMouseOffset({
        x: ((e.clientX - cx) / cx) * 12,
        y: ((e.clientY - cy) / cy) * 12,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none lg:w-[110%] pt-8 pb-14 select-none">
      {/* ── Background SVG Route Geometry & Ambient Glow ── */}
      <div
        className="absolute inset-0 pointer-events-none transition-transform duration-700 ease-out -z-10"
        style={{
          transform: `translate3d(${mouseOffset.x * -0.5}px, ${mouseOffset.y * -0.5}px, 0)`,
        }}
      >
        <div className="absolute top-1/3 right-10 w-[380px] h-[340px] bg-gradient-to-br from-[#6C5CE7]/20 via-[#00B894]/15 to-[#FF5E36]/15 rounded-full blur-3xl opacity-75" />
        
        {/* Clean Curved Route Arc */}
        <svg
          className="absolute -top-6 right-0 w-full h-full stroke-[rgba(108,92,231,0.18)] fill-none"
          viewBox="0 0 500 450"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 30 380 Q 220 100 460 140"
            strokeDasharray="6 8"
            strokeWidth="2"
          />
          <circle cx="30" cy="380" r="4" fill="#6C5CE7" />
          <circle cx="460" cy="140" r="5" fill="#00B894" />
        </svg>
      </div>

      {/* ── Badge 1: Top Right Floating Pill (Clean space, no overlap) ── */}
      <div
        className="absolute -top-2 right-2 sm:right-8 z-30 transition-transform duration-300 ease-out"
        style={{ transform: `translate3d(${mouseOffset.x * 1.4}px, ${mouseOffset.y * 1.4}px, 0)` }}
      >
        <div className="px-4 py-2 rounded-2xl bg-white/95 backdrop-blur-md shadow-soft border border-[var(--color-border-mid)] flex items-center gap-2.5 text-xs font-bold text-[var(--color-text)]">
          <Plane className="w-4 h-4 text-[var(--color-coral)]" />
          <span>Real-Time ML Route Pricing</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E6F8F4] text-[#008F73] border border-[#00B894]/30">
            ★ 94% R²
          </span>
        </div>
      </div>

      {/* ── Main Featured Card (Solid Card Body Underneath Photo) ── */}
      <div
        className="relative z-10 max-w-sm sm:max-w-md transition-transform duration-500 ease-out mx-auto lg:mr-16"
        style={{
          transform: `translate3d(${mouseOffset.x * 0.7}px, ${mouseOffset.y * 0.7}px, 0) rotate(-1.5deg)`,
        }}
      >
        <TiltCard
          maxTilt={8}
          className="card overflow-hidden shadow-2xl border border-white/90 bg-white group hover:rotate-0 transition-transform duration-500"
        >
          {/* Photo Header with Clean Minimal Badges */}
          <div className="h-48 sm:h-52 w-full relative overflow-hidden bg-slate-900">
            <img
              src="https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80"
              alt="Taj Mahal Agra"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
            
            <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md text-xs font-extrabold text-[var(--color-text)] shadow-xs">
                🕌 4 Days Plan
              </span>
              <span className="badge-solid-coral px-2.5 py-0.5 rounded-lg text-[11px]">
                Popular
              </span>
            </div>

            <span className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-xs font-bold text-amber-300">
              ★ 4.9 Rating
            </span>
          </div>

          {/* Solid White Card Body — Crisp Typography, No Text Overlap */}
          <div className="p-5 sm:p-6 bg-white flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wider font-extrabold text-[var(--color-coral)] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Curated Route
                </p>
                <h3 className="font-display font-[800] text-2xl text-[var(--color-text)] tracking-tight mt-0.5">
                  Agra Heritage &amp; Culture
                </h3>
                <p className="text-xs text-[var(--color-muted)] font-medium flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[var(--color-coral)]" />
                  Taj Mahal, Agra Fort &amp; Local Cuisine
                </p>
              </div>

              {/* Price Block */}
              <div className="text-right flex-shrink-0 bg-[var(--color-surface-warm)] px-3.5 py-2 rounded-2xl border border-[var(--color-border-mid)]">
                <span className="text-[10px] text-[var(--color-muted)] font-bold uppercase tracking-wider block">Estimated</span>
                <span className="font-display font-[800] text-xl text-[var(--color-text)]">₹4,850</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs font-bold text-[var(--color-coral)]">
              <span className="text-[var(--color-muted)] font-normal text-[11px]">
                Best Season: Oct – Mar
              </span>
              <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Explore Full Route</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </TiltCard>
      </div>

      {/* ── Secondary Overlapping Card (Controlled Overlap at Bottom-Right) ── */}
      <div
        className="absolute -bottom-4 right-0 sm:right-2 lg:-right-4 z-20 w-64 sm:w-72 transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${mouseOffset.x * -1}px, ${mouseOffset.y * 1}px, 0) rotate(2.5deg)`,
        }}
      >
        <TiltCard
          maxTilt={10}
          className="card overflow-hidden shadow-2xl border-2 border-white/95 bg-white group hover:rotate-0 transition-transform duration-500"
        >
          {/* Photo */}
          <div className="h-28 w-full relative overflow-hidden bg-slate-900">
            <img
              src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80"
              alt="Kerala Houseboat"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-lg bg-[var(--color-teal)] text-white text-[10px] font-extrabold shadow-sm">
              🚣 Alleppey Backwaters
            </span>
            <span className="absolute bottom-2 right-2.5 text-xs font-extrabold text-white">
              ₹7,500 <span className="text-[10px] text-white/80 font-normal">/ 5d</span>
            </span>
          </div>

          {/* Mini Card Footer */}
          <div className="p-3 bg-white flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-text)]">
              <Compass className="w-3.5 h-3.5 text-[var(--color-teal)]" />
              <span>Kerala Houseboat</span>
            </div>
            <span className="text-[10px] font-extrabold text-[#008F73] px-2 py-0.5 rounded-md bg-[#E6F8F4]">
              ★ 4.9
            </span>
          </div>
        </TiltCard>
      </div>

      {/* ── Badge 2: Bottom Left Floating Pill (Dedicated space, clean clearance) ── */}
      <div
        className="absolute -bottom-5 left-0 sm:left-6 z-30 transition-transform duration-300 ease-out"
        style={{ transform: `translate3d(${mouseOffset.x * 1.2}px, ${mouseOffset.y * -1.2}px, 0)` }}
      >
        <div className="px-4 py-2 rounded-2xl bg-[#1A1636] text-white shadow-xl border border-white/20 flex items-center gap-2.5 text-xs font-bold">
          <div className="w-6 h-6 rounded-lg bg-[#FF5E36] flex items-center justify-center text-white text-xs shadow-sm">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-white/80 font-normal text-[11px]">Avg. Savings: </span>
            <span className="font-extrabold text-[#55EFC4]">₹4,500 / trip</span>
          </div>
        </div>
      </div>
    </div>
  );
}
