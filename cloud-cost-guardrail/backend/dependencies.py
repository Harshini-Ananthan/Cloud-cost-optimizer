import os
import logging
from gcp_billing_service import GCPBillingService
from gcp_ml_pipeline import GCPMLPipeline
from gcp_recommender import GCPRecommendationEngine
from forecast_service import ForecastService
from recommendation_service import RecommendationService
from what_if_service import WhatIfService

logger = logging.getLogger(__name__)

# Real Google Cloud Services
gcp_billing_service = GCPBillingService()
gcp_ml_pipeline = GCPMLPipeline()
gcp_recommender = GCPRecommendationEngine()

# Backward-compatibility services
forecast_service = ForecastService()
recommendation_service = RecommendationService()
what_if_service = WhatIfService()

def load_all_models():
    """Load all ML models into memory to fail fast if missing and improve response time."""
    logger.info("Initializing Google Cloud FinOps ML Pipeline and billing data store...")
    gcp_ml_pipeline.load_models()
    
    # Also load fallback/legacy models safely if they exist
    try:
        forecast_service.load_model()
    except Exception as e:
        logger.debug(f"Legacy forecast model note: {e}")
    try:
        what_if_service.load_model()
    except Exception as e:
        logger.debug(f"Legacy what-if model note: {e}")
