"""
Memory profiler for Journey Curator AI uvicorn app.

Usage (run from project root with venv activated):
    python profile_memory.py

Measures RSS before and after loading each major component.
Run BEFORE and AFTER applying memory optimisations to compare.
"""

import gc
import os
import sys
import time

try:
    import psutil
except ImportError:
    print("psutil not installed. Run: pip install psutil")
    sys.exit(1)

PROC = psutil.Process(os.getpid())


def rss_mb() -> float:
    """Return current Resident Set Size in MiB."""
    return PROC.memory_info().rss / 1024 / 1024


def checkpoint(label: str) -> float:
    gc.collect()
    mb = rss_mb()
    print(f"  [{mb:7.1f} MB RSS]  {label}")
    return mb


# ── 0. Baseline ────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("  Journey Curator AI — Memory Profile")
print("=" * 60)

baseline = checkpoint("Baseline (Python process started)")

# ── 1. Heavy imports ───────────────────────────────────────────────────────
print("\n-- Importing dependencies --")
import numpy as np
import pandas as pd
import joblib
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity

after_imports = checkpoint("After numpy / pandas / sklearn imports")

# ── 2. Load destination recommender (the big one) ──────────────────────────
print("\n-- Loading DestinationRecommender (CSV + feature matrix) --")
t0 = time.perf_counter()
from ml.destination_recommender import get_recommender
recommender = get_recommender()
t1 = time.perf_counter()
after_recommender = checkpoint(f"After get_recommender() [{t1-t0:.2f}s]")

print(f"     destinations shape  : {recommender.destinations.shape if recommender.destinations is not None else 'N/A'}")
print(f"     feature_matrix shape: {recommender.feature_matrix.shape if recommender.feature_matrix is not None else 'N/A'}")
if hasattr(recommender, 'df') and recommender.df is not None:
    raw_kb = recommender.df.memory_usage(deep=True).sum() / 1024
    print(f"     raw df still alive  : {raw_kb:.1f} KB  ← wasted memory")
else:
    print(f"     raw df freed        : OK")

# ── 3. Load cost predictor model ───────────────────────────────────────────
print("\n-- Loading cost predictor (joblib) --")
from ml.model import load_model, load_preprocessor
t0 = time.perf_counter()
model = load_model()
preprocessor_obj = load_preprocessor()
t1 = time.perf_counter()
after_model = checkpoint(f"After load_model() + load_preprocessor() [{t1-t0:.2f}s]")

# ── 4. Simulate /recommend-destinations ───────────────────────────────────
print("\n-- Simulating /recommend-destinations (all personas) --")
for persona in ["General", "Adventurer", "Relaxed Vacationer",
                "Culture & Food Explorer", "Budget Backpacker", "Luxury Wellness Seeker"]:
    recommender.recommend(persona=persona, top_k=10)
after_recommend = checkpoint("After 6 recommend() calls")

# ── 5. Simulate /predict-cost (re-reads CSV each call in the BEFORE version) ─
print("\n-- Simulating /predict-cost --")
from ml.model import get_prediction_with_suggestions
payload = {
    "destination": "Goa",
    "duration": 5.0,
    "accommodation_type": "Hotel",
    "transportation_type": "Flight",
    "age": 28,
    "nationality": "Indian",
}
t0 = time.perf_counter()
result = get_prediction_with_suggestions(payload)
t1 = time.perf_counter()
after_predict = checkpoint(f"After get_prediction_with_suggestions() [{t1-t0:.2f}s]")

# ── 6. Summary ────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("  SUMMARY")
print("=" * 60)
rows = [
    ("Baseline",                baseline),
    ("After imports",           after_imports),
    ("After recommender load",  after_recommender),
    ("After cost model load",   after_model),
    ("After recommend() calls", after_recommend),
    ("After predict-cost call", after_predict),
]
for label, mb in rows:
    bar = "█" * int(mb / 5)
    print(f"  {label:<35} {mb:7.1f} MB  {bar}")

peak = max(m for _, m in rows)
print(f"\n  Peak recorded RSS   : {peak:.1f} MB")
print(f"  Recommender delta   : {after_recommender - baseline:.1f} MB")
print(f"  Cost model delta    : {after_model - after_recommender:.1f} MB")
print(f"  512 MB limit?       : {'⚠️  OVER 450MB WARNING!' if peak > 450 else '✅ Under 450 MB comfort zone'}")
print()
