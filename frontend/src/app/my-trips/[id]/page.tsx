"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin, CalendarDays, Users, ArrowLeft, Loader2,
  AlertTriangle, Bookmark, Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import type { ItineraryDay } from "@/types/api";

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
  itinerary: ItineraryDay[];
}

function DayCard({ day }: { day: ItineraryDay }) {
  return (
    <article className="card p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-3xl teal-gradient flex items-center justify-center text-white shadow-teal text-lg font-bold shrink-0">
          {day.day}
        </div>
        <div className="space-y-1">
          <h3 className="font-heading text-xl text-[var(--color-text)]">{day.title}</h3>
          <p className="text-sm text-[var(--color-muted)]">{day.summary}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)] mb-2 font-semibold">Top attractions</p>
          <ul className="list-disc list-inside text-sm text-[var(--color-text)] space-y-1">
            {day.attractions.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)] mb-2 font-semibold">Restaurant picks</p>
          <ul className="list-disc list-inside text-sm text-[var(--color-text)] space-y-1">
            {day.restaurants.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl p-4 bg-[var(--color-surface-teal)]">
          <p className="text-[var(--color-muted)] text-xs uppercase tracking-[0.2em] mb-2 font-semibold">Route</p>
          <p className="text-sm text-[var(--color-text)]">{day.route_suggestion}</p>
        </div>
        <div className="rounded-3xl p-4 bg-[var(--color-surface-warm)]">
          <p className="text-[var(--color-muted)] text-xs uppercase tracking-[0.2em] mb-2 font-semibold">Weather note</p>
          <p className="text-sm text-[var(--color-text)]">{day.weather_note}</p>
        </div>
      </div>

      {day.notes && (
        <div className="rounded-3xl p-4 bg-white border border-[var(--color-border)]">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)] mb-2 font-semibold">Pro tip</p>
          <p className="text-sm text-[var(--color-text)]">{day.notes}</p>
        </div>
      )}
    </article>
  );
}

export default function SavedTripPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState<SavedTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = params.id as string;

  useEffect(() => {
    if (status === "loading") return;
    if (!session) { router.replace("/my-trips"); return; }
    fetch(`/api/trips/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setTrip(data.trip);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, session, status]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/my-trips"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] mb-6 mt-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Trips
          </Link>

          {loading && (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--color-coral)]" />
            </div>
          )}

          {error && (
            <div className="card p-6 flex items-center gap-3 text-[var(--color-danger)] bg-[var(--color-danger-light)]">
              <AlertTriangle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {trip && (
            <div className="space-y-6">
              {/* Header */}
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl coral-gradient flex items-center justify-center text-white shadow-coral">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="font-heading text-2xl text-[var(--color-text)]">{trip.destination}</h1>
                    {trip.persona && (
                      <span className="text-xs font-semibold text-[var(--color-coral)]">{trip.persona}</span>
                    )}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl p-3 bg-[var(--color-surface-teal)]">
                    <p className="text-xs text-[var(--color-muted)] mb-1">Duration</p>
                    <p className="font-semibold text-sm text-[var(--color-text)]">{trip.duration} days</p>
                  </div>
                  <div className="rounded-2xl p-3 bg-[var(--color-surface-warm)]">
                    <p className="text-xs text-[var(--color-muted)] mb-1">Group</p>
                    <p className="font-semibold text-sm text-[var(--color-text)]">{trip.groupSize} people</p>
                  </div>
                  {trip.costPrediction && (
                    <div className="rounded-2xl p-3 bg-[var(--color-coral-light)]">
                      <p className="text-xs text-[var(--color-muted)] mb-1">Est. cost</p>
                      <p className="font-semibold text-sm text-[var(--color-coral)]">
                        ₹{trip.costPrediction.predicted_cost.toLocaleString("en-IN")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Day cards */}
              <div className="space-y-4">
                {trip.itinerary.map((day) => (
                  <DayCard key={`saved-day-${day.day}`} day={day} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
