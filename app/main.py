from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Any, List

from ml.model import get_prediction_with_suggestions, ModelLoadError
from ml.destination_recommender import get_recommender

app = FastAPI(title="Journey Curator AI Cost Predictor API")

# Allow Next.js dev server to call the API directly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict:
    """Quick connectivity check for the Next.js frontend."""
    return {"status": "ok"}


def make_optional_str_field(name: str) -> Optional[str]:
    return Field(None, title=name)


class TripRequest(BaseModel):
    destination: str
    duration: float
    origin: Optional[str] = None
    accommodation_type: Optional[str] = None
    transportation_type: Optional[str] = None
    age: Optional[int] = None
    nationality: Optional[str] = None
    travel_style: Optional[str] = None
    season: Optional[str] = None
    budget: Optional[float] = None
    group_size: Optional[int] = None
    additional_data: Optional[dict[str, Any]] = None



class DestinationRecommendation(BaseModel):
    place_name: str
    city: str
    state: str
    category: str
    rating: float
    entry_fee_inr: float
    latitude: float
    longitude: float
    ideal_season: str
    best_travel_type: str
    match_score: float
    description: str

class RecommendDestinationsRequest(BaseModel):
    persona: Optional[str] = Field("General", description="Optional traveler style (default: General)")
    top_k: Optional[int] = Field(10, ge=1, le=50, description="Number of recommendations (default: 10)")


class RecommendDestinationsResponse(BaseModel):
    persona: str
    recommendations: List[DestinationRecommendation]
    total_destinations_considered: int
    hidden_gems_count: int


@app.post("/predict-cost")
async def predict_cost(request: TripRequest) -> dict:
    try:
        result = get_prediction_with_suggestions(request.model_dump(exclude_none=True))
        return result
    except ModelLoadError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}")


@app.post("/recommend-destinations")
async def recommend_destinations(request: RecommendDestinationsRequest) -> RecommendDestinationsResponse:
    """
    Get destination recommendations based on traveler persona.
    
    Uses content-based filtering to match personas with destinations
    based on travel type, budget, activity level, and other attributes.
    """
    try:
        recommender = get_recommender()
        result = recommender.recommend(persona=request.persona, top_k=request.top_k or 10)
        
        # Convert to response model
        recommendations = [
            DestinationRecommendation(**rec)
            for rec in result['recommendations']
        ]
        
        return RecommendDestinationsResponse(
            persona=result['persona'],
            recommendations=recommendations,
            total_destinations_considered=result['total_destinations_considered'],
            hidden_gems_count=result['hidden_gems_count'],
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {exc}")


@app.get("/recommender-stats")
async def recommender_stats() -> dict:
    """Get statistics about the destination database."""
    try:
        recommender = get_recommender()
        return recommender.get_stats()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Stats retrieval failed: {exc}")

