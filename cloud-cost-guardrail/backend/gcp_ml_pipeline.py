import os
import math
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models", "gcp")
DATASET_PATH = os.path.join(BASE_DIR, "data", "gcp", "gcp_billing_export.csv")

def sanitize_value(v):
    """Recursively replaces any NaN or Inf with 0.0 to prevent JSON serialization errors."""
    if isinstance(v, float):
        if math.isnan(v) or math.isinf(v):
            return 0.0
        return round(v, 4)
    elif isinstance(v, dict):
        return {k: sanitize_value(val) for k, val in v.items()}
    elif isinstance(v, list):
        return [sanitize_value(item) for item in v]
    return v

class GCPMLPipeline:
    def __init__(self):
        os.makedirs(MODELS_DIR, exist_ok=True)
        self.anomaly_model_path = os.path.join(MODELS_DIR, "gcp_isolation_forest.joblib")
        self.scaler_path = os.path.join(MODELS_DIR, "gcp_scaler.joblib")
        self.root_cause_model_path = os.path.join(MODELS_DIR, "gcp_root_cause_model.joblib")
        self.forecast_model_path = os.path.join(MODELS_DIR, "gcp_forecast_model.joblib")
        self.what_if_model_path = os.path.join(MODELS_DIR, "gcp_what_if_model.joblib")
        
        self.anomaly_model = None
        self.scaler = None
        self.root_cause_model = None
        self.forecast_model = None
        self.what_if_model = None
        self.meta_info = None

    def prepare_daily_feature_matrix(self, df: pd.DataFrame) -> pd.DataFrame:
        """Pivots granular billing records into a daily multi-service feature matrix per project."""
        df_copy = df.copy()
        df_copy = df_copy.dropna(subset=["service_name"])
        df_copy["date"] = pd.to_datetime(df_copy["date"], errors="coerce").fillna(datetime.now())
        df_copy["net_cost"] = pd.to_numeric(df_copy["net_cost"], errors="coerce").fillna(0.0)
        
        # Aggregate daily spend by service
        pivot = df_copy.pivot_table(
            index=["date", "project_id"],
            columns="service_name",
            values="net_cost",
            aggfunc="sum",
            fill_value=0.0
        ).reset_index()

        # Format column names to valid identifiers
        clean_cols = {}
        for col in pivot.columns:
            if col not in ["date", "project_id"]:
                clean_cols[col] = str(col).lower().replace(" ", "_").replace("-", "_").replace("(", "").replace(")", "") + "_cost"
        pivot.rename(columns=clean_cols, inplace=True)

        numeric_cols = [c for c in pivot.columns if c not in ["date", "project_id"]]
        pivot[numeric_cols] = pivot[numeric_cols].fillna(0.0)
        pivot["daily_total_cost"] = pivot[numeric_cols].sum(axis=1)

        # Merge anomaly flag and root cause if available
        meta = df_copy.groupby(["date", "project_id"]).agg(
            is_anomaly=("is_anomaly", "max"),
            root_cause=("root_cause", lambda s: s.iloc[0] if (s != "Normal Operation").any() else "Normal Operation")
        ).reset_index()

        merged = pd.merge(pivot, meta, on=["date", "project_id"], how="left")
        merged["is_anomaly"] = merged["is_anomaly"].fillna(0).astype(int)
        merged["root_cause"] = merged["root_cause"].fillna("Normal Operation")
        merged = merged.fillna(0.0)

        return merged

    def train_models(self):
        """Trains Isolation Forest, Random Forest Root Cause Classifier, and Forecaster on GCP data."""
        if not os.path.exists(DATASET_PATH):
            raise FileNotFoundError(f"GCP billing data not found at {DATASET_PATH}")
            
        raw_df = pd.read_csv(DATASET_PATH, encoding="utf-8")
        raw_df = raw_df.fillna(0.0)
        daily_df = self.prepare_daily_feature_matrix(raw_df)

        numeric_cols = [c for c in daily_df.columns if c not in ["date", "project_id", "is_anomaly", "root_cause"]]
        if len(numeric_cols) == 0:
            numeric_cols = ["daily_total_cost"]
            daily_df["daily_total_cost"] = 10.0

        # 1. Train Anomaly Model (Isolation Forest)
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(daily_df[numeric_cols].fillna(0.0))
        contamination = max(0.02, min(0.10, 5.0 / max(len(daily_df), 1)))
        iso_forest = IsolationForest(n_estimators=100, contamination=contamination, random_state=42)
        iso_forest.fit(X_scaled)

        joblib.dump(iso_forest, self.anomaly_model_path)
        joblib.dump(scaler, self.scaler_path)

        # 2. Train Root Cause Model (Random Forest Classifier)
        X = daily_df[numeric_cols].fillna(0.0)
        y = daily_df["root_cause"].fillna("Normal Operation")
        # Ensure at least 1 class has variance
        if len(y.unique()) < 2:
            y.iloc[0] = "High Cloud Run / Compute Surge"

        rf = RandomForestClassifier(n_estimators=60, random_state=42)
        rf.fit(X, y)
        joblib.dump(rf, self.root_cause_model_path)

        # 3. Train Forecaster (Linear Regression on time index of aggregated cross-project daily cost)
        total_daily = daily_df.groupby("date")["daily_total_cost"].sum().reset_index().sort_values("date")
        total_daily["time_index"] = np.arange(len(total_daily))
        
        forecast_reg = LinearRegression()
        y_daily = total_daily["daily_total_cost"].fillna(0.0)
        forecast_reg.fit(total_daily[["time_index"]], y_daily)
        joblib.dump(forecast_reg, self.forecast_model_path)

        last_date_str = total_daily["date"].max().strftime("%Y-%m-%d") if not total_daily.empty else datetime.now().strftime("%Y-%m-%d")
        meta = {
            "last_date": last_date_str,
            "last_time_index": int(total_daily["time_index"].max()) if not total_daily.empty else 0,
            "last_30d_avg": float(total_daily["daily_total_cost"].tail(30).mean()) if not total_daily.empty else 100.0,
            "feature_cols": numeric_cols
        }
        joblib.dump(meta, os.path.join(MODELS_DIR, "gcp_forecast_meta.joblib"))

        # 4. Train What-If Regressor
        what_if_reg = LinearRegression()
        what_if_reg.fit(X, y_daily.values[:len(X)])
        joblib.dump(what_if_reg, self.what_if_model_path)

        self.anomaly_model = iso_forest
        self.scaler = scaler
        self.root_cause_model = rf
        self.forecast_model = forecast_reg
        self.meta_info = meta
        self.what_if_model = what_if_reg

        print("Successfully trained and saved all GCP ML models on user dataset.")

    def load_models(self):
        if self.anomaly_model is None or self.root_cause_model is None or self.forecast_model is None:
            if not os.path.exists(self.anomaly_model_path):
                self.train_models()
            else:
                self.anomaly_model = joblib.load(self.anomaly_model_path)
                self.scaler = joblib.load(self.scaler_path)
                self.root_cause_model = joblib.load(self.root_cause_model_path)
                self.forecast_model = joblib.load(self.forecast_model_path)
                self.meta_info = joblib.load(os.path.join(MODELS_DIR, "gcp_forecast_meta.joblib"))
                self.what_if_model = joblib.load(self.what_if_model_path)

    def detect_anomalies(self, project_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        self.load_models()
        raw_df = pd.read_csv(DATASET_PATH, encoding="utf-8").fillna(0.0)
        daily_df = self.prepare_daily_feature_matrix(raw_df)

        if project_id and project_id != "ALL":
            daily_df = daily_df[daily_df["project_id"] == project_id]

        feature_cols = self.meta_info.get("feature_cols", [c for c in daily_df.columns if c not in ["date", "project_id", "is_anomaly", "root_cause"]])
        
        # Ensure all required features exist in daily_df
        for col in feature_cols:
            if col not in daily_df.columns:
                daily_df[col] = 0.0

        X = daily_df[feature_cols].fillna(0.0)
        X_scaled = self.scaler.transform(X)
        scores = self.anomaly_model.decision_function(X_scaled)
        preds = self.anomaly_model.predict(X_scaled)

        daily_df["anomaly_score"] = scores
        daily_df["detected_flag"] = np.where(preds == -1, 1, 0)
        
        anomalies = daily_df[daily_df["detected_flag"] == 1].sort_values("anomaly_score", ascending=True)

        results = []
        for _, row in anomalies.head(limit).iterrows():
            cost = float(row["daily_total_cost"])
            score = float(row["anomaly_score"])
            
            X_instance = pd.DataFrame([row[feature_cols]]).fillna(0.0)
            cause = self.root_cause_model.predict(X_instance)[0]
            probs = self.root_cause_model.predict_proba(X_instance)
            conf = float(np.max(probs))

            service_breakdown = {}
            for col in feature_cols[:6]:
                clean_name = col.replace("_cost", "").replace("_", " ").title()
                service_breakdown[clean_name] = round(float(row.get(col, 0.0)), 2)

            results.append(sanitize_value({
                "date": row["date"].strftime("%Y-%m-%d"),
                "project_id": row["project_id"],
                "daily_cost": round(cost, 2),
                "anomaly_score": round(score, 4),
                "anomaly_flag": 1,
                "predicted_root_cause": cause if cause != "Normal Operation" else "Unusual Multi-Service Resource Surge",
                "prediction_confidence": round(conf, 2),
                "service_breakdown": service_breakdown
            }))
        return results

    def get_root_causes(self, project_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        anomalies = self.detect_anomalies(project_id, limit)
        root_causes = []
        for a in anomalies:
            root_causes.append(sanitize_value({
                "date": a["date"],
                "project_id": a["project_id"],
                "daily_cost": a["daily_cost"],
                "anomaly_flag": 1,
                "predicted_root_cause": a["predicted_root_cause"],
                "prediction_confidence": a["prediction_confidence"]
            }))
        return root_causes

    def forecast_costs(self, days: int = 30, project_id: Optional[str] = None) -> List[Dict[str, Any]]:
        self.load_models()
        last_date = datetime.strptime(self.meta_info.get("last_date", datetime.now().strftime("%Y-%m-%d")), "%Y-%m-%d")
        last_idx = self.meta_info.get("last_time_index", 0)

        future_indices = np.arange(last_idx + 1, last_idx + 1 + days).reshape(-1, 1)
        raw_preds = self.forecast_model.predict(pd.DataFrame(future_indices, columns=["time_index"]))

        results = []
        cumulative = 0.0
        for i in range(days):
            f_date = last_date + timedelta(days=i + 1)
            pred_cost = max(5.0, float(raw_preds[i]) * (1.0 + np.sin(i / 7.0 * np.pi) * 0.04))
            cumulative += pred_cost
            
            cud_savings_projected = round(pred_cost * 0.22, 2)

            results.append(sanitize_value({
                "date": f_date.strftime("%Y-%m-%d"),
                "forecasted_cost": round(pred_cost, 2),
                "cumulative_forecast": round(cumulative, 2),
                "projected_cud_savings": cud_savings_projected,
                "optimized_cost": round(pred_cost - cud_savings_projected, 2)
            }))
        return results

    def simulate_what_if(self, modifications: Dict[str, float]) -> Dict[str, Any]:
        """
        Simulate GCP FinOps optimizations:
        - compute_engine_reduction_pct: VM rightsizing, idle Cloud Run shutdown, Spot VMs
        - storage_lifecycle_pct: Nearline / Coldline lifecycle policies
        - bigquery_optimization_pct: Partitioning, clustering, slot reservations
        - cud_commitment_coverage_pct: 1-yr / 3-yr Committed Use Discounts
        """
        self.load_models()
        raw_df = pd.read_csv(DATASET_PATH, encoding="utf-8").fillna(0.0)
        daily_df = self.prepare_daily_feature_matrix(raw_df)
        
        recent_df = daily_df.tail(30)
        baseline_daily = float(recent_df["daily_total_cost"].mean()) if not recent_df.empty else 100.0
        baseline_daily = max(1.0, baseline_daily)

        gce_mod = modifications.get("compute_engine_reduction_pct", 0.0) / 100.0
        gcs_mod = modifications.get("storage_lifecycle_pct", 0.0) / 100.0
        bq_mod = modifications.get("bigquery_optimization_pct", 0.0) / 100.0
        cud_mod = modifications.get("cud_commitment_coverage_pct", 0.0) / 100.0

        # Weighted savings simulation
        sim_savings_rate = (gce_mod * 0.35) + (gcs_mod * 0.20) + (bq_mod * 0.15) + (cud_mod * 0.25)
        sim_savings_rate = min(0.75, max(0.0, sim_savings_rate))
        
        daily_savings = baseline_daily * sim_savings_rate
        simulated_daily = max(0.5, baseline_daily - daily_savings)

        return sanitize_value({
            "baseline_daily_cost": round(baseline_daily, 2),
            "simulated_daily_cost": round(simulated_daily, 2),
            "daily_savings": round(daily_savings, 2),
            "monthly_projected_savings": round(daily_savings * 30.5, 2),
            "annual_projected_savings": round(daily_savings * 365, 2),
            "savings_percentage": round((daily_savings / baseline_daily) * 100, 1),
            "modifications_applied": modifications
        })
