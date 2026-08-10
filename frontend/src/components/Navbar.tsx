"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/persona",   label: "Persona Quiz" },
  { href: "/predict",   label: "Cost Predictor" },
  { href: "/itinerary", label: "Itinerary" },
  { href: "/discover",  label: "Discover" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 bg-white border-b border-[var(--color-border)]"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3.5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div
            className="w-9 h-9 rounded-2xl coral-gradient flex items-center justify-center shadow-coral transition-transform duration-200 group-hover:scale-110 group-hover:rotate-[-4deg]"
          >
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-800 text-lg text-[var(--color-text)] tracking-tight">
            Journey <span className="coral-text">Curator</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 nav-link-hover ${
                    active
                      ? "bg-[var(--color-coral-light)] text-[var(--color-coral)] font-semibold"
                      : "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/predict"
            id="nav-predict-cta"
            className="hidden md:flex items-center gap-2 px-4.5 py-2 rounded-2xl text-sm font-semibold text-white btn-3d-primary btn-shimmer"
          >
            <Sparkles className="w-4 h-4" />
            Predict Now
          </Link>
          {/* Mobile hamburger */}
          <button
            id="mobile-menu-btn"
            className="md:hidden p-2 rounded-xl text-[var(--color-muted)] hover:bg-[var(--color-bg)] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-white px-6 py-4 flex flex-col gap-2 animate-slide-up">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="py-2.5 px-4 rounded-xl text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/predict"
            onClick={() => setMenuOpen(false)}
            className="mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-semibold text-white coral-gradient"
          >
            <Sparkles className="w-4 h-4" />
            Predict My Trip Cost
          </Link>
        </div>
      )}
    </nav>
  );
}
