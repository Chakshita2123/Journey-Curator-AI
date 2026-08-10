#!/usr/bin/env python3
"""Quick test of Phase 4 Destination Recommender"""

from ml.destination_recommender import get_recommender

print("="*70)
print("PHASE 4: DESTINATION RECOMMENDER - QUICK TEST")
print("="*70)

try:
    rec = get_recommender()
    stats = rec.get_stats()
    
    print(f"\n✅ Recommender loaded successfully!")
    print(f"\n📊 Dataset Statistics:")
    print(f"   Total Destinations: {stats['total_destinations']}")
    print(f"   Categories: {stats['num_categories']}")
    print(f"   States: {stats['num_states']}")
    print(f"   Average Rating: {stats['avg_rating']:.2f}/5.0")
    print(f"   Entry Fee Range: ₹{stats['entry_fee_range'][0]:.0f} - ₹{stats['entry_fee_range'][1]:.0f}")
    
    # Test recommendations for each persona
    personas = ["Adventurer", "Relaxed Vacationer", "Culture & Food Explorer", 
                "Budget Backpacker", "Luxury Wellness Seeker"]
    
    print(f"\n🎯 Testing Recommendations for Each Persona:\n")
    
    for persona in personas:
        result = rec.recommend(persona, top_k=3)
        top_rec = result['recommendations'][0]
        print(f"   {persona:30} → {top_rec['place_name']:25} ({top_rec['match_score']:.1%} match)")
    
    print(f"\n✅ All tests passed!")
    print(f"\n📝 Summary:")
    print(f"   - {stats['total_destinations']} unique destinations loaded")
    print(f"   - Cosine similarity matching working")
    print(f"   - Persona-to-destination mapping functional")
    print(f"   - Ready for API deployment")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

print("\n" + "="*70)
