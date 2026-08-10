import csv
import tempfile
import unittest
from pathlib import Path

from ml.model import get_prediction_with_suggestions, train_and_evaluate


class CostPredictorTests(unittest.TestCase):
    def test_training_and_prediction_pipeline(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            data_path = Path(tmp_dir) / "travel_data.csv"
            output_path = Path(tmp_dir) / "cost_predictor.joblib"
            self._write_sample_dataset(data_path)

            metrics, best_model_name = train_and_evaluate(str(data_path), str(output_path))

            self.assertIn(best_model_name, metrics)
            self.assertIn("rmse", metrics[best_model_name])
            self.assertGreaterEqual(metrics[best_model_name]["r2"], -1.0)

            result = get_prediction_with_suggestions(
                {
                    "destination": "Paris",
                    "duration": 7,
                    "accommodation_type": "hotel",
                    "transportation_type": "flight",
                    "age": 34,
                    "nationality": "US",
                    "travel_style": "luxury",
                    "season": "summer",
                    "budget": 3000,
                    "group_size": 2,
                }
            )

            self.assertIn("predicted_cost", result)
            self.assertIn("suggestions", result)
            self.assertIsInstance(result["suggestions"], list)

    def test_training_with_real_dataset_schema(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            data_path = Path(tmp_dir) / "real_schema.csv"
            output_path = Path(tmp_dir) / "cost_predictor.joblib"
            self._write_real_schema_dataset(data_path)

            metrics, best_model_name = train_and_evaluate(str(data_path), str(output_path))

            self.assertIn(best_model_name, metrics)
            self.assertGreaterEqual(metrics[best_model_name]["r2"], -1.0)

    def _write_sample_dataset(self, path: Path) -> None:
        rows = [
            {
                "destination": "Paris",
                "duration": 5,
                "accommodation_type": "hotel",
                "transportation_type": "flight",
                "age": 30,
                "nationality": "US",
                "travel_style": "luxury",
                "season": "summer",
                "group_size": 2,
                "total_trip_cost": 2800,
            },
            {
                "destination": "Paris",
                "duration": 7,
                "accommodation_type": "apartment",
                "transportation_type": "train",
                "age": 32,
                "nationality": "CA",
                "travel_style": "comfort",
                "season": "spring",
                "group_size": 2,
                "total_trip_cost": 2400,
            },
            {
                "destination": "Tokyo",
                "duration": 6,
                "accommodation_type": "hostel",
                "transportation_type": "flight",
                "age": 24,
                "nationality": "JP",
                "travel_style": "budget",
                "season": "winter",
                "group_size": 1,
                "total_trip_cost": 1800,
            },
            {
                "destination": "Tokyo",
                "duration": 8,
                "accommodation_type": "hotel",
                "transportation_type": "flight",
                "age": 41,
                "nationality": "AU",
                "travel_style": "comfort",
                "season": "fall",
                "group_size": 3,
                "total_trip_cost": 3200,
            },
            {
                "destination": "Rome",
                "duration": 4,
                "accommodation_type": "hotel",
                "transportation_type": "flight",
                "age": 36,
                "nationality": "IT",
                "travel_style": "culture",
                "season": "spring",
                "group_size": 2,
                "total_trip_cost": 1700,
            },
            {
                "destination": "Rome",
                "duration": 5,
                "accommodation_type": "guesthouse",
                "transportation_type": "train",
                "age": 29,
                "nationality": "DE",
                "travel_style": "budget",
                "season": "summer",
                "group_size": 2,
                "total_trip_cost": 1400,
            },
            {
                "destination": "Barcelona",
                "duration": 6,
                "accommodation_type": "apartment",
                "transportation_type": "flight",
                "age": 27,
                "nationality": "ES",
                "travel_style": "nightlife",
                "season": "summer",
                "group_size": 2,
                "total_trip_cost": 2100,
            },
            {
                "destination": "Barcelona",
                "duration": 7,
                "accommodation_type": "hotel",
                "transportation_type": "flight",
                "age": 35,
                "nationality": "UK",
                "travel_style": "comfort",
                "season": "fall",
                "group_size": 3,
                "total_trip_cost": 2600,
            },
            {
                "destination": "Reykjavik",
                "duration": 4,
                "accommodation_type": "hotel",
                "transportation_type": "flight",
                "age": 38,
                "nationality": "IS",
                "travel_style": "adventure",
                "season": "winter",
                "group_size": 2,
                "total_trip_cost": 2400,
            },
            {
                "destination": "Reykjavik",
                "duration": 5,
                "accommodation_type": "guesthouse",
                "transportation_type": "flight",
                "age": 33,
                "nationality": "NO",
                "travel_style": "budget",
                "season": "spring",
                "group_size": 1,
                "total_trip_cost": 1600,
            },
        ]

        with path.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
            writer.writeheader()
            writer.writerows(rows)

    def _write_real_schema_dataset(self, path: Path) -> None:
        rows = [
            {
                "Destination": "London, UK",
                "Start date": "2023-05-01",
                "End date": "2023-05-08",
                "Duration (days)": 7,
                "Traveler age": 35,
                "Traveler gender": "Male",
                "Traveler nationality": "American",
                "Accommodation type": "Hotel",
                "Accommodation cost": 1200,
                "Transportation type": "Flight",
                "Transportation cost": 600,
            },
            {
                "Destination": "Phuket, Thailand",
                "Start date": "2023-06-15",
                "End date": "2023-06-20",
                "Duration (days)": 5,
                "Traveler age": 28,
                "Traveler gender": "Female",
                "Traveler nationality": "Canadian",
                "Accommodation type": "Resort",
                "Accommodation cost": 800,
                "Transportation type": "Flight",
                "Transportation cost": 500,
            },
            {
                "Destination": "Bali, Indonesia",
                "Start date": "2023-07-01",
                "End date": "2023-07-08",
                "Duration (days)": 7,
                "Traveler age": 45,
                "Traveler gender": "Male",
                "Traveler nationality": "Korean",
                "Accommodation type": "Villa",
                "Accommodation cost": 1000,
                "Transportation type": "Flight",
                "Transportation cost": 700,
            },
            {
                "Destination": "Paris, France",
                "Start date": "2023-08-01",
                "End date": "2023-08-05",
                "Duration (days)": 4,
                "Traveler age": 31,
                "Traveler gender": "Female",
                "Traveler nationality": "French",
                "Accommodation type": "Apartment",
                "Accommodation cost": 900,
                "Transportation type": "Train",
                "Transportation cost": 250,
            },
        ]

        with path.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
            writer.writeheader()
            writer.writerows(rows)


if __name__ == "__main__":
    unittest.main()
