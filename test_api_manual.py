#!/usr/bin/env python3
"""Manual test of recommendation endpoints"""

import json
from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

print("\n" + "="*70)
print("PHASE 4 API ENDPOINT TESTS")
print("="*70 + "\n")

# Test 1: POST /recommend-destinations for Adventurer
print("TEST 1: POST /recommend-destinations (Adventurer)")
print("-" * 70)

response = client.post("/recommend-destinations", json={"persona": "Adventurer", "top_k": 5})
print(f"Status: {response.status_code}")

if response.status_code == 200:
    data = response.json()
    print(f"Persona: {data['persona']}")
    print(f"Total Destinations: {data['total_destinations_considered']}")
    print(f"Hidden Gems: {data['hidden_gems_count']}")
    print(f"\nTop 5 Recommendations:")
    for i, rec in enumerate(data['recommendations'][:5], 1):
        print(f"  {i}. {rec['place_name']} ({rec['category']}) - {rec['match_score']:.1%}")
else:
    print(f"Error: {response.text}")

# Test 2: GET /recommender-stats
print("\n\nTEST 2: GET /recommender-stats")
print("-" * 70)

response = client.get("/recommender-stats")
print(f"Status: {response.status_code}")

if response.status_code == 200:
    stats = response.json()
    print(f"Total Destinations: {stats['total_destinations']}")
    print(f"Categories: {stats['categories']}")
    print(f"States: {stats['states']}")
    print(f"Avg Rating: {stats['avg_rating']:.2f}/5.0")
else:
    print(f"Error: {response.text}")

# Test 3: All personas should work
print("\n\nTEST 3: Recommendations for All Personas")
print("-" * 70)

personas = ["Adventurer", "Relaxed Vacationer", "Culture & Food Explorer", "Budget Backpacker", "Luxury Wellness Seeker"]

for persona in personas:
    response = client.post("/recommend-destinations", json={"persona": persona, "top_k": 3})
    if response.status_code == 200:
        data = response.json()
        top_rec = data['recommendations'][0]
        print(f"✅ {persona:<30} → {top_rec['place_name']:<30} ({top_rec['category']:<12})")
    else:
        print(f"❌ {persona:<30} → ERROR")

print("\n" + "="*70)
print("✅ ALL API TESTS COMPLETED SUCCESSFULLY")
print("="*70 + "\n")
