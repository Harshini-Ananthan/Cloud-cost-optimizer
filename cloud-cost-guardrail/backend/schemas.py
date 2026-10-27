from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any

class HealthResponse(BaseModel):
    status: str
    message: str
    gcp_connected: bool = False
    billing_account_id: Optional[str] = None
    records_loaded: int = 0

class GCPBillingSummary(BaseModel):
    total_gross_cost: float
    total_credits: float
    total_net_cost: float
    sud_credits: float
    cud_credits: float
    projects_count: int
    services_count: int
    monthly_run_rate: float
    billing_account_id: Optional[str] = None
    currency: str = "USD"
    is_live: bool = False
    last_synced_at: Optional[str] = None

class GCPProject(BaseModel):
    project_id: str
    project_name: str
    environment: str
    gross_cost: float
    net_cost: float
    credits: float
    cost_share_pct: float
    services: List[str]
    anomaly_count: int

class GCPService(BaseModel):
    service_name: str
    gross_cost: float
    net_cost: float
    credits: float
    percentage: float
    skus_count: int
    anomaly_count: int

class GCPSku(BaseModel):
    sku_id: str
    sku_description: str
    service_name: str
    usage_amount: float
    usage_unit: str
    gross_cost: float
    net_cost: float

class GCPDailyCost(BaseModel):
    date: str
    gross_cost: float
    credits: float
    net_cost: float
    is_anomaly: int

class GCPMonthlyTrend(BaseModel):
    month: str
    gross_cost: float
    credits: float
    net_cost: float

class GCPRecommendation(BaseModel):
    id: str
    category: str
    service: str
    icon: str
    project_id: str
    title: str
    detected_issue: str
    root_cause: str
    recommendation: str
    estimated_monthly_savings: float
    estimated_savings: Optional[float] = None
    effort: str
    risk: str
    gcloud_command: str
    console_url: str

class GCPWhatIfRequest(BaseModel):
    modifications: Dict[str, float]

class GCPWhatIfResponse(BaseModel):
    baseline_daily_cost: float
    simulated_daily_cost: float
    daily_savings: float
    monthly_projected_savings: float
    annual_projected_savings: float
    savings_percentage: float
    modifications_applied: Dict[str, float]

class GCPConfig(BaseModel):
    billing_account_id: Optional[str] = "01A4B8-92FE31-77CC90"
    gcp_project_id: Optional[str] = "cloud-cost-guardrail-prod"
    bigquery_dataset: Optional[str] = "billing_export"
    bigquery_table: Optional[str] = "gcp_billing_export_v1_01A4B8_92FE31_77CC90"
    credentials_path: Optional[str] = ""
    is_live_bigquery_connected: Optional[bool] = False
    currency: Optional[str] = "USD"
    last_synced_at: Optional[str] = None

# Backward compatibility models
class Anomaly(BaseModel):
    date: str
    project_id: Optional[str] = None
    daily_cost: float
    anomaly_score: Optional[float] = None
    anomaly_flag: int
    cost_spike: Optional[float] = None
    predicted_root_cause: Optional[str] = None
    prediction_confidence: Optional[float] = None
    service_breakdown: Optional[Dict[str, float]] = None

class RootCause(BaseModel):
    date: str
    project_id: Optional[str] = None
    daily_cost: float
    anomaly_flag: int
    predicted_root_cause: str
    prediction_confidence: float

class Forecast(BaseModel):
    date: str
    forecasted_cost: float
    cumulative_forecast: Optional[float] = None
    projected_cud_savings: Optional[float] = None
    optimized_cost: Optional[float] = None

class Recommendation(BaseModel):
    date: Optional[str] = None
    detected_issue: str
    root_cause: str
    recommendation: str
    estimated_savings: float

class WhatIfRequest(BaseModel):
    baseline: Optional[Dict[str, float]] = None
    modifications: Dict[str, float]

class WhatIfResponse(BaseModel):
    baseline_estimated_cost: float
    simulated_estimated_cost: float
    estimated_savings: float
    modifications_applied: Dict[str, float]
