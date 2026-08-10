"""
Training script for Travel Persona Classifier.
Run from project root:
    python -m ml.train_persona
"""
from pathlib import Path
from ml.persona import train_persona_model

def main() -> None:
    print("Training Travel Persona Classifier...")
    results = train_persona_model(n_samples=3000)
    
    report_lines = [
        "Journey Curator AI — Phase 3 Persona Classifier Report",
        "=====================================================",
        f"Data Source   : Synthetic preference dataset (heuristic rule-based labeling)",
        f"Total Samples : {results['n_samples']} rows",
        f"Train / Test  : {results['n_train']} / {results['n_test']} (80/20 split)",
        f"Best Model    : {results['best_model_name']}",
        f"",
        f"--- Performance Metrics ---",
        f"- Accuracy             : {results['accuracy']:.4f}",
        f"- Weighted F1 Score    : {results['f1_score']:.4f}",
        f"- 5-Fold CV Mean F1    : {results['cv_f1_mean']:.4f} ± {results['cv_f1_std']:.4f}",
        f"",
        f"--- Candidate Comparison (F1 Score) ---",
        f"- RandomForest         : {results['rf_f1']:.4f}",
        f"- LogisticRegression   : {results['lr_f1']:.4f}",
        f"",
        f"--- Persona Class Distribution ---",
    ]
    
    for persona, count in results['class_distribution'].items():
        report_lines.append(f"  - {persona:<25}: {count} samples ({count / results['n_samples'] * 100:.1f}%)")
        
    report_text = "\n".join(report_lines)
    report_path = Path("persona_report.txt")
    report_path.write_text(report_text, encoding="utf-8")
    
    print("\n" + report_text)
    print(f"\n✅ Report written to {report_path}")

if __name__ == "__main__":
    main()
