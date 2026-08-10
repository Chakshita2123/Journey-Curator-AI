"use client";

import Navbar from "@/components/Navbar";
import ItineraryGenerator from "@/components/ItineraryGenerator";
import { motion } from "@/components/motion";
import { JourneyBreadcrumb, JourneyNextStep } from "@/components/JourneyFlow";

export default function ItineraryPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 px-6">
        <div className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute right-0 top-12 w-[420px] h-[420px] rounded-full blur-3xl opacity-15 animate-mesh"
            style={{ background: "radial-gradient(circle, #6C5CE7, transparent 70%)" }}
          />
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Top Step Breadcrumb */}
            <JourneyBreadcrumb currentStep={4} />

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-4 shadow-xs"
                style={{ background: "var(--color-teal-light)", color: "var(--color-teal-dark)" }}>
                🗺️ Phase 5 · Itinerary Generation · Step 4
              </div>
              <h1 className="font-heading font-800 text-4xl text-[var(--color-text)] mb-4">
                AI-powered day-by-day travel plans
              </h1>
              <p className="mx-auto max-w-2xl text-sm text-[var(--color-muted)] leading-relaxed font-medium">
                Generate a complete itinerary using predicted cost insights, budget optimization notes, travel persona intelligence, and curated destination recommendations. Then ask a follow-up like “Day 2 ko zyada relaxed banao&quot; to tweak only that section.
              </p>
            </motion.section>

            <ItineraryGenerator />

            {/* Bottom Next Step CTA */}
            <JourneyNextStep currentStep={4} />
          </div>
        </div>
      </main>
    </>
  );
}
