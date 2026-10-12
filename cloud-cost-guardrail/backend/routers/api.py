import os
import json
import pandas as pd
import logging
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from schemas import (
    HealthResponse, Anomaly, RootCause, Forecast, 
    Recommendation, WhatIfRequest, WhatIfResponse
)

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/health", response_model=HealthResponse)
def health_check():
    return {"status": "ok", "message": "Backend is running and connected."}

@router.get("/anomalies", response_model=List[Anomaly])
def get_anomalies(limit: int = 50):
    base_dir = os.path.dirname(os.path.dirname(__file__))
    results_path = os.path.join(base_dir, '..', 'data', 'processed', 'anomaly_detection_results.csv')
    
    if not os.path.exists(results_path):
        logger.error("Anomaly detection results not found.")
        raise HTTPException(status_code=404, detail="Anomaly detection results not found.")
        
    try:
        df = pd.read_csv(results_path)
        anomalies = df[df['anomaly_flag'] == 1].copy()
        
        if 'date' in anomalies.columns:
            anomalies['date'] = pd.to_datetime(anomalies['date'])
            anomalies = anomalies.sort_values(by='date', ascending=False)
            anomalies['date'] = anomalies['date'].dt.strftime('%Y-%m-%d %H:%M:%S')
            
        anomalies = anomalies.head(limit)
        cols = ['date', 'daily_cost', 'anomaly_score', 'anomaly_flag', 'cost_spike']
        cols = [c for c in cols if c in anomalies.columns]
        
        return json.loads(anomalies[cols].to_json(orient='records'))
    except Exception as e:
        logger.error(f"Error reading anomalies: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/root-causes", response_model=List[RootCause])
def get_root_causes(limit: int = 50):
    base_dir = os.path.dirname(os.path.dirname(__file__))
    results_path = os.path.join(base_dir, '..', 'data', 'processed', 'root_cause_results.csv')
    
    if not os.path.exists(results_path):
        logger.error("Root cause results not found.")
        raise HTTPException(status_code=404, detail="Root cause results not found.")
        
    try:
        df = pd.read_csv(results_path)
        anomalies = df[df['anomaly_flag'] == 1].copy()
        
        if 'date' in anomalies.columns:
            anomalies['date'] = pd.to_datetime(anomalies['date'])
            anomalies = anomalies.sort_values(by='date', ascending=False)
            anomalies['date'] = anomalies['date'].dt.strftime('%Y-%m-%d %H:%M:%S')
            
        anomalies = anomalies.head(limit)
        cols = ['date', 'daily_cost', 'anomaly_flag', 'predicted_root_cause', 'prediction_confidence']
        cols = [c for c in cols if c in anomalies.columns]
        
        return json.loads(anomalies[cols].to_json(orient='records'))
    except Exception as e:
        logger.error(f"Error reading root causes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

from dependencies import forecast_service, recommendation_service, what_if_service

@router.get("/forecast", response_model=List[Forecast])
def get_forecast(days: int = 30):
    try:
        forecasts = forecast_service.forecast(days=days)
        return forecasts
    except Exception as e:
        logger.error(f"Error generating forecast: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations", response_model=List[Recommendation])
def get_recommendations(limit: int = 50):
    try:
        return recommendation_service.get_recommendations(limit=limit)
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/what-if", response_model=WhatIfResponse)
def post_what_if(request: WhatIfRequest):
    try:
        return what_if_service.simulate(request.baseline, request.modifications)
    except Exception as e:
        logger.error(f"Error in what-if simulation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/what-if")
def get_what_if():
    return {"message": "Please use POST /api/what-if to submit baseline and modifications for simulation."}
