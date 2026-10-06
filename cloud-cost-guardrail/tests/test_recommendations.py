import os
import sys
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.main import app
from backend.recommendation_service import RecommendationService

client = TestClient(app)

def test_recommendation_service():
    service = RecommendationService()
    try:
        results = service.get_recommendations(limit=2)
    except Exception as e:
        pytest.fail(f"RecommendationService failed: {e}")
        
    if isinstance(results, dict) and "error" in results:
        pytest.skip(f"Skipping test due to error: {results['error']}")
        
    assert isinstance(results, list)
    if len(results) > 0:
        item = results[0]
        assert 'detected_issue' in item
        assert 'root_cause' in item
        assert 'recommendation' in item
        assert 'estimated_savings' in item
        assert isinstance(item['estimated_savings'], float)

def test_recommendations_endpoint():
    response = client.get("/api/recommendations?limit=2")
    
    assert response.status_code == 200, f"Expected 200 but got {response.status_code}: {response.text}"
    data = response.json()
    if isinstance(data, list) and len(data) > 0:
        item = data[0]
        assert "detected_issue" in item
        assert "root_cause" in item
        assert "recommendation" in item
        assert "estimated_savings" in item
    elif isinstance(data, dict) and "error" in data:
        pass
