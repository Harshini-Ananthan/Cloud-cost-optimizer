import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta

def generate_mock_cloud_data(num_records=10000):
    np.random.seed(42)
    start_date = datetime.now() - timedelta(days=365)
    
    # Base data
    dates = [start_date + timedelta(hours=i) for i in range(num_records)]
    
    data = []
    root_causes = ['Normal', 'Auto Scaling', 'Idle Resources', 'Storage Growth', 
                   'Network Traffic', 'Database Load', 'Backup/Snapshot Growth']
    
    for i in range(num_records):
        # Pick a root cause with some probabilities
        cause = np.random.choice(root_causes, p=[0.5, 0.1, 0.1, 0.05, 0.1, 0.1, 0.05])
        
        # Base values
        cpu = np.random.normal(40, 10)
        memory = np.random.normal(50, 15)
        storage = np.random.normal(1000, 50)
        network = np.random.normal(500, 100)
        ec2 = np.random.randint(10, 50)
        rds_hours = np.random.randint(24, 100)
        snapshots = np.random.randint(5, 20)
        autoscaling = np.random.randint(0, 5)
        lambda_inv = np.random.normal(10000, 2000)
        
        # Add relationships and noise based on root cause
        if cause == 'Auto Scaling':
            cpu = np.random.normal(85, 10)
            ec2 += np.random.randint(10, 30)
            autoscaling += np.random.randint(5, 15)
        elif cause == 'Idle Resources':
            cpu = np.random.normal(5, 2)
            memory = np.random.normal(10, 5)
            ec2 += np.random.randint(20, 50)
        elif cause == 'Storage Growth':
            storage += np.random.normal(500, 100)
        elif cause == 'Network Traffic':
            network += np.random.normal(1500, 300)
        elif cause == 'Database Load':
            rds_hours += np.random.randint(50, 200)
            cpu = np.random.normal(70, 10)
        elif cause == 'Backup/Snapshot Growth':
            snapshots += np.random.randint(20, 50)
            storage += np.random.normal(200, 50)
            
        # Ensure non-negative bounds
        cpu = np.clip(cpu, 0, 100)
        memory = np.clip(memory, 0, 100)
        storage = max(0, storage)
        network = max(0, network)
        lambda_inv = max(0, lambda_inv)
        
        # Calculate a daily cost based on parameters with some noise
        # This creates a non-trivial relationship
        cost = (
            (ec2 * 2.5) +
            (cpu * 0.1) +
            (storage * 0.05) +
            (network * 0.02) +
            (rds_hours * 1.5) +
            (snapshots * 5.0) +
            (lambda_inv * 0.0001) +
            np.random.normal(50, 20)
        )
        cost = max(10, cost)
        
        data.append({
            'date': dates[i].strftime('%Y-%m-%d %H:%M:%S'),
            'cpu_utilization': cpu,
            'memory_utilization': memory,
            'storage_gb': storage,
            'network_transfer_gb': network,
            'ec2_instances': ec2,
            'rds_usage_hours': rds_hours,
            'snapshot_count': snapshots,
            'autoscaling_events': autoscaling,
            'lambda_invocations': lambda_inv,
            'daily_cost': cost,
            'root_cause': cause
        })
        
    df = pd.DataFrame(data)
    
    # Add some missing values/noise for the preprocessing script to handle
    mask_cpu = np.random.rand(len(df)) < 0.01 # 1% missing
    df.loc[mask_cpu, 'cpu_utilization'] = np.nan
    
    mask_invalid = np.random.rand(len(df)) < 0.01
    df.loc[mask_invalid, 'storage_gb'] = -100 # Invalid negative
    
    # Introduce a few duplicates
    df = pd.concat([df, df.sample(50)]).reset_index(drop=True)
    
    return df

if __name__ == "__main__":
    print("Generating 10,000 realistic AWS-like cloud usage records...")
    df = generate_mock_cloud_data(10000)
    output_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'raw', 'cloud_usage_raw.csv')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} records and saved to {output_path}")
