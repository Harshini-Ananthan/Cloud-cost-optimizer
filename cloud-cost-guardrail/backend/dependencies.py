import os
from forecast_service import ForecastService
from recommendation_service import RecommendationService
from what_if_service import WhatIfService

# Global service instances
forecast_service = ForecastService()
recommendation_service = RecommendationService()
what_if_service = WhatIfService()

def load_all_models():
    """Load all ML models into memory to fail fast if missing and improve response time."""
    forecast_service.load_model()
    what_if_service.load_model()
    # RecommendationService doesn't load a joblib model, it loads data, which can also be pre-loaded if needed.
    
