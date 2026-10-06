import os
import pandas as pd
import joblib
from sklearn.linear_model import LinearRegression

def train_what_if_model(input_csv, model_dir):
    print(f"Loading data from {input_csv}")
    df = pd.read_csv(input_csv)
    
    features = [
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
    
    X = df[features].copy()
    y = df['daily_cost']
    
    # Fill missing values if any
    X = X.fillna(X.median())
    
    print("Training Linear Regression model for What-If Simulator...")
    model = LinearRegression()
    model.fit(X, y)
    
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'what_if_model.joblib')
    joblib.dump(model, model_path)
    
    print(f"Saved What-If model to {model_path}")

if __name__ == "__main__":
    base_dir = os.path.join(os.path.dirname(__file__), '..')
    input_csv = os.path.join(base_dir, 'data', 'processed', 'cloud_usage_processed.csv')
    model_dir = os.path.join(base_dir, 'models')
    
    if not os.path.exists(input_csv):
        print(f"Error: {input_csv} not found.")
    else:
        train_what_if_model(input_csv, model_dir)
