from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import pandas as pd
import json

app = FastAPI(title="Cloud Cost Guardrail API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Backend is running and connected."}

@app.get("/api/anomalies")
def get_anomalies(limit: int = 50):
    base_dir = os.path.dirname(__file__)
    results_path = os.path.join(base_dir, '..', 'data', 'processed', 'anomaly_detection_results.csv')
    
    if not os.path.exists(results_path):
        return {"error": "Anomaly detection results not found."}
        
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
        return {"error": str(e)}

@app.get("/api/root-causes")
def get_root_causes(limit: int = 50):
    base_dir = os.path.dirname(__file__)
    results_path = os.path.join(base_dir, '..', 'data', 'processed', 'root_cause_results.csv')
    
    if not os.path.exists(results_path):
        return {"error": "Root cause results not found."}
        
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
        return {"error": str(e)}

@app.get("/api/forecast")
def get_forecast(days: int = 30):
    from .forecast_service import ForecastService
    try:
        service = ForecastService()
        forecasts = service.forecast(days=days)
        return forecasts
    except Exception as e:
        return {"error": str(e)}
