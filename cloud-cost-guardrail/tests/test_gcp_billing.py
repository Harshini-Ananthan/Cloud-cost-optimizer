import pytest
import os
import sys
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from backend.main import app
from backend.gcp_billing_service import GCPBillingService
from backend.gcp_ml_pipeline import GCPMLPipeline
from backend.gcp_recommender import GCPRecommendationEngine

client = TestClient(app)

def test_gcp_billing_service_summary():
    service = GCPBillingService()
    summary = service.get_billing_summary()
    assert "total_gross_cost" in summary
    assert "total_net_cost" in summary
    assert "total_credits" in summary
    assert summary["projects_count"] >= 1
    assert summary["services_count"] >= 1
    assert summary["total_gross_cost"] >= summary["total_net_cost"]

def test_gcp_projects_listing():
    service = GCPBillingService()
    projects = service.get_projects()
    assert isinstance(projects, list)
    assert len(projects) > 0
    first_proj = projects[0]
    assert "project_id" in first_proj
    assert "project_name" in first_proj
    assert "net_cost" in first_proj
    assert "cost_share_pct" in first_proj
    assert "services" in first_proj

def test_gcp_services_breakdown():
    service = GCPBillingService()
    services = service.get_services_breakdown()
    assert isinstance(services, list)
    assert len(services) > 0
    service_names = [s["service_name"] for s in services]
    assert len(service_names) >= 3
    assert any(s in service_names for s in ["Cloud Run", "Cloud Storage", "Compute Engine", "App Engine", "BigQuery"])

def test_gcp_api_endpoints():
    with TestClient(app) as c:
        # 1. Summary
        res = c.get("/api/gcp/summary")
        assert res.status_code == 200
        assert res.json()["currency"] in ["USD", "INR"]

        # 2. Projects
        res = c.get("/api/gcp/projects")
        assert res.status_code == 200
        assert len(res.json()) >= 1

        # 3. Services
        res = c.get("/api/gcp/services")
        assert res.status_code == 200

        # 4. SKUs
        res = c.get("/api/gcp/skus?limit=5")
        assert res.status_code == 200
        assert len(res.json()) <= 5

        # 5. Daily costs
        res = c.get("/api/gcp/daily-costs?days=30")
        assert res.status_code == 200
        assert len(res.json()) > 0

        # 6. GCP Recommendations
        res = c.get("/api/recommendations?limit=5")
        assert res.status_code == 200
        recs = res.json()
        assert len(recs) > 0
        assert "gcloud_command" in recs[0]
        assert "console_url" in recs[0]

        # 7. GCP What-If Simulation
        what_if_payload = {
            "compute_engine_reduction_pct": 25.0,
            "storage_lifecycle_pct": 50.0,
            "bigquery_optimization_pct": 30.0,
            "cud_commitment_coverage_pct": 60.0
        }
        res = c.post("/api/what-if", json=what_if_payload)
        assert res.status_code == 200
        data = res.json()
        assert data["estimated_savings"] > 0
        assert "monthly_projected_savings" in data

def test_gcp_ml_anomaly_detection():
    pipeline = GCPMLPipeline()
    anomalies = pipeline.detect_anomalies(limit=5)
    assert isinstance(anomalies, list)
    if len(anomalies) > 0:
        a = anomalies[0]
        assert "date" in a
        assert "daily_cost" in a
        assert "predicted_root_cause" in a
        assert "service_breakdown" in a
