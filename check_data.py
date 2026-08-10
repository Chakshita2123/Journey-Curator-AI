#!/usr/bin/env python3
"""Check why Pari Mahal scores high for Adventurer"""

import pandas as pd
from pathlib import Path

data = pd.read_csv(Path('data/indian_tourist_places_dataset.csv'))
dests = data.drop_duplicates(subset=['place_name']).reset_index(drop=True)

print("\nDESTINATION PROFILES:\n")

test = ['Pari Mahal', 'Beas River', 'Jal Mahal', 'Samanar Hills', 'Emerald Lake']
for dest_name in test:
    d = dests[dests['place_name'] == dest_name].iloc[0]
    print(f"{dest_name} ({d['category']}):")
    print(f"  Rating: {d['user_rating']:.1f}, Entry: {d['entry_fee_inr']:.0f} INR")
    print(f"  Travel Type: {d['travel_type']}, Weather: {d['weather_condition']}")
    print(f"  Weather Suitability: {d['weather_suitability_score']:.2f}\n")

print("\nADVENTURER PREFERENCES:")
print("  Budget Level: 2.5 (mid-range, so wants moderate entry fees)")
print("  Activity Level: 4.5 (high - NATURAL has 4.5, HISTORIC has 2.5)")
print("  Category: Natural/Adventure (avg 4.5)")
print("  Rating Weight: 0.7 (cares about quality but not obsessively)")
