"""
Content-Based Destination Recommender for Journey Curator AI

Memory-optimised version:
  - Uses usecols to load only the 11 needed columns (was 34)
  - Uses smaller dtypes: float32 for numerics, category for low-cardinality strings
  - Drops the raw self.df immediately after aggregation (was kept in RAM)
  - Feature matrix uses float32 instead of float64
  - Proper None-sentinel singleton (was a fragile globals() check)

This module creates feature vectors from destination attributes and recommends
destinations based on predicted traveler personas using cosine similarity.
"""

import os
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
import joblib

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"

# Only the columns we actually use – avoids loading the other ~23 columns.
_NEEDED_COLS = [
    "place_name", "place_id", "city", "state", "category",
    "latitude", "longitude", "user_rating", "entry_fee_inr",
    "weather_suitability_score", "travel_type", "season",
]

# Persona-to-destination attribute mappings (or general default)
PERSONA_FEATURE_PROFILES = {
    "General": {
        "travel_type": ["Solo", "Couple", "Family", "Group"],
        "category": ["Historic", "Natural", "Cultural", "Religious"],
        "activity_level": 3.0,
        "budget_level": 2.5,
        "pace": 3.0,
        "cultural_depth": 3.0,
        "weather_suitability": 0.8,
        "rating_weight": 0.8,
    },
    "Adventurer": {
        "travel_type": ["Solo", "Group"],
        "category": ["Natural", "Adventure"],
        "activity_level": 4.5,
        "budget_level": 2.5,
        "pace": 4.0,
        "cultural_depth": 1.5,
        "weather_suitability": 0.75,
        "rating_weight": 0.7,
    },
    "Relaxed Vacationer": {
        "travel_type": ["Couple", "Family"],
        "category": ["Natural", "Resort"],
        "activity_level": 1.5,
        "budget_level": 3.0,
        "pace": 1.5,
        "cultural_depth": 2.0,
        "weather_suitability": 0.9,
        "rating_weight": 0.8,
    },
    "Culture & Food Explorer": {
        "travel_type": ["Solo", "Couple"],
        "category": ["Cultural", "Religious", "Historic"],
        "activity_level": 3.0,
        "budget_level": 3.0,
        "pace": 2.5,
        "cultural_depth": 5.0,
        "weather_suitability": 0.7,
        "rating_weight": 0.9,
    },
    "Budget Backpacker": {
        "travel_type": ["Solo", "Group"],
        "category": ["Natural", "Cultural", "Monument"],
        "activity_level": 3.5,
        "budget_level": 1.0,
        "pace": 3.5,
        "cultural_depth": 3.0,
        "weather_suitability": 0.6,
        "rating_weight": 0.6,
    },
    "Luxury Wellness Seeker": {
        "travel_type": ["Couple", "Family"],
        "category": ["Resort", "Religious", "Wellness"],
        "activity_level": 2.0,
        "budget_level": 5.0,
        "pace": 1.5,
        "cultural_depth": 2.5,
        "weather_suitability": 0.95,
        "rating_weight": 0.95,
    },
}

# Season suitability mapping (rough guide)
SEASON_SUITABILITY = {
    "Winter": {"Adventurer": 0.9, "Relaxed Vacationer": 0.95, "Culture & Food Explorer": 0.9,
               "Budget Backpacker": 0.85, "Luxury Wellness Seeker": 0.95},
    "Spring": {"Adventurer": 0.95, "Relaxed Vacationer": 1.0, "Culture & Food Explorer": 0.95,
               "Budget Backpacker": 0.95, "Luxury Wellness Seeker": 1.0},
    "Summer": {"Adventurer": 0.8, "Relaxed Vacationer": 0.7, "Culture & Food Explorer": 0.6,
               "Budget Backpacker": 0.75, "Luxury Wellness Seeker": 0.85},
    "Monsoon": {"Adventurer": 0.7, "Relaxed Vacationer": 0.4, "Culture & Food Explorer": 0.65,
                "Budget Backpacker": 0.6, "Luxury Wellness Seeker": 0.3},
}

# Category mappings for better grouping
CATEGORY_GROUPING = {
    "Natural": ["Natural", "Lake", "Waterfall", "Beach", "Mountain"],
    "Adventure": ["Adventure", "Trekking", "Watersports", "Outdoor"],
    "Cultural": ["Cultural", "Museum", "Art Gallery", "Workshop"],
    "Religious": ["Religious", "Temple", "Mosque", "Church", "Shrine"],
    "Historic": ["Historic", "Fort", "Palace", "Monument", "Ruin"],
    "Resort": ["Resort", "Hotel", "Wellness", "Spa"],
}


class DestinationRecommender:
    """Content-based recommender for travel destinations."""

    def __init__(self, dataset_path: Optional[str] = None):
        """
        Initialize the recommender with destination data.

        Args:
            dataset_path: Path to CSV file with destination data.
                         Defaults to indian_tourist_places_dataset.csv
        """
        if dataset_path is None:
            dataset_path = DATA_DIR / "indian_tourist_places_dataset.csv"

        self.dataset_path = dataset_path
        self.df = None          # released after aggregation
        self.destinations = None
        self.feature_matrix = None
        self.scaler = StandardScaler()
        self._load_data()

    def _load_data(self):
        """Load and preprocess destination dataset.

        Memory optimisations applied here:
          1. usecols – only load the 11 columns we need (not all 34).
          2. dtype overrides – float32 instead of float64 for numeric columns,
             pd.CategoricalDtype for low-cardinality string columns.
          3. self.df is deleted after aggregation so the raw rows are freed.
        """
        print(f"Loading dataset from {self.dataset_path}...")

        dtype_map = {
            # Low-cardinality strings → category (avoids storing repeated strings)
            "category":    "category",
            "travel_type": "category",
            "season":      "category",
            "state":       "category",
            # Numerics → float32 (half the RAM of float64)
            "latitude":                  "float32",
            "longitude":                 "float32",
            "user_rating":               "float32",
            "entry_fee_inr":             "float32",
            "weather_suitability_score": "float32",
        }

        raw = pd.read_csv(
            self.dataset_path,
            usecols=_NEEDED_COLS,
            dtype=dtype_map,
        )

        # Create unique destinations (deduplicate by place_name)
        self.destinations = raw.groupby("place_name").agg(
            place_id=("place_id", "first"),
            city=("city", "first"),
            state=("state", "first"),
            category=("category", "first"),
            latitude=("latitude", "first"),
            longitude=("longitude", "first"),
            user_rating=("user_rating", "mean"),
            entry_fee_inr=("entry_fee_inr", "first"),
            weather_suitability_score=("weather_suitability_score", "mean"),
            travel_type=("travel_type", lambda x: x.mode()[0] if len(x.mode()) > 0 else "Family"),
            season=("season", lambda x: x.mode()[0] if len(x.mode()) > 0 else "Spring"),
        ).reset_index()

        # Fill missing values
        self.destinations["entry_fee_inr"] = (
            self.destinations["entry_fee_inr"].fillna(0).astype("float32")
        )
        self.destinations["user_rating"] = (
            self.destinations["user_rating"].fillna(3.5).astype("float32")
        )
        self.destinations["weather_suitability_score"] = (
            self.destinations["weather_suitability_score"].fillna(0.7).astype("float32")
        )

        # ── KEY: free the raw 13 k-row DataFrame immediately ──────────────
        del raw
        self.df = None  # ensure no reference left

        print(f"Loaded {len(self.destinations)} unique destinations")
        self._create_feature_matrix()

    def _create_feature_matrix(self):
        """Create normalised feature matrix from destinations (float32)."""
        features = [self._extract_features(dest) for _, dest in self.destinations.iterrows()]
        # Use float32 – half the RAM of the default float64
        self.feature_matrix = np.array(features, dtype=np.float32)
        self.feature_matrix = self.scaler.fit_transform(self.feature_matrix).astype(np.float32)
        print(f"Created feature matrix with shape {self.feature_matrix.shape}")

    def _extract_features(self, destination: pd.Series) -> np.ndarray:
        """
        Extract normalised features from a destination row.

        Features include:
        - Budget level (inverted entry_fee)
        - Rating (popularity/quality)
        - Weather suitability
        - Activity intensity (based on CATEGORY, not travel_type)
        - Category (one-hot encoded or ordinal)
        - Season preference
        """
        features = []

        # 1. Budget level (normalize entry fee: 0-5 scale)
        max_entry = 500  # Typical max entry fee in India
        budget_score = 5.0 - min(float(destination["entry_fee_inr"]) / max_entry * 5.0, 5.0)
        features.append(budget_score)

        # 2. Rating/Quality (0-5)
        features.append(float(destination["user_rating"]))

        # 3. Weather suitability (0-1)
        features.append(float(destination["weather_suitability_score"]) * 5.0)  # Scale to 0-5

        # 4. Activity intensity based on CATEGORY
        category = str(destination["category"])
        category_activity_level = {
            "Natural": 4.5,
            "Adventure": 5.0,
            "Cultural": 3.0,
            "Historic": 2.5,
            "Religious": 2.0,
            "Monument": 2.5,
            "Resort": 2.0,
        }.get(category, 3.0)
        features.append(category_activity_level)

        # 5. Category encoding (ordinal score)
        category_score = {
            "Natural": 4.0,
            "Adventure": 5.0,
            "Cultural": 3.5,
            "Religious": 3.0,
            "Historic": 3.5,
            "Monument": 3.0,
            "Resort": 2.5,
        }.get(category, 3.0)
        features.append(category_score)

        # 6. Season diversity
        season_score = 1.0 if destination["season"] in ("Winter", "Spring") else 0.5
        features.append(season_score)

        return np.array(features, dtype=np.float32)

    def _create_persona_vector(self, persona: str) -> np.ndarray:
        """Create a feature vector from a persona profile."""
        profile = PERSONA_FEATURE_PROFILES.get(persona)
        if not profile:
            raise ValueError(f"Unknown persona: {persona}")

        category_to_score = {
            "Natural": 4.0,
            "Adventure": 5.0,
            "Cultural": 3.5,
            "Religious": 3.0,
            "Historic": 3.5,
            "Monument": 3.0,
            "Resort": 2.5,
        }

        preferred_categories = profile.get("category", ["Cultural"])
        category_score = np.mean([category_to_score.get(cat, 3.0) for cat in preferred_categories])

        features = [
            profile.get("budget_level", 3.0),
            profile.get("rating_weight", 0.7) * 5.0,
            profile.get("weather_suitability", 0.7) * 5.0,
            profile.get("activity_level", 3.0),
            category_score,
            1.0,  # Prefer spring/winter
        ]

        return np.array(features, dtype=np.float32)

    def recommend(self, persona: str, top_k: int = 10,
                  hidden_gems: bool = True) -> Dict[str, Any]:
        """
        Recommend destinations based on persona.

        Args:
            persona: One of the 5 persona types
            top_k: Number of top recommendations to return
            hidden_gems: Whether to include lesser-known gems (lower ratings)

        Returns:
            Dictionary with recommended destinations
        """
        if self.feature_matrix is None:
            raise RuntimeError("Feature matrix not initialized")

        profile = PERSONA_FEATURE_PROFILES.get(persona)
        if not profile:
            raise ValueError(f"Unknown persona: {persona}")

        preferred_categories = set(profile.get("category", []))

        persona_vector = self._create_persona_vector(persona)
        persona_vector = self.scaler.transform([persona_vector])[0]

        # Compute cosine similarity
        similarities = cosine_similarity([persona_vector], self.feature_matrix)[0]

        # Apply category preference boosting (20% boost)
        adjusted_similarities = similarities.copy()
        for idx, dest in self.destinations.iterrows():
            if str(dest["category"]) in preferred_categories:
                adjusted_similarities[idx] *= 1.20

        ranked_indices = np.argsort(adjusted_similarities)[::-1]

        recommendations = []
        hidden_gems_list = []

        for idx in ranked_indices:
            dest = self.destinations.iloc[idx]
            similarity_score = similarities[idx]

            rec = {
                "place_name": dest["place_name"],
                "city": dest["city"],
                "state": dest["state"],
                "category": str(dest["category"]),
                "rating": float(dest["user_rating"]),
                "entry_fee_inr": float(dest["entry_fee_inr"]),
                "latitude": float(dest["latitude"]),
                "longitude": float(dest["longitude"]),
                "ideal_season": str(dest["season"]),
                "best_travel_type": str(dest["travel_type"]),
                "match_score": float(similarity_score),
                "description": self._generate_description(dest, persona),
            }

            if dest["user_rating"] < 3.5 and hidden_gems:
                if len(hidden_gems_list) < max(2, top_k // 3):
                    hidden_gems_list.append(rec)
            else:
                if len(recommendations) < top_k:
                    recommendations.append(rec)

        if hidden_gems and len(recommendations) < top_k:
            recommendations.extend(hidden_gems_list[: max(0, top_k - len(recommendations))])

        return {
            "persona": persona,
            "total_destinations_considered": len(self.destinations),
            "recommendations": recommendations[:top_k],
            "hidden_gems_count": len(hidden_gems_list),
        }

    def _generate_description(self, destination: pd.Series, persona: str) -> str:
        """Generate a personalized description for a destination."""
        category = str(destination["category"])
        rating = float(destination["user_rating"])

        persona_desc = {
            "Adventurer": f"Perfect for your adventurous spirit! This {category.lower()} destination offers thrilling experiences.",
            "Relaxed Vacationer": f"Ideal for unwinding! This scenic {category.lower()} spot is perfect for a relaxing getaway.",
            "Culture & Food Explorer": f"Rich in cultural heritage, this {category.lower()} is a must-visit for culture enthusiasts.",
            "Budget Backpacker": f"Great value! This {category.lower()} offers amazing experiences without breaking the bank.",
            "Luxury Wellness Seeker": f"Premium experience awaits! This exclusive {category.lower()} offers luxury and wellness.",
        }

        rating_comment = (
            " Highly rated by visitors!" if rating >= 4.5
            else " Well-reviewed by travelers." if rating >= 4.0
            else " Worth exploring!"
        )

        return (
            persona_desc.get(persona, f"A wonderful {category.lower()} destination.")
            + rating_comment
        )

    def get_stats(self) -> Dict[str, Any]:
        """Get statistics about the destination dataset."""
        if self.destinations is None:
            return {}

        return {
            "total_destinations": len(self.destinations),
            "categories": self.destinations["category"].astype(str).unique().tolist(),
            "num_categories": self.destinations["category"].nunique(),
            "states": self.destinations["state"].astype(str).unique().tolist(),
            "num_states": self.destinations["state"].nunique(),
            "avg_rating": float(self.destinations["user_rating"].mean()),
            "rating_range": (
                float(self.destinations["user_rating"].min()),
                float(self.destinations["user_rating"].max()),
            ),
            "entry_fee_range": (
                float(self.destinations["entry_fee_inr"].min()),
                float(self.destinations["entry_fee_inr"].max()),
            ),
            "entry_fee_avg": float(self.destinations["entry_fee_inr"].mean()),
        }


# ── Singleton ──────────────────────────────────────────────────────────────
# Using an explicit None sentinel instead of the fragile globals() check.
_recommender_instance: Optional[DestinationRecommender] = None


def get_recommender() -> DestinationRecommender:
    """Get or create a singleton recommender instance (lazy, loaded once)."""
    global _recommender_instance
    if _recommender_instance is None:
        _recommender_instance = DestinationRecommender()
    return _recommender_instance


if __name__ == "__main__":
    # Quick test
    rec = DestinationRecommender()

    print("\n" + "=" * 60)
    print("DESTINATION RECOMMENDER TEST")
    print("=" * 60)

    stats = rec.get_stats()
    print(f"\n📊 Dataset Stats:")
    print(f"   Total Destinations: {stats['total_destinations']}")
    print(f"   Categories: {stats['num_categories']}")
    print(f"   States: {stats['num_states']}")
    print(f"   Avg Rating: {stats['avg_rating']:.2f}/5.0")
    print(f"   Entry Fee Range: ₹{stats['entry_fee_range'][0]:.0f} - ₹{stats['entry_fee_range'][1]:.0f}")

    for persona in PERSONA_FEATURE_PROFILES.keys():
        print(f"\n{'─'*60}")
        print(f"🎯 Recommendations for: {persona}")
        print(f"{'─'*60}")

        result = rec.recommend(persona, top_k=5)
        for i, rec_dest in enumerate(result["recommendations"], 1):
            print(f"\n{i}. {rec_dest['place_name']}")
            print(f"   📍 {rec_dest['city']}, {rec_dest['state']}")
            print(f"   ⭐ Rating: {rec_dest['rating']:.1f}/5.0 | Match: {rec_dest['match_score']:.2%}")
            print(f"   💰 Entry Fee: ₹{rec_dest['entry_fee_inr']:.0f}")
            print(f"   🏷️  Category: {rec_dest['category']}")
            print(f"   📝 {rec_dest['description']}")
