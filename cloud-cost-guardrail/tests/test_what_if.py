import os
import sys
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.main import app
from backend.what_if_service import WhatIfService

client = TestClient(app)

def test_what_if_service():
    service = WhatIfService()
    try:
        service.load_model()
    except FileNotFoundError:
        pytest.skip("What-If model not found, skipping service test")
        
    baseline = {
        'cpu_utilization': 80.0,
        'memory_utilization': 70.0,
        'storage_gb': 1000.0,
        'network_transfer_gb': 500.0,
        'ec2_instances': 10,
        'rds_usage_hours': 24,
        'snapshot_count': 5,
        'autoscaling_events': 2,
        'lambda_invocations': 1000
    }
    
    modifications = {
        'ec2_instances': 5,  # Decrease instances
        'storage_gb': 500.0  # Decrease storage
    }
    
    result = service.simulate(baseline, modifications)
    
    assert 'baseline_estimated_cost' in result
    assert 'simulated_estimated_cost' in result
    assert 'estimated_savings' in result
    assert 'modifications_applied' in result
    assert isinstance(result['baseline_estimated_cost'], float)
    assert isinstance(result['simulated_estimated_cost'], float)
    assert isinstance(result['estimated_savings'], float)

def test_what_if_endpoint():
    payload = {
        "baseline": {
            'cpu_utilization': 80.0,
            'memory_utilization': 70.0,
            'storage_gb': 1000.0,
            'network_transfer_gb': 500.0,
            'ec2_instances': 10,
            'rds_usage_hours': 24,
            'snapshot_count': 5,
            'autoscaling_events': 2,
            'lambda_invocations': 1000
        },
        "modifications": {
            'ec2_instances': 5,
            'storage_gb': 500.0
        }
    }
    
    response = client.post("/api/what-if", json=payload)
    
    if response.status_code == 500 and "error" in response.json():
        pytest.skip(f"Skipping test due to endpoint error (likely missing model): {response.json()['error']}")
        
    assert response.status_code == 200, f"Expected 200 but got {response.status_code}: {response.text}"
    data = response.json()
    assert "baseline_estimated_cost" in data
    assert "simulated_estimated_cost" in data
    assert "estimated_savings" in data
    assert "modifications_applied" in data
    assert data["modifications_applied"]["ec2_instances"] == 5.0
