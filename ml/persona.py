import os
from pathlib import Path
from typing import Any, Dict, List, Tuple
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, f1_score
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "persona_classifier.joblib"

PERSONA_DETAILS: Dict[str, Dict[str, Any]] = {
    "Adventurer": {
        "title": "Thrill Seeker & Outdoor Adventurer 🏔️",
        "description": "You thrive on adrenaline, outdoor trails, and action-packed journeys.",
        "badge_color": "coral",
        "recommended_styles": ["Adventure", "Backpacker", "Outdoor"],
        "tip": "Pack durable gear and focus on destinations with national parks, hiking, or watersports!"
    },
    "Relaxed Vacationer": {
        "title": "Chill & Scenic Vacationer 🏖️",
        "description": "You travel to unwind, soak in beautiful views, and recharge without any rush.",
        "badge_color": "teal",
        "recommended_styles": ["Comfort", "Relaxed", "Resort"],
        "tip": "Book stays with scenic views and leave plenty of unplanned buffer time in your day."
    },
    "Culture & Food Explorer": {
        "title": "Culture & Culinary Connoisseur 🍜",
        "description": "You love deep history, authentic street food, museums, and immersive local culture.",
        "badge_color": "purple",
        "recommended_styles": ["Cultural", "Comfort", "City Explorer"],
        "tip": "Join local guided food walks and visit historic heritage quarters."
    },
    "Budget Backpacker": {
        "title": "Smart Budget Backpacker 🎒",
        "description": "You prioritize maximum experiences for minimum spend, loving hostels and local transport.",
        "badge_color": "amber",
        "recommended_styles": ["Budget", "Backpacker"],
        "tip": "Stay in social hostels, leverage public transit, and eat like a local!"
    },
    "Luxury Wellness Seeker": {
        "title": "Luxury & Wellness Escape 👑",
        "description": "You prefer premium comforts, fine dining, spa wellness, and top-tier hospitality.",
        "badge_color": "yellow",
        "recommended_styles": ["Luxury", "Resort", "Wellness"],
        "tip": "Look for boutique resorts, private transfers, and curated fine dining experiences."
    }
}


def heuristic_label_row(row: pd.Series) -> str:
    """Heuristic logic to assign persona based on 6 preference features (scale 1-5)."""
    nature = row["nature_vs_nightlife"]
    budget = row["budget_vs_luxury"]
    activity = row["activity_level"]
    food = row["food_preference"]
    pace = row["travel_pace"]
    culture = row["cultural_depth"]

    # Scores for each persona
    scores = {
        "Adventurer": (6 - nature) * 0.25 + activity * 0.45 + pace * 0.2,
        "Relaxed Vacationer": (6 - activity) * 0.4 + (6 - pace) * 0.35 + budget * 0.15 + (6 - nature) * 0.1,
        "Culture & Food Explorer": culture * 0.45 + food * 0.3 + pace * 0.15 + (6 - budget) * 0.1,
        "Budget Backpacker": (6 - budget) * 0.5 + (6 - food) * 0.25 + activity * 0.15 + pace * 0.1,
        "Luxury Wellness Seeker": budget * 0.45 + food * 0.3 + (6 - activity) * 0.15 + (6 - pace) * 0.1,
    }
    
    return max(scores, key=scores.get)


def generate_synthetic_dataset(n_samples: int = 3000, seed: int = 42) -> pd.DataFrame:
    """Generates synthetic dataset of quiz responses with heuristic persona labels."""
    np.random.seed(seed)
    
    data = {
        "nature_vs_nightlife": np.random.choice([1, 2, 3, 4, 5], size=n_samples, p=[0.25, 0.2, 0.2, 0.2, 0.15]),
        "budget_vs_luxury": np.random.choice([1, 2, 3, 4, 5], size=n_samples, p=[0.2, 0.25, 0.25, 0.18, 0.12]),
        "activity_level": np.random.choice([1, 2, 3, 4, 5], size=n_samples, p=[0.18, 0.22, 0.25, 0.2, 0.15]),
        "food_preference": np.random.choice([1, 2, 3, 4, 5], size=n_samples, p=[0.2, 0.25, 0.25, 0.18, 0.12]),
        "travel_pace": np.random.choice([1, 2, 3, 4, 5], size=n_samples, p=[0.15, 0.25, 0.3, 0.2, 0.1]),
        "cultural_depth": np.random.choice([1, 2, 3, 4, 5], size=n_samples, p=[0.15, 0.2, 0.3, 0.2, 0.15]),
    }
    df = pd.DataFrame(data)
    
    # Add slight noise to choices to make boundary decisions non-trivial
    df["persona"] = df.apply(heuristic_label_row, axis=1)
    
    # Introduce small label noise (~4%) to simulate human variance
    noise_mask = np.random.rand(len(df)) < 0.04
    personas_list = list(PERSONA_DETAILS.keys())
    for idx in df[noise_mask].index:
        df.loc[idx, "persona"] = np.random.choice(personas_list)
        
    return df


def train_persona_model(n_samples: int = 3000) -> Dict[str, Any]:
    df = generate_synthetic_dataset(n_samples=n_samples)
    
    feature_cols = [
        "nature_vs_nightlife",
        "budget_vs_luxury",
        "activity_level",
        "food_preference",
        "travel_pace",
        "cultural_depth",
    ]
    
    X = df[feature_cols]
    y = df["persona"]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Candidate Models
    pipeline_rf = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", RandomForestClassifier(n_estimators=150, max_depth=10, random_state=42))
    ])
    
    pipeline_lr = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(max_iter=1000, random_state=42))
    ])
    
    rf_cv_scores = cross_val_score(pipeline_rf, X, y, cv=5, scoring="f1_weighted")
    lr_cv_scores = cross_val_score(pipeline_lr, X, y, cv=5, scoring="f1_weighted")
    
    # Fit candidate on train set
    pipeline_rf.fit(X_train, y_train)
    pipeline_lr.fit(X_train, y_train)
    
    rf_preds = pipeline_rf.predict(X_test)
    lr_preds = pipeline_lr.predict(X_test)
    
    rf_acc = accuracy_score(y_test, rf_preds)
    rf_f1 = f1_score(y_test, rf_preds, average="weighted")
    
    lr_acc = accuracy_score(y_test, lr_preds)
    lr_f1 = f1_score(y_test, lr_preds, average="weighted")
    
    if rf_f1 >= lr_f1:
        best_model = pipeline_rf
        best_name = "RandomForest"
        best_acc = rf_acc
        best_f1 = rf_f1
        best_cv_mean = float(np.mean(rf_cv_scores))
        best_cv_std = float(np.std(rf_cv_scores))
        best_report = classification_report(y_test, rf_preds, output_dict=True)
    else:
        best_model = pipeline_lr
        best_name = "LogisticRegression"
        best_acc = lr_acc
        best_f1 = lr_f1
        best_cv_mean = float(np.mean(lr_cv_scores))
        best_cv_std = float(np.std(lr_cv_scores))
        best_report = classification_report(y_test, lr_preds, output_dict=True)
        
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(best_model, MODEL_PATH)
    
    class_counts = df["persona"].value_counts().to_dict()
    
    return {
        "n_samples": n_samples,
        "n_train": len(X_train),
        "n_test": len(X_test),
        "best_model_name": best_name,
        "accuracy": float(best_acc),
        "f1_score": float(best_f1),
        "cv_f1_mean": best_cv_mean,
        "cv_f1_std": best_cv_std,
        "class_distribution": class_counts,
        "classification_report": best_report,
        "rf_f1": float(rf_f1),
        "lr_f1": float(lr_f1),
    }


def load_persona_model() -> Pipeline:
    if not MODEL_PATH.exists():
        # Train on demand if model file does not exist
        train_persona_model()
    return joblib.load(MODEL_PATH)


def predict_persona(quiz_answers: Dict[str, int]) -> Dict[str, Any]:
    model = load_persona_model()
    
    feature_cols = [
        "nature_vs_nightlife",
        "budget_vs_luxury",
        "activity_level",
        "food_preference",
        "travel_pace",
        "cultural_depth",
    ]
    
    input_values = [int(quiz_answers.get(col, 3)) for col in feature_cols]
    input_df = pd.DataFrame([input_values], columns=feature_cols)
    
    predicted_persona = str(model.predict(input_df)[0])
    
    probs = model.predict_proba(input_df)[0]
    classes = list(model.classes_)
    confidence = float(np.max(probs))
    
    breakdown = {cls: float(prob) for cls, prob in zip(classes, probs)}
    
    details = PERSONA_DETAILS.get(predicted_persona, {
        "title": predicted_persona,
        "description": "Custom Travel Persona",
        "badge_color": "coral",
        "recommended_styles": ["Custom"],
        "tip": "Enjoy your customized journey!"
    })
    
    return {
        "persona": predicted_persona,
        "title": details["title"],
        "description": details["description"],
        "badge_color": details["badge_color"],
        "recommended_styles": details["recommended_styles"],
        "tip": details["tip"],
        "confidence": round(confidence, 4),
        "persona_breakdown": breakdown,
        "user_scores": {col: quiz_answers.get(col, 3) for col in feature_cols}
    }


if __name__ == "__main__":
    results = train_persona_model()
    print("=" * 60)
    print("Travel Persona Classifier — Training Summary")
    print("=" * 60)
    print(f"Total Rows Generated : {results['n_samples']}")
    print(f"Train / Test Split   : {results['n_train']} / {results['n_test']}")
    print(f"Best Model           : {results['best_model_name']}")
    print(f"Test Accuracy        : {results['accuracy']:.4f}")
    print(f"Weighted F1 Score    : {results['f1_score']:.4f}")
    print(f"5-Fold CV F1 Score   : {results['cv_f1_mean']:.4f} ± {results['cv_f1_std']:.4f}")
    print("\nClass Distribution:")
    for persona, count in results['class_distribution'].items():
        print(f"  - {persona:<25}: {count} rows")
