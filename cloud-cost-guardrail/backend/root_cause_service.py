import os
import joblib
import pandas as pd
import numpy as np

class RootCauseService:
    def __init__(self, model_path=None):
        if model_path is None:
            base_dir = os.path.join(os.path.dirname(__file__), '..')
            model_path = os.path.join(base_dir, 'models', 'root_cause_model.joblib')
        
        self.model_path = model_path
        self.model = None
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
        if self.model is None:
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Model not found at {self.model_path}")
            self.model = joblib.load(self.model_path)
            
    def predict(self, features_dict):
        """Predict root cause for a single instance."""
        self.load_model()
        df = pd.DataFrame([features_dict])
        
        # Ensure correct column order
        X = df[self.features].copy()
        
        # Predict
        predicted_cause = self.model.predict(X)[0]
        probs = self.model.predict_proba(X)
        confidence = np.max(probs, axis=1)[0]
        
        return {
            "predicted_root_cause": predicted_cause,
            "prediction_confidence": float(confidence)
        }

    def predict_batch(self, df):
        """Predict root causes for a DataFrame."""
        self.load_model()
        
        X = df[self.features].copy()
        
        predictions = self.model.predict(X)
        probs = self.model.predict_proba(X)
        confidences = np.max(probs, axis=1)
        
        return predictions, confidences
