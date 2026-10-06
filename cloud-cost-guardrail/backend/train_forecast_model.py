import pandas as pd
import numpy as np
import os
import joblib
from sklearn.linear_model import LinearRegression

def train_forecast_model(input_csv, model_dir):
    print(f"Loading data from {input_csv}")
    df = pd.read_csv(input_csv)
    
    # Ensure date is sorted
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date').reset_index(drop=True)
    
    # We will predict daily_cost based on a time index
    # Creating a simple time index feature
    df['time_index'] = np.arange(len(df))
    
    X = df[['time_index']]
    y = df['daily_cost']
    
    print("Training Linear Regression model...")
    model = LinearRegression()
    model.fit(X, y)
    
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'forecast_model.joblib')
    joblib.dump(model, model_path)
    
    # Also save the last date and its time index to help with future predictions
    meta_info = {
        'last_date': df['date'].max(),
        'last_time_index': df['time_index'].max()
    }
    joblib.dump(meta_info, os.path.join(model_dir, 'forecast_meta.joblib'))
    
    print(f"Saved forecast model to {model_path}")
    print(f"Model coefficients: {model.coef_}, Intercept: {model.intercept_}")

if __name__ == "__main__":
    base_dir = os.path.join(os.path.dirname(__file__), '..')
    input_csv = os.path.join(base_dir, 'data', 'processed', 'cloud_usage_processed.csv')
    model_dir = os.path.join(base_dir, 'models')
    
    if not os.path.exists(input_csv):
        print(f"Error: {input_csv} not found.")
    else:
        train_forecast_model(input_csv, model_dir)
