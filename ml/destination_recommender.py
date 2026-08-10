"""
Content-Based Destination Recommender for Journey Curator AI

This module creates feature vectors from destination attributes and recommends
destinations based on predicted traveler personas using cosine similarity.
"""

import os
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics.pairwise import cosine_similarity
import joblib

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"

# Persona-to-destination attribute mappings (learned from Phase 3)
PERSONA_FEATURE_PROFILES = {
    "Adventurer": {
        "travel_type": ["Solo", "Group"],  # High-energy group travel
        "category": ["Natural", "Adventure"],  # Nature-based
        "activity_level": 4.5,  # High activity
        "budget_level": 2.5,  # Budget to mid-range
        "pace": 4.0,  # Fast-paced
        "cultural_depth": 1.5,  # Low culture focus
        "weather_suitability": 0.75,  # Moderate weather tolerance
        "rating_weight": 0.7,  # Cares about quality
    },
    "Relaxed Vacationer": {
        "travel_type": ["Couple", "Family"],
        "category": ["Natural", "Resort"],
        "activity_level": 1.5,  # Low activity
        "budget_level": 3.0,  # Mid-range
        "pace": 1.5,  # Slow pace
        "cultural_depth": 2.0,  # Light culture
        "weather_suitability": 0.9,  # Likes good weather
        "rating_weight": 0.8,  # Values comfort/quality
    },
    "Culture & Food Explorer": {
        "travel_type": ["Solo", "Couple"],
        "category": ["Cultural", "Religious", "Historic"],
        "activity_level": 3.0,  # Moderate activity
        "budget_level": 3.0,  # Mid-range
        "pace": 2.5,  # Moderate pace
        "cultural_depth": 5.0,  # Deep culture focus
        "weather_suitability": 0.7,
        "rating_weight": 0.9,  # Highly values authenticity
    },
    "Budget Backpacker": {
        "travel_type": ["Solo", "Group"],
        "category": ["Natural", "Cultural", "Monument"],
        "activity_level": 3.5,  # Moderate-high activity
        "budget_level": 1.0,  # Very budget-conscious
        "pace": 3.5,  # Moderate-fast pace
        "cultural_depth": 3.0,  # Moderate culture
        "weather_suitability": 0.6,  # Flexible with weather
        "rating_weight": 0.6,  # Values cost-effectiveness
    },
    "Luxury Wellness Seeker": {
        "travel_type": ["Couple", "Family"],
        "category": ["Resort", "Religious", "Wellness"],
        "activity_level": 2.0,  # Low-moderate activity
        "budget_level": 5.0,  # Premium/luxury
        "pace": 1.5,  # Slow pace
        "cultural_depth": 2.5,  # Appreciates culture
        "weather_suitability": 0.95,  # Prefers ideal weather
        "rating_weight": 0.95,  # Highly values premium experience
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
        self.df = None
        self.destinations = None
        self.feature_matrix = None
        self.scaler = StandardScaler()
        self._load_data()
    
    def _load_data(self):
        """Load and preprocess destination dataset."""
        print(f"Loading dataset from {self.dataset_path}...")
        self.df = pd.read_csv(self.dataset_path)
        
        # Create unique destinations (deduplicate by place_name)
        self.destinations = self.df.groupby('place_name').agg({
            'place_id': 'first',
            'city': 'first',
            'state': 'first',
            'category': 'first',
            'latitude': 'first',
            'longitude': 'first',
            'user_rating': 'mean',
            'entry_fee_inr': 'first',
            'weather_suitability_score': 'mean',
            'travel_type': lambda x: x.mode()[0] if len(x.mode()) > 0 else 'Family',
            'season': lambda x: x.mode()[0] if len(x.mode()) > 0 else 'Spring',
        }).reset_index()
        
        # Fill missing values
        self.destinations['entry_fee_inr'] = self.destinations['entry_fee_inr'].fillna(0)
        self.destinations['user_rating'] = self.destinations['user_rating'].fillna(3.5)
        self.destinations['weather_suitability_score'] = (
            self.destinations['weather_suitability_score'].fillna(0.7)
        )
        
        print(f"Loaded {len(self.destinations)} unique destinations")
        self._create_feature_matrix()
    
    def _create_feature_matrix(self):
        """Create normalized feature matrix from destinations."""
        features = []
        
        for _, dest in self.destinations.iterrows():
            feature_vector = self._extract_features(dest)
            features.append(feature_vector)
        
        self.feature_matrix = np.array(features)
        # Normalize features
        self.feature_matrix = self.scaler.fit_transform(self.feature_matrix)
        print(f"Created feature matrix with shape {self.feature_matrix.shape}")
    
    def _extract_features(self, destination: pd.Series) -> np.ndarray:
        """
        Extract normalized features from a destination row.
        
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
        budget_score = 5.0 - min(destination['entry_fee_inr'] / max_entry * 5.0, 5.0)
        features.append(budget_score)
        
        # 2. Rating/Quality (0-5)
        features.append(destination['user_rating'])
        
        # 3. Weather suitability (0-1)
        features.append(destination['weather_suitability_score'] * 5.0)  # Scale to 0-5
        
        # 4. Activity intensity based on CATEGORY (NOT travel_type)
        # Adventure/Natural = high activity, Historic/Religious = low activity
        category = destination['category']
        category_activity_level = {
            'Natural': 4.5,      # Hiking, outdoor → high activity
            'Adventure': 5.0,    # Explicit adventure category
            'Cultural': 3.0,     # Museums, galleries → moderate
            'Historic': 2.5,     # Palaces, forts → low activity (stationary sightseeing)
            'Religious': 2.0,    # Temples, shrines → low activity (stationary)
            'Monument': 2.5,     # Similar to historic
            'Resort': 2.0,
        }.get(category, 3.0)
        features.append(category_activity_level)
        
        # 5. Category encoding (create ordinal score)
        category_score = {
            'Natural': 4.0,
            'Adventure': 5.0,
            'Cultural': 3.5,
            'Religious': 3.0,
            'Historic': 3.5,
            'Monument': 3.0,
            'Resort': 2.5,
        }.get(category, 3.0)
        features.append(category_score)
        
        # 6. Season diversity (different seasons suit different personas)
        # Using a binary encoding: is it winter/spring (1) or summer/monsoon (0)
        season_score = 1.0 if destination['season'] in ['Winter', 'Spring'] else 0.5
        features.append(season_score)
        
        return np.array(features)
    
    def _create_persona_vector(self, persona: str) -> np.ndarray:
        """Create a feature vector from a persona profile."""
        profile = PERSONA_FEATURE_PROFILES.get(persona)
        if not profile:
            raise ValueError(f"Unknown persona: {persona}")
        
        # Map preferred categories to an average score
        category_to_score = {
            'Natural': 4.0,
            'Adventure': 5.0,
            'Cultural': 3.5,
            'Religious': 3.0,
            'Historic': 3.5,
            'Monument': 3.0,
            'Resort': 2.5,
        }
        
        # Calculate average category score based on persona preferences
        preferred_categories = profile.get("category", ["Cultural"])
        category_score = np.mean([category_to_score.get(cat, 3.0) for cat in preferred_categories])
        
        # Extract feature values in same order as _extract_features
        features = [
            profile.get("budget_level", 3.0),
            profile.get("rating_weight", 0.7) * 5.0,  # Scale to 0-5
            profile.get("weather_suitability", 0.7) * 5.0,
            profile.get("activity_level", 3.0),
            category_score,  # Now dynamically calculated based on persona preferences
            1.0,  # Prefer spring/winter
        ]
        
        return np.array(features)
    
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
        
        # Get persona profile for category preference filtering
        profile = PERSONA_FEATURE_PROFILES.get(persona)
        if not profile:
            raise ValueError(f"Unknown persona: {persona}")
        
        preferred_categories = set(profile.get("category", []))

        
        # Create persona vector and normalize
        persona_vector = self._create_persona_vector(persona)
        persona_vector = self.scaler.transform([persona_vector])[0]
        
        # Compute cosine similarity
        similarities = cosine_similarity([persona_vector], self.feature_matrix)[0]
        
        # Apply category preference boosting
        # Destinations in preferred categories get a 20% boost to similarity score
        adjusted_similarities = similarities.copy()
        for idx, dest in self.destinations.iterrows():
            if dest['category'] in preferred_categories:
                adjusted_similarities[idx] = adjusted_similarities[idx] * 1.20  # 20% boost
        
        # Rank destinations by adjusted similarity
        ranked_indices = np.argsort(adjusted_similarities)[::-1]
        
        recommendations = []
        hidden_gems_list = []
        
        # Get top recommendations and hidden gems
        for idx in ranked_indices:
            dest = self.destinations.iloc[idx]
            similarity_score = similarities[idx]  # Use original score for reporting
            
            # Create recommendation object
            rec = {
                'place_name': dest['place_name'],
                'city': dest['city'],
                'state': dest['state'],
                'category': dest['category'],
                'rating': float(dest['user_rating']),
                'entry_fee_inr': float(dest['entry_fee_inr']),
                'latitude': float(dest['latitude']),
                'longitude': float(dest['longitude']),
                'ideal_season': dest['season'],
                'best_travel_type': dest['travel_type'],
                'match_score': float(similarity_score),
                'description': self._generate_description(dest, persona),
            }
            
            # Separate hidden gems (lower rating) from main recommendations
            if dest['user_rating'] < 3.5 and hidden_gems:
                if len(hidden_gems_list) < max(2, top_k // 3):
                    hidden_gems_list.append(rec)
            else:
                if len(recommendations) < top_k:
                    recommendations.append(rec)
        
        # Add some hidden gems if not enough main recommendations
        if hidden_gems and len(recommendations) < top_k:
            recommendations.extend(hidden_gems_list[:max(0, top_k - len(recommendations))])
        
        return {
            'persona': persona,
            'total_destinations_considered': len(self.destinations),
            'recommendations': recommendations[:top_k],
            'hidden_gems_count': len(hidden_gems_list),
        }
    
    def _generate_description(self, destination: pd.Series, persona: str) -> str:
        """Generate a personalized description for a destination."""
        category = destination['category']
        rating = destination['user_rating']
        
        persona_desc = {
            'Adventurer': f"Perfect for your adventurous spirit! This {category.lower()} destination offers thrilling experiences.",
            'Relaxed Vacationer': f"Ideal for unwinding! This scenic {category.lower()} spot is perfect for a relaxing getaway.",
            'Culture & Food Explorer': f"Rich in cultural heritage, this {category.lower()} is a must-visit for culture enthusiasts.",
            'Budget Backpacker': f"Great value! This {category.lower()} offers amazing experiences without breaking the bank.",
            'Luxury Wellness Seeker': f"Premium experience awaits! This exclusive {category.lower()} offers luxury and wellness.",
        }
        
        rating_comment = (
            " Highly rated by visitors!" if rating >= 4.5
            else " Well-reviewed by travelers." if rating >= 4.0
            else " Worth exploring!"
        )
        
        return (persona_desc.get(persona, f"A wonderful {category.lower()} destination.") 
                + rating_comment)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get statistics about the destination dataset."""
        if self.destinations is None:
            return {}
        
        return {
            'total_destinations': len(self.destinations),
            'categories': self.destinations['category'].unique().tolist(),
            'num_categories': self.destinations['category'].nunique(),
            'states': self.destinations['state'].unique().tolist(),
            'num_states': self.destinations['state'].nunique(),
            'avg_rating': float(self.destinations['user_rating'].mean()),
            'rating_range': (
                float(self.destinations['user_rating'].min()),
                float(self.destinations['user_rating'].max())
            ),
            'entry_fee_range': (
                float(self.destinations['entry_fee_inr'].min()),
                float(self.destinations['entry_fee_inr'].max())
            ),
            'entry_fee_avg': float(self.destinations['entry_fee_inr'].mean()),
        }


def get_recommender() -> DestinationRecommender:
    """Get or create a singleton recommender instance."""
    global _recommender_instance
    if '_recommender_instance' not in globals():
        _recommender_instance = DestinationRecommender()
    return _recommender_instance


if __name__ == "__main__":
    # Quick test
    rec = DestinationRecommender()
    
    print("\n" + "="*60)
    print("DESTINATION RECOMMENDER TEST")
    print("="*60)
    
    stats = rec.get_stats()
    print(f"\n📊 Dataset Stats:")
    print(f"   Total Destinations: {stats['total_destinations']}")
    print(f"   Categories: {stats['num_categories']}")
    print(f"   States: {stats['num_states']}")
    print(f"   Avg Rating: {stats['avg_rating']:.2f}/5.0")
    print(f"   Entry Fee Range: ₹{stats['entry_fee_range'][0]:.0f} - ₹{stats['entry_fee_range'][1]:.0f}")
    
    # Test recommendation for each persona
    for persona in PERSONA_FEATURE_PROFILES.keys():
        print(f"\n{'─'*60}")
        print(f"🎯 Recommendations for: {persona}")
        print(f"{'─'*60}")
        
        result = rec.recommend(persona, top_k=5)
        for i, rec_dest in enumerate(result['recommendations'], 1):
            print(f"\n{i}. {rec_dest['place_name']}")
            print(f"   📍 {rec_dest['city']}, {rec_dest['state']}")
            print(f"   ⭐ Rating: {rec_dest['rating']:.1f}/5.0 | Match: {rec_dest['match_score']:.2%}")
            print(f"   💰 Entry Fee: ₹{rec_dest['entry_fee_inr']:.0f}")
            print(f"   🏷️  Category: {rec_dest['category']}")
            print(f"   📝 {rec_dest['description']}")
