"use client";

import Navbar from "@/components/Navbar";
import PredictForm from "@/components/PredictForm";
import { motion } from "@/components/motion";
import { JourneyBreadcrumb, JourneyNextStep } from "@/components/JourneyFlow";

export default function PredictPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-dvh pt-24 pb-16 px-6">
        {/* Animated mesh blobs */}
        <div
          className="pointer-events-none fixed top-16 right-0 w-[420px] h-[340px] rounded-full blur-3xl opacity-20 -z-10 animate-mesh"
          style={{ background: "radial-gradient(ellipse, #6C5CE7, transparent 70%)" }}
        />
        <div
          className="pointer-events-none fixed bottom-0 left-0 w-[350px] h-[320px] rounded-full blur-3xl opacity-15 -z-10 animate-mesh"
          style={{ background: "radial-gradient(ellipse, #00B894, transparent 70%)", animationDelay: "4s" }}
        />

        {/* Top Step Breadcrumb */}
        <JourneyBreadcrumb currentStep={2} />

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
            ✨ Powered by XGBoost · Step 2
          </div>
          <h1 className="font-heading font-800 text-4xl text-[var(--color-text)] leading-tight">
            Predict Your <span className="coral-text">Trip Cost</span>
          </h1>
          <p className="mt-3 text-[var(--color-muted)] text-sm leading-relaxed font-medium">
            Fill in 5 quick steps — our AI model estimates your total cost and
            suggests ways to save if you&apos;re over budget.
          </p>
        </motion.div>

        <PredictForm />

        {/* Bottom Next Step CTA */}
        <JourneyNextStep currentStep={2} />
      </main>
    </>
  );
}
