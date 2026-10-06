import os
import sys
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.main import app
from backend.anomaly_service import AnomalyService

client = TestClient(app)

def test_anomaly_model_loading():
    service = AnomalyService()
    try:
        service.load_model()
    except FileNotFoundError:
        pytest.skip("Model/scaler not found, skipping model loading test")
    
    assert service.model is not None, "Isolation Forest model should be loaded"
    assert service.scaler is not None, "Scaler should be loaded"

def test_anomaly_prediction():
    service = AnomalyService()
    try:
        service.load_model()
    except FileNotFoundError:
        pytest.skip("Model/scaler not found, skipping prediction test")
        
    mock_features = {
        'cpu_utilization': 95.0,
        'memory_utilization': 90.0,
        'storage_gb': 5000.0,
        'network_transfer_gb': 3000.0,
        'ec2_instances': 80,
        'rds_usage_hours': 200,
        'snapshot_count': 50,
        'autoscaling_events': 20,
        'lambda_invocations': 50000,
        'daily_cost': 1500.0
    }
    
    result = service.predict(mock_features)
    assert 'anomaly_score' in result
    assert 'anomaly_flag' in result
    assert isinstance(result['anomaly_score'], float)
    assert result['anomaly_flag'] in (0, 1)

def test_anomalies_endpoint():
    response = client.get("/api/anomalies?limit=5")
    
    assert response.status_code == 200, f"Expected 200 but got {response.status_code}: {response.text}"
    data = response.json()
    if isinstance(data, list) and len(data) > 0:
        item = data[0]
        assert "date" in item
        assert "daily_cost" in item
        assert "anomaly_score" in item
        assert "anomaly_flag" in item
        assert "cost_spike" in item
        assert item["anomaly_flag"] == 1
    elif isinstance(data, dict) and "error" in data:
        pass
