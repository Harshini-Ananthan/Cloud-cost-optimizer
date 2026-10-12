from pydantic import BaseModel
from typing import Dict, List, Optional, Any

class HealthResponse(BaseModel):
    status: str
    message: str

class Anomaly(BaseModel):
    date: str
    daily_cost: float
    anomaly_score: Optional[float] = None
    anomaly_flag: int
    cost_spike: Optional[float] = None

class RootCause(BaseModel):
    date: str
    daily_cost: float
    anomaly_flag: int
    predicted_root_cause: str
    prediction_confidence: float

class Forecast(BaseModel):
    date: str
    forecasted_cost: float

class Recommendation(BaseModel):
    date: str
    detected_issue: str
    root_cause: str
    recommendation: str
    estimated_savings: float

class WhatIfRequest(BaseModel):
    baseline: Dict[str, float]
    modifications: Dict[str, float]

class WhatIfResponse(BaseModel):
    baseline_estimated_cost: float
    simulated_estimated_cost: float
    estimated_savings: float
    modifications_applied: Dict[str, float]
