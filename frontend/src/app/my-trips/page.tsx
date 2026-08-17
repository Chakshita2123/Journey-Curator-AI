"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  MapPin, CalendarDays, Users, Trash2, Eye, Sparkles,
  Loader2, AlertTriangle, Bookmark, ArrowRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import Link from "next/link";

interface SavedTrip {
  _id: string;
  destination: string;
  startDate: string | null;
  endDate: string | null;
  duration: number;
  persona: string | null;
  groupSize: number;
  costPrediction: { predicted_cost: number } | null;
  savedAt: string;
  itinerary: { day: number; title: string; summary: string }[];
}

const PERSONA_COLORS: Record<string, string> = {
  "Adventurer": "var(--color-coral)",
  "Relaxed Vacationer": "var(--color-teal)",
  "Culture & Food Explorer": "var(--color-peach-dark)",
  "Budget Backpacker": "#7C3AED",
  "Luxury Wellness Seeker": "#B7860B",
};

function PersonaBadge({ persona }: { persona: string | null }) {
  if (!persona) return null;
  const color = PERSONA_COLORS[persona] ?? "var(--color-coral)";
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-white"
      style={{ background: color }}
    >
      {persona}
    </span>
  );
}

function TripCard({ trip, onDelete }: { trip: SavedTrip; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${trip.destination}" trip? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/trips/${trip._id}`, { method: "DELETE" });
      if (res.ok) {
        onDelete(trip._id);
      }
    } finally {
      setDeleting(false);
    }
  }

  const savedDate = new Date(trip.savedAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  const dayRange = trip.startDate && trip.endDate
    ? `${trip.startDate} → ${trip.endDate}`
    : `${trip.duration} day${trip.duration !== 1 ? "s" : ""}`;

  const firstDayTitle = trip.itinerary?.[0]?.title ?? "";

  return (
    <article className="card p-6 flex flex-col gap-4 group hover:-translate-y-1 transition-transform duration-200">
      {/* Destination header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl coral-gradient flex items-center justify-center text-white shadow-coral shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg text-[var(--color-text)] leading-tight">{trip.destination}</h3>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">Saved {savedDate}</p>
          </div>
        </div>
        <PersonaBadge persona={trip.persona} />
      </div>

      {/* Meta chips */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[var(--color-surface-teal)] text-[var(--color-teal-dark)]">
          <CalendarDays className="w-3.5 h-3.5" /> {dayRange}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[var(--color-surface-warm)] text-[var(--color-coral)]">
          <Users className="w-3.5 h-3.5" /> {trip.groupSize} {trip.groupSize === 1 ? "person" : "people"}
        </span>
        {trip.costPrediction && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[var(--color-coral-light)] text-[var(--color-coral)]">
            ₹{trip.costPrediction.predicted_cost.toLocaleString("en-IN")}
          </span>
        )}
      </div>

      {/* Day 1 preview */}
      {firstDayTitle && (
        <p className="text-sm text-[var(--color-muted)] line-clamp-2 border-l-2 pl-3" style={{ borderColor: "var(--color-teal-mid)" }}>
          <span className="font-semibold text-[var(--color-text)]">Day 1:</span> {firstDayTitle}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-2 border-t border-[var(--color-border)]">
        <Link
          href={`/my-trips/${trip._id}`}
          id={`view-trip-${trip._id}`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold text-white btn-3d-primary"
        >
          <Eye className="w-4 h-4" /> View itinerary
        </Link>
        <button
          id={`delete-trip-${trip._id}`}
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2.5 rounded-2xl text-sm font-semibold border border-[var(--color-danger-light)] text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] transition-colors disabled:opacity-50"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>
    </article>
  );
}

export default function MyTripsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      setLoading(false);
      return;
    }
    fetchTrips();
  }, [session, status]);

  async function fetchTrips() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/trips");
      if (!res.ok) throw new Error("Failed to load trips.");
      const data = await res.json();
      setTrips(data.trips ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = (id: string) => {
    setTrips((prev) => prev.filter((t) => t._id !== id));
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Page header */}
          <div className="flex items-center gap-4 mb-10 mt-6">
            <div className="w-12 h-12 rounded-2xl teal-gradient flex items-center justify-center text-white shadow-teal">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-heading text-3xl text-[var(--color-text)]">My Trips</h1>
              <p className="text-sm text-[var(--color-muted)]">Your saved itineraries, all in one place.</p>
            </div>
          </div>

          {/* Auth wall */}
          {!session && status !== "loading" && (
            <div className="card p-12 text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full coral-gradient flex items-center justify-center text-white mx-auto mb-5 shadow-coral">
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 className="font-heading text-2xl text-[var(--color-text)] mb-2">Sign in to see your trips</h2>
              <p className="text-sm text-[var(--color-muted)] mb-6">
                Create an account or sign in to save and revisit your AI-generated travel itineraries.
              </p>
              <button
                id="my-trips-signin-btn"
                onClick={() => setShowAuth(true)}
                className="px-6 py-3 rounded-2xl text-sm font-semibold text-white btn-3d-primary inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Sign In / Sign Up
              </button>
            </div>
          )}

          {/* Loading */}
          {status === "loading" || (session && loading) ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--color-coral)]" />
              <p className="text-sm text-[var(--color-muted)]">Loading your saved trips…</p>
            </div>
          ) : null}

          {/* Error */}
          {error && (
            <div className="card p-6 flex items-center gap-3 text-[var(--color-danger)] border border-[var(--color-danger-light)] bg-[var(--color-danger-light)] mb-6">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {session && !loading && !error && trips.length === 0 && (
            <div className="card p-12 text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full teal-gradient flex items-center justify-center text-white mx-auto mb-5 shadow-teal">
                <MapPin className="w-7 h-7" />
              </div>
              <h2 className="font-heading text-2xl text-[var(--color-text)] mb-2">No saved trips yet</h2>
              <p className="text-sm text-[var(--color-muted)] mb-6">
                Generate an itinerary and click <strong>"Save This Trip"</strong> to bookmark it here.
              </p>
              <Link
                href="/itinerary"
                className="px-6 py-3 rounded-2xl text-sm font-semibold text-white btn-3d-primary inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Plan a Trip <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Trip grid */}
          {session && !loading && trips.length > 0 && (
            <>
              <p className="text-sm text-[var(--color-muted)] mb-5">
                {trips.length} saved trip{trips.length !== 1 ? "s" : ""}
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {trips.map((trip) => (
                  <TripCard key={trip._id} trip={trip} onDelete={handleDelete} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => { setShowAuth(false); fetchTrips(); }}
          triggerMessage="Sign in to view your saved trips"
        />
      )}
    </>
  );
}
