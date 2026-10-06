import os
import sys
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.main import app
from backend.root_cause_service import RootCauseService

client = TestClient(app)

def test_model_loading():
    service = RootCauseService()
    try:
        service.load_model()
    except FileNotFoundError:
        pytest.skip("Model not found, skipping model loading test")
    
    assert service.model is not None, "Model should be loaded successfully"

def test_root_cause_prediction():
    service = RootCauseService()
    try:
        service.load_model()
    except FileNotFoundError:
        pytest.skip("Model not found, skipping prediction test")
        
    mock_features = {
        'cpu_utilization': 80.0,
        'memory_utilization': 70.0,
        'storage_gb': 1000.0,
        'network_transfer_gb': 500.0,
        'ec2_instances': 20,
        'rds_usage_hours': 24,
        'snapshot_count': 10,
        'autoscaling_events': 5,
        'lambda_invocations': 10000,
        'daily_cost': 150.0
    }
    
    result = service.predict(mock_features)
    assert 'predicted_root_cause' in result
    assert 'prediction_confidence' in result
    assert isinstance(result['prediction_confidence'], float)
    assert 0.0 <= result['prediction_confidence'] <= 1.0

def test_root_causes_endpoint():
    response = client.get("/api/root-causes?limit=5")
    
    assert response.status_code == 200, f"Expected 200 but got {response.status_code}: {response.text}"
    data = response.json()
    if isinstance(data, list) and len(data) > 0:
        item = data[0]
        assert "predicted_root_cause" in item
        assert "prediction_confidence" in item
        assert "anomaly_flag" in item
        assert item["anomaly_flag"] == 1
    elif isinstance(data, dict) and "error" in data:
        # File might not exist
        pass
    
