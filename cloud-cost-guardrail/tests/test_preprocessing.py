import pandas as pd
import numpy as np
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.preprocess_data import preprocess

def test_preprocessing(tmp_path):
    # Create mock raw data
    data = {
        'date': ['2023-01-01 00:00:00', '2023-01-01 01:00:00', '2023-01-01 01:00:00'],
        'cpu_utilization': [50.0, np.nan, np.nan],
        'memory_utilization': [60.0, 70.0, 70.0],
        'storage_gb': [100.0, -50.0, -50.0],
        'network_transfer_gb': [200.0, 300.0, 300.0],
        'ec2_instances': [10, 20, 20],
        'rds_usage_hours': [24, 24, 24],
        'snapshot_count': [5, 10, 10],
        'autoscaling_events': [1, 2, 2],
        'lambda_invocations': [1000, 2000, 2000],
        'daily_cost': [100.0, 200.0, 200.0],
        'root_cause': ['Normal', 'Normal', 'Normal']
    }
    df = pd.DataFrame(data)
    
    input_csv = tmp_path / "raw.csv"
    output_csv = tmp_path / "processed.csv"
    df.to_csv(input_csv, index=False)
    
    preprocess(str(input_csv), str(output_csv))
    
    processed_df = pd.read_csv(output_csv)
    
    # 1. Duplicates removed
    assert len(processed_df) == 2
    
    # 2. Missing CPU filled
    assert not processed_df['cpu_utilization'].isnull().any()
    
    # 3. Invalid storage fixed
    assert (processed_df['storage_gb'] >= 0).all()
    
    # 4. Features created
    assert 'hour' in processed_df.columns
    assert 'is_weekend' in processed_df.columns
    assert 'cost_per_ec2' in processed_df.columns
