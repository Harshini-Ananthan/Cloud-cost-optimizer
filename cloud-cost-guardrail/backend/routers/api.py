import os
import json
import logging
from fastapi import APIRouter, HTTPException, Query, Body, UploadFile, File
import io
from typing import List, Dict, Any, Optional

from schemas import (
    HealthResponse, GCPBillingSummary, GCPProject, GCPService, GCPSku,
    GCPDailyCost, GCPMonthlyTrend, GCPRecommendation, GCPWhatIfRequest,
    GCPWhatIfResponse, GCPConfig, Anomaly, RootCause, Forecast,
    Recommendation, WhatIfRequest, WhatIfResponse
)
from gcp_billing_service import sanitize_value
from dependencies import (
    gcp_billing_service, gcp_ml_pipeline, gcp_recommender,
    forecast_service, recommendation_service, what_if_service
)

router = APIRouter()
logger = logging.getLogger(__name__)

# ==========================================
# 1. Health & Status
# ==========================================
@router.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend is running and connected."}

@router.get("/health/gcp", response_model=HealthResponse)
def gcp_health_check():
    cfg = gcp_billing_service.config
    df = gcp_billing_service.get_dataframe()
    return {
        "status": "ok",
        "message": "Google Cloud Cost Guardrail Core is active and operational.",
        "gcp_connected": cfg.get("is_live_bigquery_connected", False),
        "billing_account_id": cfg.get("billing_account_id"),
        "records_loaded": len(df)
    }

# ==========================================
# 2. Google Cloud Billing Data Endpoints
# ==========================================
@router.get("/gcp/summary", response_model=GCPBillingSummary)
def get_gcp_summary(project_id: Optional[str] = Query(None, description="GCP Project ID to filter")):
    try:
        return gcp_billing_service.get_billing_summary(project_id)
    except Exception as e:
        logger.error(f"Error fetching GCP summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/gcp/projects", response_model=List[GCPProject])
def get_gcp_projects():
    try:
        return gcp_billing_service.get_projects()
    except Exception as e:
        logger.error(f"Error fetching GCP projects: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/gcp/services", response_model=List[GCPService])
def get_gcp_services(project_id: Optional[str] = Query(None)):
    try:
        return gcp_billing_service.get_services_breakdown(project_id)
    except Exception as e:
        logger.error(f"Error fetching GCP services: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/gcp/skus", response_model=List[GCPSku])
def get_gcp_skus(
    service_name: Optional[str] = Query(None),
    project_id: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100)
):
    try:
        return gcp_billing_service.get_skus_breakdown(service_name, project_id, limit)
    except Exception as e:
        logger.error(f"Error fetching GCP SKUs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/gcp/daily-costs", response_model=List[GCPDailyCost])
def get_gcp_daily_costs(
    project_id: Optional[str] = Query(None),
    service_name: Optional[str] = Query(None),
    days: int = Query(365, ge=7, le=730)
):
    try:
        return gcp_billing_service.get_daily_costs(project_id, service_name, days)
    except Exception as e:
        logger.error(f"Error fetching GCP daily costs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/gcp/monthly-trends", response_model=List[GCPMonthlyTrend])
def get_gcp_monthly_trends(project_id: Optional[str] = Query(None)):
    try:
        return gcp_billing_service.get_monthly_trends(project_id)
    except Exception as e:
        logger.error(f"Error fetching monthly trends: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/gcp/config", response_model=GCPConfig)
def get_gcp_config():
    return gcp_billing_service.config

@router.post("/gcp/config", response_model=GCPConfig)
def save_gcp_config(config_data: GCPConfig):
    try:
        saved = gcp_billing_service.save_config(config_data.model_dump())
        return saved
    except Exception as e:
        logger.error(f"Error saving GCP config: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/gcp/test-connection")
def test_gcp_connection(config_override: Optional[Dict[str, Any]] = None):
    try:
        return gcp_billing_service.test_bigquery_connection(config_override)
    except Exception as e:
        logger.error(f"Error testing connection: {e}")
        return {"connected": False, "message": str(e)}

@router.post("/gcp/upload-billing-csv")
async def upload_gcp_billing_csv(file: UploadFile = File(...)):
    try:
        content = await file.read()
        res = gcp_billing_service.import_gcp_billing_csv(io.BytesIO(content))
        # Retrain ML models on user's imported data
        gcp_ml_pipeline.train_models()
        gcp_ml_pipeline.load_models()
        return {
            "status": "success",
            "message": f"Successfully imported {res['records_imported']} billing records across {len(res['projects_detected'])} projects.",
            "details": res
        }
    except Exception as e:
        logger.error(f"Error importing billing CSV: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# 3. Google Cloud ML & FinOps Endpoints
# ==========================================
@router.get("/anomalies", response_model=List[Anomaly])
def get_anomalies(
    limit: int = Query(50, ge=1, le=200),
    project_id: Optional[str] = Query(None)
):
    try:
        return sanitize_value(gcp_ml_pipeline.detect_anomalies(project_id=project_id, limit=limit))
    except Exception as e:
        logger.error(f"Error running GCP anomaly detection: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/root-causes", response_model=List[RootCause])
def get_root_causes(
    limit: int = Query(50, ge=1, le=200),
    project_id: Optional[str] = Query(None)
):
    try:
        return sanitize_value(gcp_ml_pipeline.get_root_causes(project_id=project_id, limit=limit))
    except Exception as e:
        logger.error(f"Error getting GCP root causes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/forecast", response_model=List[Forecast])
def get_forecast(
    days: int = Query(30, ge=1, le=180),
    project_id: Optional[str] = Query(None)
):
    try:
        return sanitize_value(gcp_ml_pipeline.forecast_costs(days=days, project_id=project_id))
    except Exception as e:
        logger.error(f"Error generating GCP forecast: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations", response_model=List[GCPRecommendation])
def get_recommendations(
    limit: int = Query(50, ge=1, le=100),
    project_id: Optional[str] = Query(None)
):
    try:
        return sanitize_value(gcp_recommender.get_recommendations(project_id=project_id, limit=limit))
    except Exception as e:
        logger.error(f"Error fetching GCP recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/what-if")
def post_what_if(payload: Dict[str, Any] = Body(...)):
    """
    Simulates cost optimizations. Supports both GCP percentage modifiers
    (compute_engine_reduction_pct, storage_lifecycle_pct, bigquery_optimization_pct, cud_commitment_coverage_pct)
    and legacy resource dictionary formats.
    """
    try:
        # Check if payload contains GCP specific modifications
        mods = payload.get("modifications", payload)
        
        # If it's a legacy test payload with baseline dictionary
        if "baseline" in payload and isinstance(payload.get("baseline"), dict):
            try:
                res = what_if_service.simulate(payload["baseline"], payload["modifications"])
                return sanitize_value(res)
            except Exception:
                pass
                
        # Run Google Cloud FinOps What-If Simulation
        gcp_res = gcp_ml_pipeline.simulate_what_if(mods)
        return sanitize_value({
            "baseline_estimated_cost": gcp_res["baseline_daily_cost"],
            "simulated_estimated_cost": gcp_res["simulated_daily_cost"],
            "estimated_savings": gcp_res["daily_savings"],
            "monthly_projected_savings": gcp_res["monthly_projected_savings"],
            "annual_projected_savings": gcp_res["annual_projected_savings"],
            "savings_percentage": gcp_res["savings_percentage"],
            "modifications_applied": mods
        })
    except Exception as e:
        logger.error(f"Error running What-If simulation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/what-if")
def get_what_if():
    return {
        "message": "Use POST /api/what-if to submit simulation parameters.",
        "gcp_knobs": [
            "compute_engine_reduction_pct",
            "storage_lifecycle_pct",
            "bigquery_optimization_pct",
            "cud_commitment_coverage_pct"
        ]
    }
