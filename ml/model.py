import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from xgboost import XGBRegressor

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "cost_predictor.joblib"
PREPROCESSOR_PATH = BASE_DIR / "models" / "preprocessor.joblib"


class ModelLoadError(Exception):
    pass


def load_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    return df


def preprocess_dataframe(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series, ColumnTransformer]:
    expected_target_cols = ["total_trip_cost", "trip_cost", "cost", "total_cost"]
    target_col = next((col for col in expected_target_cols if col in df.columns), None)

    df = df.copy()

    if target_col is None:
        accommodation_cost_col = next((col for col in ["Accommodation cost", "accommodation_cost"] if col in df.columns), None)
        transportation_cost_col = next((col for col in ["Transportation cost", "transportation_cost"] if col in df.columns), None)
        if accommodation_cost_col and transportation_cost_col:
            df[accommodation_cost_col] = pd.to_numeric(df[accommodation_cost_col].astype(str).str.replace(r"[^0-9.\-]", "", regex=True), errors="coerce")
            df[transportation_cost_col] = pd.to_numeric(df[transportation_cost_col].astype(str).str.replace(r"[^0-9.\-]", "", regex=True), errors="coerce")
            df["total_trip_cost"] = df[accommodation_cost_col].fillna(0) + df[transportation_cost_col].fillna(0)
            target_col = "total_trip_cost"
        else:
            raise ValueError("Dataset must contain a cost target column or accommodation/transportation cost columns")

    duration_col = next((col for col in ["Duration (days)", "duration", "trip_duration"] if col in df.columns), None)
    if duration_col is None:
        raise ValueError("Dataset must contain a duration column")

    date_col = next((col for col in ["Start date", "start_date", "travel_date"] if col in df.columns), None)
    age_col = next((col for col in ["Traveler age", "age"] if col in df.columns), None)
    gender_col = next((col for col in ["Traveler gender", "gender"] if col in df.columns), None)
    nationality_col = next((col for col in ["Traveler nationality", "nationality"] if col in df.columns), None)
    destination_col = next((col for col in ["Destination", "destination"] if col in df.columns), None)
    accommodation_col = next((col for col in ["Accommodation type", "accommodation_type"] if col in df.columns), None)
    transportation_col = next((col for col in ["Transportation type", "transportation_type"] if col in df.columns), None)

    df = df.dropna(subset=[target_col, duration_col])

    if date_col is not None:
        df["travel_month"] = pd.to_datetime(df[date_col], errors="coerce").dt.month.fillna(1)
    else:
        df["travel_month"] = 1

    categorical_features = [col for col in [destination_col, accommodation_col, transportation_col, gender_col, nationality_col] if col is not None]
    numeric_features = [duration_col]
    if age_col is not None:
        numeric_features.append(age_col)
    numeric_features.append("travel_month")

    df["cost_per_day"] = df[target_col] / df[duration_col].replace(0, np.nan)
    df["cost_per_day"] = df["cost_per_day"].fillna(df[target_col])

    feature_frame = df[categorical_features + numeric_features + ["cost_per_day"]].copy()
    normalized_columns = []
    for column in categorical_features + numeric_features + ["cost_per_day"]:
        if column == destination_col:
            normalized_columns.append("destination")
        elif column == accommodation_col:
            normalized_columns.append("accommodation_type")
        elif column == transportation_col:
            normalized_columns.append("transportation_type")
        elif column == gender_col:
            normalized_columns.append("gender")
        elif column == nationality_col:
            normalized_columns.append("nationality")
        elif column == duration_col:
            normalized_columns.append("duration")
        elif column == age_col:
            normalized_columns.append("age")
        elif column == "travel_month":
            normalized_columns.append("travel_month")
        else:
            normalized_columns.append(column)

    feature_frame.columns = normalized_columns
    feature_frame = feature_frame.loc[:, ~feature_frame.columns.duplicated()]
    X = feature_frame.copy()
    y = df[target_col].copy()

    categorical_columns = [col for col in X.columns if col in {"destination", "accommodation_type", "transportation_type", "gender", "nationality"}]
    numeric_columns = [col for col in X.columns if col in {"duration", "age", "travel_month", "cost_per_day"}]

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_columns),
            ("num", StandardScaler(), numeric_columns),
        ],
        remainder="drop",
    )
    return X, y, preprocessor


def preprocess_indian_dataset(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series, ColumnTransformer]:
    """Preprocess indian_tourist_places_dataset.csv for entry-fee prediction.

    Target   : entry_fee_inr  (cost column — only used as label, never as feature)
    Features : city, state, category, travel_type, visit_duration, season,
               visit_month (numeric 1-12), is_weekend (0/1)
    """
    df = df.copy()

    # --- target ---
    df["entry_fee_inr"] = pd.to_numeric(df["entry_fee_inr"], errors="coerce")
    df = df.dropna(subset=["entry_fee_inr"])
    y = df["entry_fee_inr"].copy()

    # --- visit_month: already numeric in this dataset ---
    df["visit_month"] = pd.to_numeric(df["visit_month"], errors="coerce").fillna(1).astype(int)

    # --- is_weekend: Yes/No -> 1/0 ---
    df["is_weekend_num"] = (df["is_weekend"].str.strip().str.lower() == "yes").astype(int)

    # --- visit_duration: encode ordinal categories ---
    duration_order = {"< 1 hour": 0, "1-2 hours": 1, "2-4 hours": 2,
                      "4-6 hours": 3, "Full Day": 4}
    df["visit_duration_num"] = df["visit_duration"].map(duration_order).fillna(2)  # default mid

    categorical_columns = ["city", "state", "category", "travel_type", "season"]
    numeric_columns = ["visit_month", "is_weekend_num", "visit_duration_num"]

    # fill missing categoricals with 'Unknown'
    for col in categorical_columns:
        df[col] = df[col].fillna("Unknown").astype(str)

    X = df[categorical_columns + numeric_columns].copy()

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_columns),
            ("num", StandardScaler(), numeric_columns),
        ],
        remainder="drop",
    )
    return X, y, preprocessor


def train_models(X_train: pd.DataFrame, y_train: pd.Series, preprocessor: ColumnTransformer) -> dict[str, Any]:
    models = {
        "LinearRegression": Pipeline([("preprocessor", preprocessor), ("regressor", LinearRegression())]),
        "RandomForest": Pipeline([("preprocessor", preprocessor), ("regressor", RandomForestRegressor(n_estimators=200, random_state=42))]),
        "XGBoost": Pipeline([("preprocessor", preprocessor), ("regressor", XGBRegressor(n_estimators=200, random_state=42, objective="reg:squarederror"))]),
    }
    for pipeline in models.values():
        pipeline.fit(X_train, y_train)
    return models


def evaluate_models(models: dict[str, Any], X_test: pd.DataFrame, y_test: pd.Series) -> dict[str, dict[str, float]]:
    metrics: dict[str, dict[str, float]] = {}
    for name, pipeline in models.items():
        preds = pipeline.predict(X_test)
        metrics[name] = {
            "rmse": float(np.sqrt(mean_squared_error(y_test, preds))),
            "mae": float(mean_absolute_error(y_test, preds)),
            "r2": float(r2_score(y_test, preds)),
        }
    return metrics


def select_best_model(metrics: dict[str, dict[str, float]], models: dict[str, Any]) -> tuple[str, Any]:
    best_name = min(metrics, key=lambda k: metrics[k]["rmse"])
    return best_name, models[best_name]


def save_artifacts(model_name: str, model_pipeline: Any, preprocessor: ColumnTransformer, output_path: str) -> None:
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    PREPROCESSOR_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model_pipeline, MODEL_PATH)
    joblib.dump(preprocessor, PREPROCESSOR_PATH)
    if output_path:
        output_path_obj = Path(output_path)
        output_path_obj.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(model_pipeline, output_path_obj)


def cross_validate_models(
    X: pd.DataFrame,
    y: pd.Series,
    preprocessor: ColumnTransformer,
    n_folds: int = 5,
) -> dict[str, dict[str, float]]:
    """Run k-fold cross-validation for each model and return mean/std R² scores."""
    model_definitions = {
        "LinearRegression": Pipeline([("preprocessor", preprocessor), ("regressor", LinearRegression())]),
        "RandomForest": Pipeline([("preprocessor", preprocessor), ("regressor", RandomForestRegressor(n_estimators=200, random_state=42))]),
        "XGBoost": Pipeline([("preprocessor", preprocessor), ("regressor", XGBRegressor(n_estimators=200, random_state=42, objective="reg:squarederror"))]),
    }
    cv_metrics: dict[str, dict[str, float]] = {}
    for name, pipeline in model_definitions.items():
        scores = cross_val_score(pipeline, X, y, cv=n_folds, scoring="r2")
        cv_metrics[name] = {
            "cv_r2_mean": float(np.mean(scores)),
            "cv_r2_std": float(np.std(scores)),
            "cv_r2_scores": scores.tolist(),
        }
    return cv_metrics


def train_and_evaluate(
    data_path: str,
    output_path: str,
    n_cv_folds: int = 5,
) -> tuple[dict[str, dict[str, float]], str, dict[str, dict[str, float]]]:
    """Train models with a single 80/20 split and 5-fold CV, returning both metric sets.

    Auto-detects dataset type:
      - Indian tourist places dataset  -> preprocess_indian_dataset()
      - Original travel dataset        -> preprocess_dataframe()
    """
    df = load_data(data_path)
    # Auto-detect: Indian dataset has 'entry_fee_inr' column
    if "entry_fee_inr" in df.columns:
        X, y, preprocessor = preprocess_indian_dataset(df)
    else:
        X, y, preprocessor = preprocess_dataframe(df)

    # --- 5-fold cross-validation (reliable estimate on small datasets) ---
    cv_metrics = cross_validate_models(X, y, preprocessor, n_folds=n_cv_folds)

    # --- Single 80/20 split (used for final model selection & saving) ---
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    models = train_models(X_train, y_train, preprocessor)
    metrics = evaluate_models(models, X_test, y_test)
    best_name, best_model = select_best_model(metrics, models)
    save_artifacts(best_name, best_model, preprocessor, output_path)
    return metrics, best_name, cv_metrics


def load_model() -> Any:
    candidate_paths = [MODEL_PATH]
    if not MODEL_PATH.exists():
        model_dir = MODEL_PATH.parent
        model_dir.mkdir(parents=True, exist_ok=True)
        candidate_paths.extend(sorted(model_dir.glob("**/*.joblib")))

    for path in candidate_paths:
        if path.exists():
            return joblib.load(path)

    raise ModelLoadError("Trained model not found. Run ml/train.py to train the model first.")


def load_preprocessor() -> Any:
    candidate_paths = [PREPROCESSOR_PATH]
    if not PREPROCESSOR_PATH.exists():
        model_dir = PREPROCESSOR_PATH.parent
        model_dir.mkdir(parents=True, exist_ok=True)
        candidate_paths.extend(sorted(model_dir.glob("**/*preprocessor*.joblib")))

    for path in candidate_paths:
        if path.exists():
            return joblib.load(path)

    raise ModelLoadError("Preprocessor artifact not found. Run ml/train.py to create preprocessing artifacts.")


def make_feature_vector(payload: dict[str, Any], preprocessor: ColumnTransformer) -> np.ndarray:
    feature_names = []
    if hasattr(preprocessor, "feature_names_in_"):
        feature_names = list(preprocessor.feature_names_in_)
    else:
        feature_names = [
            "destination",
            "accommodation_type",
            "transportation_type",
            "travel_style",
            "season",
            "nationality",
            "duration",
            "age",
            "group_size",
            "cost_per_day",
        ]

    data = {col: payload.get(col, None) for col in feature_names}
    if "duration" in payload and payload["duration"] not in (None, 0):
        data["cost_per_day"] = payload.get("budget", 0.0) / payload["duration"] if payload.get("budget") else None
    elif "duration" in payload:
        data["cost_per_day"] = 0.0
    return pd.DataFrame([data])


def sensitivity_analysis(base_payload: dict[str, Any], predicted_cost: float, budget: float | None) -> list[dict[str, Any]]:
    suggestions: list[dict[str, Any]] = []
    if budget is None or predicted_cost <= budget:
        return suggestions

    candidates = []
    modifications = [
        ("season", {"summer": "spring", "winter": "fall", "fall": "spring", "spring": "fall"}),
        ("duration", lambda v: max(1, int(v - 2)) if isinstance(v, (int, float)) else None),
        ("travel_style", {"luxury": "comfort", "comfort": "budget", "relaxed": "adventurous", "adventurous": "relaxed"}),
    ]

    preprocessor = load_preprocessor()
    model_pipeline = load_model()

    for field, change in modifications:
        modified_payload = base_payload.copy()
        if isinstance(change, dict) and modified_payload.get(field) in change:
            modified_payload[field] = change[modified_payload[field]]
        elif callable(change) and modified_payload.get(field) is not None:
            modified_payload[field] = change(modified_payload[field])
        else:
            continue

        features = make_feature_vector(modified_payload, preprocessor)
        try:
            new_cost = float(model_pipeline.predict(features)[0])
        except Exception:
            continue
        if budget is None or new_cost <= budget:
            candidates.append({
                "field": field,
                "original_value": base_payload.get(field),
                "suggested_value": modified_payload[field],
                "predicted_cost": round(new_cost, 2),
            })

    return sorted(candidates, key=lambda x: x["predicted_cost"])[:3]


def get_prediction_with_suggestions(payload: dict[str, Any]) -> dict[str, Any]:
    model_pipeline = load_model()
    preprocessor = load_preprocessor()
    features = make_feature_vector(payload, preprocessor)
    predicted = float(model_pipeline.predict(features)[0])
    suggestions = sensitivity_analysis(payload, predicted, payload.get("budget"))
    return {
        "predicted_cost": round(predicted, 2),
        "budget": payload.get("budget"),
        "suggestions": suggestions,
    }
