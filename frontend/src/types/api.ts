// ── Request sent to FastAPI /predict-cost ────────────────────
export interface TripRequest {
  destination: string;
  duration: number;
  accommodation_type?: string;
  transportation_type?: string;
  age?: number;
  nationality?: string;
  travel_style?: string;
  season?: string;
  budget?: number;
  group_size?: number;
}

// ── Cost-saving suggestion returned by the API ───────────────
export interface Suggestion {
  field: string;
  original_value: string | number;
  suggested_value: string | number;
  predicted_cost: number;
}

// ── Full Cost API response ───────────────────────────────────
export interface PredictResponse {
  predicted_cost: number;
  budget?: number;
  suggestions: Suggestion[];
}

// ── Request sent to FastAPI /predict-persona ─────────────────
export interface PersonaRequest {
  nature_vs_nightlife: number;
  budget_vs_luxury: number;
  activity_level: number;
  food_preference: number;
  travel_pace: number;
  cultural_depth: number;
}

// ── Response returned from FastAPI /predict-persona ──────────
export interface PersonaResponse {
  persona: string;
  title: string;
  description: string;
  badge_color: string;
  recommended_styles: string[];
  tip: string;
  confidence: number;
  persona_breakdown: Record<string, number>;
  user_scores: Record<string, number>;
}

// ── Destination Recommendation Response ──────────────────────
export interface DestinationRecommendation {
  place_name: string;
  city: string;
  state: string;
  category: string;
  rating: number;
  entry_fee_inr: number;
  latitude: number;
  longitude: number;
  ideal_season: string;
  best_travel_type: string;
  match_score: number;
  description: string;
}

// ── Request to get recommendations ───────────────────────────
export interface RecommendDestinationsRequest {
  persona: string;
  top_k?: number;
}

// ── Recommendation API response ──────────────────────────────
export interface RecommendDestinationsResponse {
  persona: string;
  recommendations: DestinationRecommendation[];
  total_destinations_considered: number;
  hidden_gems_count: number;
}

export interface ItineraryDay {
  day: number;
  title: string;
  summary: string;
  attractions: string[];
  restaurants: string[];
  route_suggestion: string;
  weather_note: string;
  packing: string[];
  notes?: string;
}

export interface ItineraryRequest {
  destination: string;
  duration: number;
  start_date?: string;
  end_date?: string;
  group_size?: number;
  budget?: number;
  accommodation_type?: string;
  transportation_type?: string;
  persona?: string;
  persona_title?: string;
  persona_description?: string;
  recommended_destinations?: string;
  cost_summary?: string;
  budget_advice?: string;
  followup?: string;
  existing_itinerary?: ItineraryDay[];
}

export interface ItineraryResponse {
  itinerary: ItineraryDay[];
  cost_summary: string;
  budget_advice: string;
  partial_update: boolean;
  generated_by: "gemini" | "groq" | "mock";
}

