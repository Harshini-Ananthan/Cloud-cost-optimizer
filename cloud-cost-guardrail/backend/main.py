from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Cloud Cost Guardrail API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Backend is running and connected."}

@app.get("/api/root-causes")
def get_root_causes(limit: int = 50):
    import os
    import pandas as pd
    
    base_dir = os.path.dirname(__file__)
    results_path = os.path.join(base_dir, '..', 'data', 'processed', 'root_cause_results.csv')
    
    if not os.path.exists(results_path):
        return {"error": "Root cause results not found. Please run the model pipelines first."}
        
    try:
        df = pd.read_csv(results_path)
        # Filter for detected anomalies
        anomalies = df[df['anomaly_flag'] == 1].copy()
        
        # Sort by date descending (assuming chronological data)
        if 'date' in anomalies.columns:
            anomalies['date'] = pd.to_datetime(anomalies['date'])
            anomalies = anomalies.sort_values(by='date', ascending=False)
            # convert date back to string
            anomalies['date'] = anomalies['date'].dt.strftime('%Y-%m-%d %H:%M:%S')
            
        anomalies = anomalies.head(limit)
        
        # Select required columns
        cols = ['date', 'daily_cost', 'anomaly_flag', 'predicted_root_cause', 'prediction_confidence']
        # Fallback if a column is missing
        cols = [c for c in cols if c in anomalies.columns]
        
        import json
        # to_json automatically converts numpy types to standard python types
        json_str = anomalies[cols].to_json(orient='records')
        return json.loads(json_str)
    except Exception as e:
        return {"error": str(e)}
