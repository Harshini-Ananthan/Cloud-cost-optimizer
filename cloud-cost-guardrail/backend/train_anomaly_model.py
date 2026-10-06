import pandas as pd
import numpy as np
import os
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

def train_and_predict(input_csv, output_csv, model_dir):
    print(f"Loading data from {input_csv}")
    df = pd.read_csv(input_csv)
    
    # Select numerical features
    features = [
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
    
    # Ensure all required features are present
    for feature in features:
        if feature not in df.columns:
            raise ValueError(f"Feature '{feature}' is missing from the dataset.")
            
    X = df[features].copy()
    
    # Handle any lingering NaNs (should be handled in preprocessing, but just in case)
    X = X.fillna(X.median())
    
    print("Scaling features...")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    print("Training Isolation Forest...")
    # contamination is the expected proportion of outliers (e.g., 5%)
    iso_forest = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
    iso_forest.fit(X_scaled)
    
    print("Generating predictions...")
    # Generate anomaly scores (lower means more abnormal)
    df['anomaly_score'] = iso_forest.decision_function(X_scaled)
    
    # Generate anomaly flag (-1 for anomalies, 1 for normal)
    # We will convert it to 1 for anomaly, 0 for normal for easier understanding
    preds = iso_forest.predict(X_scaled)
    df['anomaly_flag'] = np.where(preds == -1, 1, 0)
    
    # Identify cost spikes (anomalies where cost is significantly higher)
    # For example, if it's an anomaly AND daily_cost > 75th percentile of normal costs
    normal_costs = df[df['anomaly_flag'] == 0]['daily_cost']
    cost_threshold = normal_costs.quantile(0.75) if len(normal_costs) > 0 else df['daily_cost'].median()
    
    df['cost_spike'] = np.where((df['anomaly_flag'] == 1) & (df['daily_cost'] > cost_threshold), 1, 0)
    
    print(f"Detected {df['anomaly_flag'].sum()} anomalies.")
    print(f"Detected {df['cost_spike'].sum()} cost spikes.")
    
    # Save the dataset
    os.makedirs(os.path.dirname(output_csv), exist_ok=True)
    df.to_csv(output_csv, index=False)
    print(f"Saved detection results to {output_csv}")
    
    # Save the model and scaler
    os.makedirs(model_dir, exist_ok=True)
    joblib.dump(iso_forest, os.path.join(model_dir, 'isolation_forest.joblib'))
    joblib.dump(scaler, os.path.join(model_dir, 'scaler.joblib'))
    print(f"Saved model and scaler to {model_dir}")

if __name__ == "__main__":
    base_dir = os.path.join(os.path.dirname(__file__), '..')
    input_csv = os.path.join(base_dir, 'data', 'processed', 'cloud_usage_processed.csv')
    output_csv = os.path.join(base_dir, 'data', 'processed', 'anomaly_detection_results.csv')
    model_dir = os.path.join(base_dir, 'models')
    
    if not os.path.exists(input_csv):
        print(f"Error: {input_csv} not found. Run generate_data.py and preprocess_data.py first.")
    else:
        train_and_predict(input_csv, output_csv, model_dir)
