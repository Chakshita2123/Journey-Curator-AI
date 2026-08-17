"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Sparkles, Menu, X, Bookmark, LogOut, LogIn, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import AuthModal from "@/components/AuthModal";

const NAV_LINKS = [
  { href: "/discover",  label: "Discover" },
  { href: "/itinerary", label: "Itinerary" },
  { href: "/predict",   label: "Cost Predictor" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session } = useSession();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const userInitial = session?.user?.name?.[0]?.toUpperCase() ??
    session?.user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <>
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
            {session && (
              <li>
                <Link
                  href="/my-trips"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 nav-link-hover flex items-center gap-1.5 ${
                    pathname.startsWith("/my-trips")
                      ? "bg-[var(--color-coral-light)] text-[var(--color-coral)] font-semibold"
                      : "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" /> My Trips
                </Link>
              </li>
            )}
          </ul>

          {/* Right: CTA + Auth */}
          <div className="flex items-center gap-2">
            <Link
              href="/predict"
              id="nav-predict-cta"
              className="hidden md:flex items-center gap-2 px-4.5 py-2 rounded-2xl text-sm font-semibold text-white btn-3d-primary btn-shimmer"
            >
              <Sparkles className="w-4 h-4" />
              Predict Now
            </Link>

            {/* Auth area */}
            {session ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  id="user-avatar-btn"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="w-9 h-9 rounded-full coral-gradient flex items-center justify-center text-white font-bold text-sm shadow-coral hover:scale-105 transition-transform"
                  title={session.user?.email ?? "Account"}
                >
                  {userInitial}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-12 w-52 rounded-2xl bg-white shadow-xl border border-[var(--color-border)] p-2 flex flex-col gap-1 z-50 animate-slide-up">
                    <div className="px-3 py-2 border-b border-[var(--color-border)] mb-1">
                      <p className="text-xs font-semibold text-[var(--color-text)] truncate">
                        {session.user?.name ?? session.user?.email}
                      </p>
                      <p className="text-xs text-[var(--color-muted)] truncate">{session.user?.email}</p>
                    </div>
                    <Link
                      href="/my-trips"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-[var(--color-teal)]" /> My Trips
                    </Link>
                    <button
                      id="signout-btn"
                      onClick={() => { signOut(); setUserMenuOpen(false); }}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] transition-colors w-full"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="nav-signin-btn"
                onClick={() => setShowAuth(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[var(--color-coral)] border border-[var(--color-coral-mid)] hover:bg-[var(--color-coral-light)] transition-all duration-200"
              >
                <LogIn className="w-4 h-4" /> Sign In
              </button>
            )}

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
            {session && (
              <Link
                href="/my-trips"
                onClick={() => setMenuOpen(false)}
                className="py-2.5 px-4 rounded-xl text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors flex items-center gap-2"
              >
                <Bookmark className="w-4 h-4 text-[var(--color-teal)]" /> My Trips
              </Link>
            )}
            <Link
              href="/predict"
              onClick={() => setMenuOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-semibold text-white coral-gradient"
            >
              <Sparkles className="w-4 h-4" />
              Predict My Trip Cost
            </Link>
            {session ? (
              <button
                onClick={() => { signOut(); setMenuOpen(false); }}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-[var(--color-danger)] border border-[var(--color-danger-light)] hover:bg-[var(--color-danger-light)] transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            ) : (
              <button
                onClick={() => { setShowAuth(true); setMenuOpen(false); }}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-[var(--color-coral)] border border-[var(--color-coral-mid)] hover:bg-[var(--color-coral-light)] transition-colors"
              >
                <LogIn className="w-4 h-4" /> Sign In / Sign Up
              </button>
            )}
          </div>
        )}
      </nav>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => setShowAuth(false)}
        />
      )}
    </>
  );
}
