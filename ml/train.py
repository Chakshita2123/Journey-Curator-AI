import argparse
from pathlib import Path

from ml import model


def main() -> None:
    parser = argparse.ArgumentParser(description="Train cost prediction model for Journey Curator AI")
    parser.add_argument("--data", required=True, help="Path to the travel dataset CSV file")
    parser.add_argument("--output", default=str(model.MODEL_PATH), help="Path to save the trained model")
    parser.add_argument("--report", default="training_report.txt", help="Path to write training report")
    args = parser.parse_args()

    output_path = Path(args.output)
    if not output_path.is_absolute():
        output_path = (Path.cwd() / output_path).resolve()

    output_path.parent.mkdir(parents=True, exist_ok=True)
    metrics, best_model_name, cv_metrics = model.train_and_evaluate(args.data, str(output_path))

    report_lines = [
        "Journey Curator AI Phase 1 Training Report",
        "========================================",
        f"Data source: {args.data}",
        f"Saved model: {output_path}",
        f"Best model: {best_model_name}",
        "\n--- Single 80/20 Split Metrics ---",
    ]

    for model_name, values in metrics.items():
        report_lines.append(f"- {model_name}: RMSE={values['rmse']:.2f}, MAE={values['mae']:.2f}, R2={values['r2']:.4f}")

    report_lines.append("\n--- 5-Fold Cross-Validation R² (more reliable for small datasets) ---")
    for model_name, cv_vals in cv_metrics.items():
        fold_scores = ", ".join(f"{s:.4f}" for s in cv_vals["cv_r2_scores"])
        report_lines.append(
            f"- {model_name}: Mean R²={cv_vals['cv_r2_mean']:.4f} ± {cv_vals['cv_r2_std']:.4f}  |  Folds: [{fold_scores}]"
        )

    report_text = "\n".join(report_lines)
    Path(args.report).write_text(report_text, encoding="utf-8")
    print(report_text)


if __name__ == "__main__":
    main()
