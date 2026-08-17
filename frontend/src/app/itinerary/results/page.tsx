"use client";

import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import ItineraryResults from "@/components/ItineraryResults";
import { motion, LoadingStateCard } from "@/components/motion";
import { JourneyBreadcrumb, JourneyNextStep } from "@/components/JourneyFlow";

export default function ItineraryResultsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 px-6">
        <div className="relative overflow-hidden">
          {/* Decorative blobs */}
          <div
            className="pointer-events-none absolute right-0 top-12 w-[420px] h-[420px] rounded-full blur-3xl opacity-10 animate-mesh"
            style={{ background: "radial-gradient(circle, #6C5CE7, transparent 70%)" }}
          />
          <div
            className="pointer-events-none absolute left-0 top-1/2 w-[280px] h-[280px] rounded-full blur-3xl opacity-10"
            style={{ background: "radial-gradient(circle, #00B894, transparent 70%)" }}
          />

          <div className="max-w-6xl mx-auto space-y-6">
            {/* Step breadcrumb */}
            <JourneyBreadcrumb currentStep={2} />

            {/* Page title */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-4 shadow-xs"
                style={{ background: "var(--color-teal-light)", color: "var(--color-teal-dark)" }}
              >
                ✨ Your AI Itinerary is Ready · Step 2 of 3
              </div>
              <h1 className="font-heading font-800 text-4xl text-[var(--color-text)] mb-4">
                Your Custom Day-by-Day Plan
              </h1>
              <p className="mx-auto max-w-2xl text-sm text-[var(--color-muted)] leading-relaxed font-medium">
                Review your AI-crafted itinerary below. You can refine any day, save the trip, or continue to cost prediction.
              </p>
            </motion.section>

            {/* Results — wrapped in Suspense because it reads searchParams */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              <Suspense fallback={<LoadingStateCard message="Loading your itinerary…" />}>
                <ItineraryResults />
              </Suspense>
            </motion.div>

            {/* Bottom Next Step CTA */}
            <JourneyNextStep currentStep={2} />
          </div>
        </div>
      </main>
    </>
  );
}
