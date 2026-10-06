import pandas as pd
import numpy as np
import os

def preprocess(input_path, output_path):
    print(f"Loading data from {input_path}")
    df = pd.read_csv(input_path)
    
    # 1. Remove duplicates
    initial_len = len(df)
    df = df.drop_duplicates()
    print(f"Removed {initial_len - len(df)} duplicate rows.")
    
    # 2. Handle missing/invalid values
    # Fill missing CPU with median
    if df['cpu_utilization'].isnull().any():
        df['cpu_utilization'] = df['cpu_utilization'].fillna(df['cpu_utilization'].median())
    
    # Fix invalid negatives (e.g., storage_gb)
    df['storage_gb'] = df['storage_gb'].apply(lambda x: max(0, x))
    df['network_transfer_gb'] = df['network_transfer_gb'].apply(lambda x: max(0, x))
    
    # 3. Convert dates
    df['date'] = pd.to_datetime(df['date'])
    
    # 4. Create useful basic features
    df['hour'] = df['date'].dt.hour
    df['day_of_week'] = df['date'].dt.dayofweek
    df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
    
    # Cost per unit features
    # Add a small epsilon to avoid division by zero
    df['cost_per_ec2'] = df['daily_cost'] / (df['ec2_instances'] + 1e-5)
    
    # 5. Save processed
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Saved {len(df)} processed records to {output_path}")

if __name__ == "__main__":
    base_dir = os.path.join(os.path.dirname(__file__), '..')
    input_csv = os.path.join(base_dir, 'data', 'raw', 'cloud_usage_raw.csv')
    output_csv = os.path.join(base_dir, 'data', 'processed', 'cloud_usage_processed.csv')
    
    if not os.path.exists(input_csv):
        print(f"Error: {input_csv} not found. Run generate_data.py first.")
    else:
        preprocess(input_csv, output_csv)
