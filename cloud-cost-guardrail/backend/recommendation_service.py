import os
import pandas as pd

class RecommendationService:
    def __init__(self, data_path=None):
        if data_path is None:
            base_dir = os.path.join(os.path.dirname(__file__), '..')
            self.data_path = os.path.join(base_dir, 'data', 'processed', 'root_cause_results.csv')
        else:
            self.data_path = data_path
            
    def _estimate_savings(self, cost, root_cause):
        """Estimate potential cost savings based on root cause."""
        # A simplistic logic for estimated savings
        savings_percentages = {
            "High compute usage": 0.20,
            "Storage anomaly": 0.30,
            "Network spike": 0.15,
            "Database load": 0.25,
            "Excessive snapshots": 0.50,
            "Auto-scaling issue": 0.10,
            "Unknown": 0.05
        }
        
        pct = savings_percentages.get(root_cause, 0.10)
        return round(cost * pct, 2)
        
    def _get_recommendation_text(self, root_cause):
        """Generate practical recommendations based on root cause."""
        recommendations = {
            "High compute usage": "Reduce idle resources, scale down underutilized instances, or switch to spot instances.",
            "Storage anomaly": "Reduce unnecessary storage, delete unattached EBS volumes, and tier infrequently accessed data.",
            "Network spike": "Optimize network usage, use CloudFront for caching, or review data egress traffic.",
            "Database load": "Review database usage, optimize slow queries, or right-size RDS instances.",
            "Excessive snapshots": "Clean up old snapshots/backups and implement lifecycle management policies.",
            "Auto-scaling issue": "Optimize auto-scaling thresholds and ensure proper scale-in policies are active.",
            "Unknown": "Perform a comprehensive cost audit across all services."
        }
        return recommendations.get(root_cause, "Review recent resource provisioning and identify waste.")

    def get_recommendations(self, limit=50):
        if not os.path.exists(self.data_path):
            return {"error": "Root cause data not found."}
            
        df = pd.read_csv(self.data_path)
        
        # Only look for actual anomalies (cost spikes)
        anomalies = df[df['anomaly_flag'] == 1].copy()
        
        if 'date' in anomalies.columns:
            anomalies['date'] = pd.to_datetime(anomalies['date'])
            anomalies = anomalies.sort_values(by='date', ascending=False)
            anomalies['date'] = anomalies['date'].dt.strftime('%Y-%m-%d %H:%M:%S')
            
        anomalies = anomalies.head(limit)
        
        results = []
        for _, row in anomalies.iterrows():
            root_cause = row.get('predicted_root_cause', 'Unknown')
            cost = row.get('daily_cost', 0)
            
            savings = self._estimate_savings(cost, root_cause)
            rec_text = self._get_recommendation_text(root_cause)
            
            results.append({
                "date": row.get('date'),
                "detected_issue": f"Cost spike to ${cost:.2f}",
                "root_cause": root_cause,
                "recommendation": rec_text,
                "estimated_savings": savings
            })
            
        return results
