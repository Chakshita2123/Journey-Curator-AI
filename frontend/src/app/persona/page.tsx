"use client";

import Navbar from "@/components/Navbar";
import PersonaQuiz from "@/components/PersonaQuiz";
import { motion } from "@/components/motion";
import { JourneyBreadcrumb, JourneyNextStep } from "@/components/JourneyFlow";

export default function PersonaPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-dvh pt-24 pb-16 px-6">
        {/* Animated mesh blobs */}
        <div
          className="pointer-events-none fixed top-16 left-10 w-[380px] h-[320px] rounded-full blur-3xl opacity-20 -z-10 animate-mesh"
          style={{ background: "radial-gradient(ellipse, #6C5CE7, transparent 70%)" }}
        />
        <div
          className="pointer-events-none fixed bottom-10 right-10 w-[350px] h-[320px] rounded-full blur-3xl opacity-15 -z-10 animate-mesh"
          style={{ background: "radial-gradient(ellipse, #00B894, transparent 70%)", animationDelay: "5s" }}
        />

        {/* Top Step Breadcrumb */}
        <JourneyBreadcrumb currentStep={1} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl mx-auto mb-8 text-center"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 shadow-xs"
            style={{ background: "var(--color-coral-light)", color: "var(--color-coral)" }}
          >
            🧠 AI Travel Persona Classifier · Step 1
          </div>
          <h1 className="font-heading font-800 text-4xl text-[var(--color-text)] leading-tight">
            What Type of <span className="coral-text">Traveler</span> Are You?
          </h1>
          <p className="mt-3 text-[var(--color-muted)] text-sm leading-relaxed font-medium">
            Answer 6 quick questions to discover your travel persona, affinity breakdown,
            and tailored style suggestions.
          </p>
        </motion.div>

        <PersonaQuiz />

        {/* Bottom Next Step CTA */}
        <JourneyNextStep currentStep={1} />
      </main>
    </>
  );
}
