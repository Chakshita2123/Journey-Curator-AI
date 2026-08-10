"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Loader2, Sparkles, RefreshCcw, ArrowRight, CheckCircle2, MapIcon } from "lucide-react";
import type { PersonaRequest, PersonaResponse } from "@/types/api";
import DestinationRecommendations from "./DestinationRecommendations";
import { useUserJourney } from "@/context/UserJourneyContext";
import { motion, AnimatedProgressBar, LoadingStateCard, ErrorStateCard } from "@/components/motion";

const QUESTIONS = [
  {
    field: "nature_vs_nightlife",
    title: "What vibe do you crave most?",
    subtitle: "Choose your ideal travel environment",
    emoji: "🌲 vs 🏙️",
    options: [
      { value: 1, label: "Deep Nature & Peaceful Wilderness 🌿", desc: "National parks, silent forests, remote mountains" },
      { value: 2, label: "Scenic Outdoors & Quiet Villages ⛰️", desc: "Lakes, countryside walks, fresh air" },
      { value: 3, label: "A Balanced Mix of Both ⚖️", desc: "Daytime nature walks, evening city vibes" },
      { value: 4, label: "Vibrant City Streets & Rooftops 🌆", desc: "Bustling markets, cafes, city lights" },
      { value: 5, label: "High-Energy Nightlife & Clubs 🌃", desc: "Late-night music, bars, party destinations" },
    ],
  },
  {
    field: "budget_vs_luxury",
    title: "How do you like to spend your travel budget?",
    subtitle: "Select your comfort level",
    emoji: "🪙 vs 👑",
    options: [
      { value: 1, label: "Shoestring & Backpacker 🎒", desc: "Hostel dorms, street food, budget transport" },
      { value: 2, label: "Smart Value & Co-living 🪙", desc: "Private budget rooms, local eateries" },
      { value: 3, label: "Comfort Mid-Range 💳", desc: "3-star hotels, Airbnb, cozy restaurants" },
      { value: 4, label: "Premium Boutique 🏨", desc: "4-star boutique stays, fine dining experiences" },
      { value: 5, label: "5-Star Luxury & Pampering 👑", desc: "Luxury resorts, spa access, private perks" },
    ],
  },
  {
    field: "activity_level",
    title: "What is your ideal activity level?",
    subtitle: "How active do you want your days to be?",
    emoji: "🏖️ vs 🧗",
    options: [
      { value: 1, label: "Ultra Relaxed & Beach Chill 🏖️", desc: "Sunbeds, poolside reading, maximum rest" },
      { value: 2, label: "Casual Strolls & Park Benches ☕", desc: "Low-effort sightseeing and coffee stops" },
      { value: 3, label: "Moderate Exploration 🚴", desc: "City walking tours, light bike rides, gentle hikes" },
      { value: 4, label: "Active Treks & Full Days 🏃", desc: "Hiking trails, kayaking, non-stop daytime action" },
      { value: 5, label: "Extreme Adrenaline & Thrills 🧗", desc: "Bungee jumping, rafting, multi-day treks" },
    ],
  },
  {
    field: "food_preference",
    title: "What is your culinary style on the road?",
    subtitle: "Where do you get excited to eat?",
    emoji: "🍜 vs 🍷",
    options: [
      { value: 1, label: "Authentic Street Food & Markets 🍜", desc: "Local food stalls, night markets, hole-in-the-wall joints" },
      { value: 2, label: "Neighborhood Diners & Local Comforts 🥗", desc: "Casual local spots and home-style cooking" },
      { value: 3, label: "Trendy Cafes & Casual Bistros ☕", desc: "Instagrammable brunch spots and cool cafes" },
      { value: 4, label: "Gourmet Regional Cuisine 🍽️", desc: "Highly rated local restaurants & wine pairings" },
      { value: 5, label: "Michelin-Level Fine Dining 🍷", desc: "Curated multi-course tasting menus & luxury dining" },
    ],
  },
  {
    field: "travel_pace",
    title: "How fast do you move through a trip?",
    subtitle: "Your preferred daily pace",
    emoji: "🧘 vs 🏃",
    options: [
      { value: 1, label: "Slow & Unhurried 🧘", desc: "Stay 1-2 weeks in one spot, zero alarms" },
      { value: 2, label: "Leisurely 🚶", desc: "1 main activity per day, lots of downtime" },
      { value: 3, label: "Balanced & Steady 🚌", desc: "2-3 sights per day with comfortable breaks" },
      { value: 4, label: "Fast-Paced Highlight Tour ⚡", desc: "Cover top 10 landmarks across multiple cities" },
      { value: 5, label: "Action-Packed 16-Hour Days 🏃", desc: "From sunrise photography to late night tours" },
    ],
  },
  {
    field: "cultural_depth",
    title: "How deep into history & culture do you like to dive?",
    subtitle: "Your interest in local heritage",
    emoji: "📸 vs 🏛️",
    options: [
      { value: 1, label: "Light Sightseeing & Photos 📸", desc: "Snap a landmark photo and keep moving" },
      { value: 2, label: "Main Tourist Landmarks 🗽", desc: "Visit iconic monuments everyone talks about" },
      { value: 3, label: "Museums & Guided City Walks 🎨", desc: "Art galleries, historic districts, local guides" },
      { value: 4, label: "Rich Heritage & Traditions 📚", desc: "Ancient ruins, craft workshops, local festivals" },
      { value: 5, label: "Deep Immersive Cultural Study 🏺", desc: "Historical research, living with local tribes/communities" },
    ],
  },
];

export default function PersonaQuiz() {
  const router = useRouter();
  const { setPersona } = useUserJourney();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PersonaResponse | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const currentQ = QUESTIONS[currentStep];
  const selectedValue = answers[currentQ.field];

  const handleSelectOption = (value: number) => {
    setAnswers((prev) => ({ ...prev, [currentQ.field]: value }));
  };

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    const payload: PersonaRequest = {
      nature_vs_nightlife: answers.nature_vs_nightlife ?? 3,
      budget_vs_luxury: answers.budget_vs_luxury ?? 3,
      activity_level: answers.activity_level ?? 3,
      food_preference: answers.food_preference ?? 3,
      travel_pace: answers.travel_pace ?? 3,
      cultural_depth: answers.cultural_depth ?? 3,
    };

    try {
      const res = await fetch("/api/predict-persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to classify persona");
      const personaData = data as PersonaResponse;
      setResult(personaData);
      setPersona(personaData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Classification failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingStateCard message="Classifying Your AI Persona..." />;
  }

  if (error) {
    return <ErrorStateCard message={error} onRetry={handleSubmit} />;
  }

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-4xl mx-auto flex flex-col gap-6"
      >
        {/* Main Result Card */}
        <div className="card p-8 text-center relative overflow-hidden shadow-coral">
          <div className="text-5xl mb-3 animate-bounce-in">🎭</div>
          <div
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ background: "var(--color-coral-light)", color: "var(--color-coral)" }}
          >
            Your AI Persona Match · {(result.confidence * 100).toFixed(0)}% Match
          </div>
          <h2 className="font-heading font-800 text-3xl coral-text mb-2">
            {result.title}
          </h2>
          <p className="text-[var(--color-text)] text-base font-medium max-w-md mx-auto leading-relaxed mb-4">
            {result.description}
          </p>

          <div className="rounded-2xl p-4 text-left text-sm mb-6" style={{ background: "var(--color-surface-warm)", border: "1px solid rgba(108,92,231,0.14)" }}>
            <p className="font-semibold text-[var(--color-coral)] mb-1">💡 Curator Tip:</p>
            <p className="text-[var(--color-text)]">{result.tip}</p>
          </div>

          {/* Recommended Styles */}
          <div className="text-left mb-6">
            <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-2">
              Recommended Travel Styles
            </p>
            <div className="flex flex-wrap gap-2">
              {result.recommended_styles.map((style) => (
                <span
                  key={style}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs"
                  style={{ background: "var(--color-teal-light)", color: "var(--color-teal-dark)" }}
                >
                  ✨ {style}
                </span>
              ))}
            </div>
          </div>

          {/* Persona Breakdown Bars */}
          <div className="text-left border-t border-[var(--color-border)] pt-5">
            <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3">
              Persona Affinity Breakdown
            </p>
            <div className="space-y-3">
              {Object.entries(result.persona_breakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([pName, val]) => {
                  const pct = Math.round(val * 100);
                  const isTop = pName === result.persona;
                  return (
                    <div key={pName} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className={isTop ? "font-bold text-[var(--color-coral)]" : "text-[var(--color-muted)]"}>
                          {pName} {isTop ? "★" : ""}
                        </span>
                        <span className="text-[var(--color-text)] font-semibold">{pct}%</span>
                      </div>
                      <AnimatedProgressBar
                        progress={pct}
                        className="h-2.5 rounded-full bg-[var(--color-bg)] border border-[var(--color-border-mid)] overflow-hidden"
                        barClassName={`h-full rounded-full ${isTop ? "coral-gradient" : "teal-gradient"}`}
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            id="retake-quiz-btn"
            type="button"
            onClick={() => {
              setResult(null);
              setCurrentStep(0);
              setAnswers({});
              setShowRecommendations(false);
            }}
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-semibold btn-3d-secondary"
          >
            <RefreshCcw className="w-4 h-4" /> Retake Quiz
          </button>
          
          <button
            id="view-recommendations-btn"
            type="button"
            onClick={() => setShowRecommendations(!showRecommendations)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold btn-3d-secondary"
          >
            <MapIcon className="w-4 h-4" />
            {showRecommendations ? "Hide" : "Show"} Destinations
          </button>

          <Link
            href={`/predict?style=${encodeURIComponent(result.recommended_styles[0] ?? "")}`}
            id="plan-trip-persona-btn"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-white btn-3d-primary"
          >
            <Sparkles className="w-4 h-4" />
            Plan Trip as {result.persona}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Destination Recommendations */}
        {showRecommendations && (
          <DestinationRecommendations persona={result.persona} />
        )}
      </motion.div>
    );
  }

  const progressPct = ((currentStep + 1) / QUESTIONS.length) * 100;

  return (
    <div className="card p-8 max-w-xl w-full mx-auto">
      {/* Progress header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-[var(--color-coral)] uppercase tracking-wider">
          Question {currentStep + 1} of {QUESTIONS.length}
        </span>
        <span className="text-xl">{currentQ.emoji}</span>
      </div>

      {/* Animated Progress Bar */}
      <div className="mb-8">
        <AnimatedProgressBar progress={progressPct} />
      </div>

      {/* Question Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h2 className="font-heading font-700 text-2xl text-[var(--color-text)] mb-1">
          {currentQ.title}
        </h2>
        <p className="text-sm text-[var(--color-muted)] mb-6">
          {currentQ.subtitle}
        </p>

        {/* Options List with micro-interaction scale bounce */}
        <div className="space-y-3">
          {currentQ.options.map((opt) => {
            const isSelected = selectedValue === opt.value;
            return (
              <motion.button
                key={opt.value}
                id={`quiz-q${currentStep + 1}-opt${opt.value}`}
                type="button"
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => handleSelectOption(opt.value)}
                className={`w-full p-4 rounded-2xl text-left border-2 transition-all duration-200 flex items-center justify-between ${
                  isSelected
                    ? "border-[var(--color-coral)] bg-[var(--color-coral-light)] shadow-[0_4px_16px_rgba(108,92,231,0.18)]"
                    : "border-[var(--color-border-mid)] bg-white hover:border-[var(--color-coral-mid)]"
                }`}
              >
                <div className="space-y-0.5 pr-2">
                  <p className={`font-semibold text-sm ${isSelected ? "text-[var(--color-coral-dark)]" : "text-[var(--color-text)]"}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">{opt.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                  isSelected ? "bg-[var(--color-coral)] border-transparent text-white scale-110" : "border-[var(--color-border-mid)]"
                }`}>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Error display */}
      {error && (
        <div className="mt-4 p-3 rounded-xl text-sm" style={{ background: "var(--color-danger-light)", color: "var(--color-danger)" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Bottom Nav */}
      <div className="flex gap-3 mt-8">
        {currentStep > 0 && (
          <button
            id="quiz-prev-btn"
            type="button"
            onClick={handlePrev}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-text)] border border-[var(--color-border-mid)] transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}

        {currentStep < QUESTIONS.length - 1 ? (
          <button
            id="quiz-next-btn"
            type="button"
            onClick={handleNext}
            disabled={selectedValue === undefined}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-white btn-3d-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next Question <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            id="quiz-submit-btn"
            type="button"
            onClick={handleSubmit}
            disabled={selectedValue === undefined || loading}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-white btn-3d-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" /> Discover My Persona
          </button>
        )}
      </div>
    </div>
  );
}
