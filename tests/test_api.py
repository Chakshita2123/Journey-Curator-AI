import unittest
from fastapi.testclient import TestClient

from app.main import app


class ApiTests(unittest.TestCase):
    def test_predict_cost_endpoint(self) -> None:
        client = TestClient(app)
        response = client.post(
            "/predict-cost",
            json={
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
            },
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("predicted_cost", payload)
        self.assertIn("suggestions", payload)


if __name__ == "__main__":
    unittest.main()
