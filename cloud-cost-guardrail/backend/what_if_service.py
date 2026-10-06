import os
import joblib
import pandas as pd

class WhatIfService:
    def __init__(self, model_dir=None):
        if model_dir is None:
            base_dir = os.path.join(os.path.dirname(__file__), '..')
            self.model_path = os.path.join(base_dir, 'models', 'what_if_model.joblib')
        else:
            self.model_path = os.path.join(model_dir, 'what_if_model.joblib')
        
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
            'lambda_invocations'
        ]
        
    def load_model(self):
        if self.model is None:
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"What-If model not found at {self.model_path}")
            self.model = joblib.load(self.model_path)
            
    def simulate(self, baseline_features, modifications):
        """
        Simulate cost given baseline features and proposed modifications.
        baseline_features: dict of current usage
        modifications: dict of modified usage for selected features
        """
        self.load_model()
        
        # Merge baseline and modifications
        simulated_features = baseline_features.copy()
        simulated_features.update(modifications)
        
        df_baseline = pd.DataFrame([baseline_features])[self.features]
        df_simulated = pd.DataFrame([simulated_features])[self.features]
        
        baseline_cost = self.model.predict(df_baseline)[0]
        simulated_cost = self.model.predict(df_simulated)[0]
        
        return {
            "baseline_estimated_cost": float(baseline_cost),
            "simulated_estimated_cost": float(simulated_cost),
            "estimated_savings": float(baseline_cost - simulated_cost),
            "modifications_applied": modifications
        }
