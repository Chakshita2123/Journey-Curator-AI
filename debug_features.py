#!/usr/bin/env python3
"""Debug feature vectors after the fix"""

import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.preprocessing import StandardScaler

# Load and setup
data = pd.read_csv(Path("data/indian_tourist_places_dataset.csv"))
destinations = data.drop_duplicates(subset=['place_name']).reset_index(drop=True)

print("\n" + "="*90)
print("FEATURE VECTOR ANALYSIS (After Fix)")
print("="*90 + "\n")

# Extract features for specific destinations
def extract_features(dest_row):
    features = []
    
    # 1. Budget (inverted entry fee)
    max_entry = 500
    budget_score = 5.0 - min(dest_row['entry_fee_inr'] / max_entry * 5.0, 5.0)
    features.append(budget_score)
    
    # 2. Rating
    features.append(dest_row['user_rating'])
    
    # 3. Weather suitability
    features.append(dest_row['weather_suitability_score'] * 5.0)
    
    # 4. Activity (NEW: based on category)
    category = dest_row['category']
    category_activity_level = {
        'Natural': 4.5,
        'Adventure': 5.0,
        'Cultural': 3.0,
        'Historic': 2.5,
        'Religious': 2.0,
        'Monument': 2.5,
        'Resort': 2.0,
    }.get(category, 3.0)
    features.append(category_activity_level)
    
    # 5. Category score
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
    
    # 6. Season
    season_score = 1.0 if dest_row['season'] in ['Winter', 'Spring'] else 0.5
    features.append(season_score)
    
    return np.array(features), category

# Compare key destinations
test_dests = ['Pari Mahal', 'Emerald Lake', 'Beas River', 'Amber Fort', 'Samanar Hills']

print("RAW FEATURES (before scaling):")
print("-" * 90)
print(f"{'Destination':<25} {'Category':<12} {'Budget':>8} {'Rating':>8} {'Weather':>8} {'Activity':>8} {'Category':>8} {'Season':>8}")
print("-" * 90)

feature_dict = {}
for test_dest in test_dests:
    dest = destinations[destinations['place_name'] == test_dest].iloc[0]
    features, cat = extract_features(dest)
    feature_dict[test_dest] = features
    print(f"{test_dest:<25} {cat:<12} {features[0]:8.2f} {features[1]:8.2f} {features[2]:8.2f} {features[3]:8.2f} {features[4]:8.2f} {features[5]:8.2f}")

# Normalize with StandardScaler (like the recommender does)
all_features = np.array([feature_dict[d] for d in test_dests])
scaler = StandardScaler()
scaled = scaler.fit_transform(all_features)

print("\n\nNORMALIZED FEATURES (after scaling):")
print("-" * 90)
print(f"{'Destination':<25} {'Budget':>8} {'Rating':>8} {'Weather':>8} {'Activity':>8} {'Category':>8} {'Season':>8}")
print("-" * 90)

scaled_dict = {}
for i, test_dest in enumerate(test_dests):
    scaled_dict[test_dest] = scaled[i]
    print(f"{test_dest:<25} {scaled[i][0]:8.2f} {scaled[i][1]:8.2f} {scaled[i][2]:8.2f} {scaled[i][3]:8.2f} {scaled[i][4]:8.2f} {scaled[i][5]:8.2f}")

# Adventurer persona vector
adventurer_persona = np.array([2.5, 0.7*5.0, 0.75*5.0, 4.5, 3.0, 1.0])
adventurer_scaled = scaler.transform([adventurer_persona])[0]

print("\n\nADVENTURER PERSONA VECTOR:")
print("-" * 90)
print(f"Raw:      {adventurer_persona}")
print(f"Scaled:   {adventurer_scaled}")

# Calculate cosine similarity
from sklearn.metrics.pairwise import cosine_similarity

print("\n\nCOSINE SIMILARITY SCORES:")
print("-" * 90)
print(f"{'Destination':<25} {'Similarity':>12}")
print("-" * 90)

similarities = cosine_similarity([adventurer_scaled], scaled)[0]
for i, test_dest in enumerate(test_dests):
    print(f"{test_dest:<25} {similarities[i]:12.4f}")

print("\n✅ Note: Pari Mahal (Historic, activity=2.5) vs Emerald Lake (Natural, activity=4.5)")
print("   If fix works, Natural destinations should score higher for Adventurer")
