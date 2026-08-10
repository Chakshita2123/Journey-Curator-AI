"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp, Map, Compass } from "lucide-react";
import { motion, TiltCard } from "@/components/motion";

const FEATURES = [
  {
    icon: TrendingUp,
    emoji: "💰",
    title: "Cost Predictor",
    description:
      "AI predicts your total trip cost across any global destination — accommodation, transport, and more — with smart savings tips.",
    href: "/predict",
    iconBg: "bg-[var(--color-coral-light)]",
    iconColor: "text-[var(--color-coral)]",
    badge: "✅ Live Model",
    badgeBg: "bg-[var(--color-coral-light)] text-[var(--color-coral)] border border-[var(--color-coral)]/20",
    id: "feature-card-cost-predictor",
  },
  {
    icon: Map,
    emoji: "🗺️",
    title: "Itinerary Generator",
    description:
      "Get a personalised day-by-day travel plan built around your style, interests, and budget.",
    href: "/itinerary",
    iconBg: "bg-[var(--color-teal-light)]",
    iconColor: "text-[var(--color-teal-dark)]",
    badge: "✨ AI Powered",
    badgeBg: "bg-[var(--color-teal-light)] text-[var(--color-teal-dark)] border border-[var(--color-teal)]/20",
    id: "feature-card-itinerary-generator",
  },
  {
    icon: Compass,
    emoji: "🌏",
    title: "Destination Discover",
    description:
      "Explore 13,000+ attractions with AI-ranked recommendations — starting with India and expanding globally.",
    href: "/discover",
    iconBg: "bg-[#FFF0EB]",
    iconColor: "text-[#E05A36]",
    badge: "🔥 13,000+ Spots",
    badgeBg: "bg-[#FFF0EB] text-[#E05A36] border border-[#FF9776]/30",
    id: "feature-card-destination-discover",
  },
];

export default function FeatureCards() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {FEATURES.map(({ icon: Icon, emoji, title, description, href, iconBg, iconColor, badge, badgeBg, id }, index) => (
        <motion.div
          key={title}
          whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
          initial={{ opacity: 0, y: 24, rotateY: 15 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: index * 0.14 }}
          className="glow-border-card"
        >
          <Link href={href} id={id} className="block h-full group">
            <TiltCard maxTilt={8} className="card p-7 h-full flex flex-col gap-4 border-t border-white/90">
              {/* Emoji + icon */}
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-xs`}>
                  <Icon className={`w-6 h-6 ${iconColor} animate-idle`} />
                </div>
                <span className="text-3xl group-hover:animate-wiggle">{emoji}</span>
              </div>

              {/* Badge */}
              <span className={`self-start text-xs font-bold px-3 py-1 rounded-full shadow-xs ${badgeBg}`}>
                {badge}
              </span>

              <h3 className="font-heading font-700 text-xl text-[var(--color-text)]">{title}</h3>
              <p className="text-[var(--color-muted)] text-sm leading-relaxed flex-1 font-medium">{description}</p>

              <div className={`flex items-center gap-1.5 text-sm font-bold ${iconColor} group-hover:gap-3 transition-all duration-200 pt-2`}>
                Explore Tool
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </TiltCard>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
