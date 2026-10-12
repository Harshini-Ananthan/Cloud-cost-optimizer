import React from 'react';
import { DollarSign, AlertTriangle, TrendingDown, Target, Activity } from 'lucide-react';

const DashboardCards = ({ data }) => {
  const anomaliesCount = data.anomalies.length;
  
  const potentialSavings = data.recommendations.reduce((sum, rec) => sum + (rec.estimated_savings || 0), 0);
  
  const avgForecast = data.forecast.length > 0 
    ? data.forecast.reduce((sum, f) => sum + f.forecasted_cost, 0) / data.forecast.length 
    : 0;
    
  const highestSpike = data.anomalies.length > 0
    ? Math.max(...data.anomalies.map(a => a.daily_cost || 0))
    : 0;

  const cards = [
    {
      title: "Active Anomalies",
      value: anomaliesCount,
      icon: <AlertTriangle size={24} color="#f59e0b" />,
      subtext: "In the last 30 days"
    },
    {
      title: "Potential Savings",
      value: `$${potentialSavings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      icon: <TrendingDown size={24} color="#10b981" />,
      subtext: "Based on recommendations"
    },
    {
      title: "Avg Forecasted Daily",
      value: `$${avgForecast.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      icon: <Activity size={24} color="#3b82f6" />,
      subtext: "Next 14 days"
    },
    {
      title: "Highest Spike",
      value: `$${highestSpike.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      icon: <Target size={24} color="#ef4444" />,
      subtext: "Peak cost registered"
    }
  ];

  return (
    <div className="metrics-grid">
      {cards.map((card, idx) => (
        <div key={idx} className="metric-card">
          <div className="metric-header">
            <h3>{card.title}</h3>
            <div className="icon-wrapper">{card.icon}</div>
          </div>
          <div className="metric-value">{card.value}</div>
          <div className="metric-subtext">{card.subtext}</div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
