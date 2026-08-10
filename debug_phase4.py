#!/usr/bin/env python3
"""Debug Phase 4 Issues - Dataset and Feature Engineering"""

import pandas as pd
import numpy as np
from ml.destination_recommender import (
    DestinationRecommender, 
    PERSONA_FEATURE_PROFILES,
    get_recommender
)

print("="*80)
print("PHASE 4 DEBUG: Dataset & Feature Engineering Validation")
print("="*80)

# ========== ISSUE 1: Dataset Deduplication ==========
print("\n" + "="*80)
print("ISSUE 1: Dataset Coverage — 13,000 rows → 74 destinations")
print("="*80)

df_raw = pd.read_csv('data/indian_tourist_places_dataset.csv')
print(f"\n📊 RAW DATASET:")
print(f"   Total rows: {len(df_raw)}")
print(f"   Unique place_name values: {df_raw['place_name'].nunique()}")
print(f"   Unique place_id values: {df_raw['place_id'].nunique()}")

print(f"\n📋 Why 74 destinations from 13K rows?")
print(f"   → Original data is VISITOR-LEVEL (each row = one visitor's experience)")
print(f"   → Multiple visitors reviewed the SAME destination")
print(f"   → That's CORRECT behavior for aggregation")

print(f"\n🔍 Top 10 destinations by visit count:")
visit_counts = df_raw['place_name'].value_counts().head(10)
for place, count in visit_counts.items():
    print(f"   {place:30} → {count} visits (reviews/observations)")

total_visits = len(df_raw)
unique_places = df_raw['place_name'].nunique()
avg_visits = total_visits / unique_places
print(f"\n📈 Aggregation Statistics:")
print(f"   Total visit records: {total_visits}")
print(f"   Unique destinations: {unique_places}")
print(f"   Average visits per destination: {avg_visits:.1f}")
print(f"   ✅ VERDICT: Deduplication is CORRECT (aggregating visitor-level data)")

# ========== ISSUE 2: Feature Engineering & Persona Matching ==========
print("\n" + "="*80)
print("ISSUE 2: Adventurer Getting Palaces/Temples Instead of Natural Places")
print("="*80)

rec = get_recommender()

print(f"\n🎭 Adventurer Profile (from PERSONA_FEATURE_PROFILES):")
adv_profile = PERSONA_FEATURE_PROFILES["Adventurer"]
for key, val in adv_profile.items():
    print(f"   {key:30} = {val}")

print(f"\n🔍 Feature Matrix Check - Top 10 destinations:")
print(f"   Format: [Budget(0-5), Rating(0-5), Weather(0-5), Activity(1-5), Category(2.5-5), Season(0.5-1)]")

destinations = rec.destinations.copy()
for i, (idx, dest) in enumerate(destinations.head(10).iterrows()):
    feature_vec = rec._extract_features(dest)
    print(f"\n   {i+1}. {dest['place_name']}")
    print(f"      Category: {dest['category']:12} | Activity Travel: {dest['travel_type']}")
    print(f"      Features: [{feature_vec[0]:.1f}, {feature_vec[1]:.1f}, {feature_vec[2]:.1f}, {feature_vec[3]:.1f}, {feature_vec[4]:.1f}, {feature_vec[5]:.1f}]")
    print(f"                 [Budget Rating Weather Activity Category Season]")

print(f"\n⚠️ ISSUE IDENTIFIED:")
print(f"   Activity Level Feature is based on TRAVEL_TYPE (Solo=4.0, Family=2.5, etc.)")
print(f"   NOT on actual destination activity features")
print(f"   → Pari Mahal, temple visits → grouped as 'Solo' travel = high activity score")
print(f"   → But Solo != Adventurous activities (it's just travel companion type)")

print(f"\n🔴 FEATURE ENGINEERING BUG FOUND:")
print(f"   Current: activity_level = travel_type_activity[travel_type]")
print(f"   Problem: Travel type ≠ Activity level")
print(f"   Example: Solo visitor to a palace ≠ Adventure activity")

# Get actual recommendations to show the problem
print(f"\n📍 Actual Adventurer Recommendations (showing the bug):")
adv_result = rec.recommend("Adventurer", top_k=5)
for i, rec_dest in enumerate(adv_result['recommendations'], 1):
    print(f"   {i}. {rec_dest['place_name']:30} ({rec_dest['category']:12}) Match: {rec_dest['match_score']:.1%}")

print(f"\n💡 ROOT CAUSE:")
print(f"   The dataset has NO explicit 'activity difficulty' feature")
print(f"   Only categories: Natural, Historic, Religious, Cultural, Monument")
print(f"   We're confusing 'travel_type' (Solo/Family/Group) with 'activity level'")

print("\n" + "="*80)
print("RECOMMENDATIONS TO FIX")
print("="*80)
print("""
1. For "Adventurer" persona, SHOULD prioritize:
   - Natural category destinations (hiking, outdoor)
   - NOT Historic/Religious (stationary sightseeing)
   
2. Dataset LACKS:
   - Explicit activity_level or difficulty rating (easy/moderate/hard)
   - Trekking/climbing/adventure flags
   
3. Current feature engineering using travel_type is INCORRECT because:
   - Solo travelers can visit temples (not adventure)
   - Group travelers can go on treks (IS adventure)
   - No correlation between travel_type and adventure level

4. Solution options:
   a) FIX: Map category → activity potential
      - Natural + high_rating = adventure-suitable
      - Historic/Religious = low adventure
   
   b) BETTER: Infer from category + rating pattern
      - Natural places with high ratings = good for adventure
      - Check if visited during monsoon (implies outdoor resilience)
""")
