import os
import joblib
import pandas as pd
import numpy as np

class AnomalyService:
    def __init__(self, model_path=None, scaler_path=None):
        base_dir = os.path.join(os.path.dirname(__file__), '..')
        if model_path is None:
            model_path = os.path.join(base_dir, 'models', 'isolation_forest.joblib')
        if scaler_path is None:
            scaler_path = os.path.join(base_dir, 'models', 'scaler.joblib')
        
        self.model_path = model_path
        self.scaler_path = scaler_path
        self.model = None
        self.scaler = None
        self.features = [
            'cpu_utilization',
            'memory_utilization',
            'storage_gb',
            'network_transfer_gb',
            'ec2_instances',
            'rds_usage_hours',
            'snapshot_count',
            'autoscaling_events',
            'lambda_invocations',
            'daily_cost'
        ]
        
    def load_model(self):
        if self.model is None or self.scaler is None:
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Model not found at {self.model_path}")
            if not os.path.exists(self.scaler_path):
                raise FileNotFoundError(f"Scaler not found at {self.scaler_path}")
            self.model = joblib.load(self.model_path)
            self.scaler = joblib.load(self.scaler_path)
            
    def predict(self, features_dict):
        """Predict anomaly status for a single instance dict."""
        self.load_model()
        df = pd.DataFrame([features_dict])
        
        X = df[self.features].copy()
        X_scaled = self.scaler.transform(X)
        
        anomaly_score = float(self.model.decision_function(X_scaled)[0])
        pred = self.model.predict(X_scaled)[0]
        anomaly_flag = 1 if pred == -1 else 0
        
        return {
            'anomaly_score': anomaly_score,
            'anomaly_flag': anomaly_flag
        }

    def predict_batch(self, df):
        """Predict anomalies for a DataFrame."""
        self.load_model()
        
        X = df[self.features].copy()
        X_scaled = self.scaler.transform(X)
        
        anomaly_scores = self.model.decision_function(X_scaled)
        preds = self.model.predict(X_scaled)
        anomaly_flags = np.where(preds == -1, 1, 0)
        
        return anomaly_scores, anomaly_flags