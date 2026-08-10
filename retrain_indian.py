"""
Quick retrain script for indian_tourist_places_dataset.csv
Run from project root:
    .venv\Scripts\python retrain_indian.py
"""
import sys
from pathlib import Path

# Make sure ml package is importable from project root
sys.path.insert(0, str(Path(__file__).resolve().parent))

import numpy as np
import pandas as pd
from ml.model import (
    load_data,
    preprocess_indian_dataset,
    train_models,
    evaluate_models,
    select_best_model,
    cross_validate_models,
)
from sklearn.model_selection import train_test_split

DATA_PATH = "data/indian_tourist_places_dataset.csv"
OUTPUT_PATH = "models/cost_predictor_indian.joblib"
REPORT_PATH = "training_report_indian.txt"

print("=" * 60)
print("Journey Curator AI — Indian Dataset Retraining")
print("=" * 60)

# 1. Load & preprocess
print(f"\n[1/4] Loading dataset: {DATA_PATH}")
df = load_data(DATA_PATH)
total_raw = len(df)
print(f"      Raw rows (excl. header): {total_raw}")

X, y, preprocessor = preprocess_indian_dataset(df)
usable_rows = len(y)
print(f"      Usable rows after dropna(entry_fee_inr): {usable_rows}")
print(f"      Features used: {list(X.columns)}")
print(f"      Target: entry_fee_inr  |  range Rs.{y.min():.0f} - Rs.{y.max():.0f}  |  mean Rs.{y.mean():.0f}")

# 2. 5-fold cross-validation
print("\n[2/4] Running 5-fold cross-validation (all 3 models)...")
cv_metrics = cross_validate_models(X, y, preprocessor, n_folds=5)

# 3. Single 80/20 split
print("\n[3/4] Training on 80/20 split...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print(f"      Train rows: {len(X_train)}  |  Test rows: {len(X_test)}")
models = train_models(X_train, y_train, preprocessor)
metrics = evaluate_models(models, X_test, y_test)
best_name, best_model = select_best_model(metrics, models)

# 4. Save
print(f"\n[4/4] Saving best model ({best_name}) to {OUTPUT_PATH}")
Path(OUTPUT_PATH).parent.mkdir(parents=True, exist_ok=True)
import joblib
joblib.dump(best_model, OUTPUT_PATH)

# RESULTS
print("\n" + "=" * 60)
print("RESULTS")
print("=" * 60)

print(f"\nDataset Summary")
print(f"   Total raw rows      : {total_raw:,}")
print(f"   Usable rows         : {usable_rows:,}")
print(f"   Train / Test split  : {len(X_train):,} / {len(X_test):,}  (80/20)")

print("\nSingle 80/20 Split - Hold-out Test Metrics")
print(f"   {'Model':<20} {'RMSE':>10} {'MAE':>10} {'R2':>8}")
print("   " + "-" * 52)
for name, m in metrics.items():
    marker = "  * BEST" if name == best_name else ""
    print(f"   {name:<20} {m['rmse']:>10.2f} {m['mae']:>10.2f} {m['r2']:>8.4f}{marker}")

print("\n5-Fold Cross-Validation - Mean R2 +/- Std Dev")
print(f"   {'Model':<20} {'Mean R2':>10} {'+/- Std':>10}  Fold scores")
print("   " + "-" * 70)
for name, cv in cv_metrics.items():
    fold_str = "  [" + ", ".join(f"{s:.4f}" for s in cv["cv_r2_scores"]) + "]"
    print(f"   {name:<20} {cv['cv_r2_mean']:>10.4f} {cv['cv_r2_std']:>10.4f}{fold_str}")

# Write report
report = [
    "Journey Curator AI - Indian Dataset Training Report",
    "=" * 55,
    f"Data source  : {DATA_PATH}",
    f"Saved model  : {OUTPUT_PATH}",
    f"Best model   : {best_name}",
    "",
    "Dataset stats:",
    f"  Total raw rows : {total_raw:,}",
    f"  Usable rows    : {usable_rows:,}  (after dropna on entry_fee_inr)",
    f"  Train / Test   : {len(X_train):,} / {len(X_test):,}  (80/20, random_state=42)",
    "",
    "--- Single 80/20 Split Metrics ---",
]
for name, m in metrics.items():
    report.append(f"- {name}: RMSE={m['rmse']:.2f}, MAE={m['mae']:.2f}, R2={m['r2']:.4f}")

report.append("\n--- 5-Fold Cross-Validation R2 ---")
for name, cv in cv_metrics.items():
    fold_scores = ", ".join(f"{s:.4f}" for s in cv["cv_r2_scores"])
    report.append(
        f"- {name}: Mean R2={cv['cv_r2_mean']:.4f} +/- {cv['cv_r2_std']:.4f}  |  Folds: [{fold_scores}]"
    )

Path(REPORT_PATH).write_text("\n".join(report), encoding="utf-8")
print(f"\nReport saved to: {REPORT_PATH}")
print(f"Model saved to : {OUTPUT_PATH}")
