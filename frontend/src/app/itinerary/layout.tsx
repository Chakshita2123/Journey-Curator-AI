import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plan Your Trip | Journey Curator AI",
  description: "Fill in your trip details and let our AI generate a custom day-by-day itinerary with hidden gems, food spots, and local routes.",
};

export default function ItineraryPageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
