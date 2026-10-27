import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  Percent, 
  Sparkles, 
  CheckCircle2, 
  Loader2,
  Info
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const GcpForecastingView = ({ selectedProject = 'ALL', currency = 'INR' }) => {
  const [horizon, setHorizon] = useState(30);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchForecast = useCallback(async () => {
    try {
      setLoading(true);
      const url = `${API_BASE}/forecast?days=${horizon}${selectedProject !== 'ALL' ? `&project_id=${selectedProject}` : ''}`;
      const res = await axios.get(url);
      setForecastData(res.data);
    } catch (err) {
      console.error('Failed to fetch forecast:', err);
    } finally {
      setLoading(false);
    }
  }, [horizon, selectedProject]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  const fmt = (val) => {
    const locale = currency === 'INR' ? 'en-IN' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  const totalForecasted = forecastData.reduce((sum, item) => sum + (item.forecasted_cost || 0), 0);
  const totalCudSavings = forecastData.reduce((sum, item) => sum + (item.projected_cud_savings || 0), 0);
  const totalOptimized = totalForecasted - totalCudSavings;

  return (
    <div className="gcp-forecasting-container">
      {/* 1. Header & Horizon Selector */}
      <div className="gcp-card-box">
        <div className="gcp-card-box-header">
          <div className="header-with-badge">
            <TrendingUp size={22} className="trend-icon-blue" />
            <div>
              <h3 className="gcp-card-box-title">Future Spend Forecast & Committed Use Discount (CUD) Trajectory</h3>
              <p className="gcp-card-box-desc">
                Predictive linear regression and cyclical modeling projected forward from historical billing data with CUD discount impact.
              </p>
            </div>
          </div>

          <div className="horizon-button-group">
            {[7, 14, 30, 60, 90].map((d) => (
              <button 
                key={d} 
                className={`horizon-btn ${horizon === d ? 'active' : ''}`}
                onClick={() => setHorizon(d)}
              >
                {d} Days
              </button>
            ))}
          </div>
        </div>

        {/* Forecast KPI cards */}
        <div className="forecast-kpi-grid">
          <div className="forecast-kpi-card">
            <span className="kpi-sub">Baseline Projected Spend ({horizon}d)</span>
            <span className="kpi-main-val">{fmt(totalForecasted)}</span>
            <span className="kpi-note">On-demand baseline trajectory</span>
          </div>

          <div className="forecast-kpi-card card-highlight-green">
            <span className="kpi-sub">Projected CUD Savings ({horizon}d)</span>
            <span className="kpi-main-val text-green">-{fmt(totalCudSavings)}</span>
            <span className="kpi-note">With 1-Year CUD commitment (~22% blended)</span>
          </div>

          <div className="forecast-kpi-card card-highlight-blue">
            <span className="kpi-sub">Optimized Spend Target ({horizon}d)</span>
            <span className="kpi-main-val text-blue">{fmt(totalOptimized)}</span>
            <span className="kpi-note">Effective spend with FinOps guardrails</span>
          </div>
        </div>
      </div>

      {/* 2. Forecast Chart Canvas */}
      <div className="gcp-card-box">
        <div className="gcp-card-box-header">
          <div>
            <h3 className="gcp-card-box-title">Daily Projected Spend vs Optimized Target</h3>
            <p className="gcp-card-box-desc">Comparison between standard baseline and CUD-discounted spend</p>
          </div>
          {loading && <Loader2 size={18} className="spin" />}
        </div>

        <div className="gcp-chart-canvas" style={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4285F4" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#4285F4" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34A853" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#34A853" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
              <XAxis 
                dataKey="date" 
                stroke="#9AA0A6" 
                fontSize={11} 
                tickFormatter={(val) => val.slice(5)}
              />
              <YAxis 
                stroke="#9AA0A6" 
                fontSize={11} 
                tickFormatter={(val) => `$${val}`}
              />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: 8, color: '#F8FAFC' }}
                formatter={(val) => [fmt(val), '']}
              />
              <Legend verticalAlign="top" height={36} />
              <Area 
                type="monotone" 
                dataKey="forecasted_cost" 
                name="Baseline Forecast" 
                stroke="#4285F4" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorBaseline)" 
              />
              <Area 
                type="monotone" 
                dataKey="optimized_cost" 
                name="With CUD Commitments" 
                stroke="#34A853" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorOpt)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default GcpForecastingView;
