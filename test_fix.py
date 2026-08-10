#!/usr/bin/env python3
"""Test the fixed feature engineering"""

from ml.destination_recommender import DestinationRecommender

rec = DestinationRecommender()

print("\n" + "="*70)
print("FIXED RECOMMENDATIONS - Adventurer Persona")
print("="*70 + "\n")

result = rec.recommend('Adventurer', top_k=10)

for i, r in enumerate(result['recommendations'], 1):
    print(f"{i:2}. {r['place_name']:30} ({r['category']:12}) Match: {r['match_score']:6.1%}")

print("\n" + "="*70)
print("COMPARISON - Other Personas")
print("="*70 + "\n")

for persona in ["Relaxed Vacationer", "Culture & Food Explorer", "Budget Backpacker", "Luxury Wellness Seeker"]:
    result = rec.recommend(persona, top_k=3)
    top = result['recommendations'][0]
    print(f"{persona:30} → {top['place_name']:25} ({top['category']:12}) {top['match_score']:6.1%}")
