from fastapi.testclient import TestClient
import sys
import os

# Ensure the backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.main import app

client = TestClient(app)

def test_full_pipeline_integration():
    """
    Test the entire pipeline from end-to-end to ensure the data flows correctly
    through all interconnected systems without breaking.
    """
    # 1. Health check (also ensures ML models loaded due to lifespan context, 
    # though TestClient might not trigger lifespan unless configured, but we will test endpoints)
    with TestClient(app) as client:
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"

        # 2. Get Anomalies
        response = client.get("/api/anomalies?limit=5")
        assert response.status_code == 200
        anomalies = response.json()
        assert isinstance(anomalies, list)

        # 3. Get Root Causes
        response = client.get("/api/root-causes?limit=5")
        assert response.status_code == 200
        root_causes = response.json()
        assert isinstance(root_causes, list)

        # 4. Get Forecast
        response = client.get("/api/forecast?days=7")
        assert response.status_code == 200
        forecast = response.json()
        assert isinstance(forecast, list)
        assert len(forecast) == 7

        # 5. Get Recommendations
        response = client.get("/api/recommendations?limit=5")
        assert response.status_code == 200
        recs = response.json()
        assert isinstance(recs, list)

        # 6. What-If Simulation
        baseline = {
            "cpu_utilization": 75.0,
            "memory_utilization": 80.0,
            "storage_gb": 1000.0,
            "network_transfer_gb": 500.0,
            "ec2_instances": 50,
            "rds_usage_hours": 730,
            "snapshot_count": 30,
            "autoscaling_events": 10,
            "lambda_invocations": 100000
        }
        modifications = {
            "cpu_utilization": 60.0,
            "ec2_instances": 40
        }
        
        response = client.post("/api/what-if", json={
            "baseline": baseline,
            "modifications": modifications
        })
        assert response.status_code == 200
        what_if_res = response.json()
        
        assert "baseline_estimated_cost" in what_if_res
        assert "simulated_estimated_cost" in what_if_res
        assert "estimated_savings" in what_if_res
