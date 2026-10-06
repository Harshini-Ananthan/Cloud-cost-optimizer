import os
import joblib
import pandas as pd
import numpy as np
from datetime import timedelta

class ForecastService:
    def __init__(self, model_dir=None):
        if model_dir is None:
            base_dir = os.path.join(os.path.dirname(__file__), '..')
            model_dir = os.path.join(base_dir, 'models')
            
        self.model_path = os.path.join(model_dir, 'forecast_model.joblib')
        self.meta_path = os.path.join(model_dir, 'forecast_meta.joblib')
        self.model = None
        self.meta_info = None
        
    def load_model(self):
        if self.model is None or self.meta_info is None:
            if not os.path.exists(self.model_path) or not os.path.exists(self.meta_path):
                raise FileNotFoundError("Forecast model or metadata not found. Please train the model first.")
            self.model = joblib.load(self.model_path)
            self.meta_info = joblib.load(self.meta_path)
            
    def forecast(self, days=30):
        self.load_model()
        
        last_date = pd.to_datetime(self.meta_info['last_date'])
        last_time_index = self.meta_info['last_time_index']
        
        future_indices = np.arange(last_time_index + 1, last_time_index + 1 + days)
        future_dates = [last_date + timedelta(days=int(i)) for i in range(1, days + 1)]
        
        X_future = pd.DataFrame({'time_index': future_indices})
        predictions = self.model.predict(X_future)
        
        forecast_results = []
        for date, cost in zip(future_dates, predictions):
            forecast_results.append({
                "date": date.strftime('%Y-%m-%d'),
                "forecasted_cost": float(cost)
            })
            
        return forecast_results
