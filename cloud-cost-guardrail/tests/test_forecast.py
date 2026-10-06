import os
import sys
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.main import app
from backend.forecast_service import ForecastService

client = TestClient(app)

def test_forecast_model_loading():
    service = ForecastService()
    try:
        service.load_model()
    except FileNotFoundError:
        pytest.skip("Forecast model not found, skipping model loading test")
    
    assert service.model is not None, "Forecast model should be loaded"
    assert service.meta_info is not None, "Forecast meta info should be loaded"

def test_forecast_prediction():
    service = ForecastService()
    try:
        service.load_model()
    except FileNotFoundError:
        pytest.skip("Forecast model not found, skipping prediction test")
        
    result = service.forecast(days=5)
    assert isinstance(result, list)
    assert len(result) == 5
    for item in result:
        assert 'date' in item
        assert 'forecasted_cost' in item
        assert isinstance(item['forecasted_cost'], float)

def test_forecast_endpoint():
    response = client.get("/api/forecast?days=5")
    
    assert response.status_code == 200, f"Expected 200 but got {response.status_code}: {response.text}"
    data = response.json()
    if isinstance(data, list) and len(data) > 0:
        item = data[0]
        assert "date" in item
        assert "forecasted_cost" in item
    elif isinstance(data, dict) and "error" in data:
        pass
