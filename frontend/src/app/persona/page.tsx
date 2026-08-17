"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Persona Quiz has been permanently removed from Journey Curator AI.
// Redirect visitors to Discover page.
export default function PersonaPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/discover");
  }, [router]);
  return null;
}
