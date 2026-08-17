import type { Metadata } from "next";
import "./globals.css";
import { UserJourneyProvider } from "@/context/UserJourneyContext";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Journey Curator AI — Smart Travel Cost Predictor",
  description:
    "AI-powered travel companion. Predict trip costs globally, generate personalised itineraries, and discover top destinations — all in one place.",
  keywords: ["travel", "trip cost", "AI travel planner", "itinerary", "global destinations"],
  openGraph: {
    title: "Journey Curator AI",
    description: "Predict your trip cost with AI. Plan smarter. Travel better.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>
          <UserJourneyProvider>
            {children}
          </UserJourneyProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
