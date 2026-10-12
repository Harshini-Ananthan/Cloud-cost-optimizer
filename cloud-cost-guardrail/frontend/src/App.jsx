import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import DashboardCards from './components/DashboardCards';
import Charts from './components/Charts';
import Recommendations from './components/Recommendations';
import WhatIfSimulator from './components/WhatIfSimulator';
import { Activity, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    health: null,
    anomalies: [],
    rootCauses: [],
    forecast: [],
    recommendations: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [healthRes, anomaliesRes, rootCausesRes, forecastRes, recsRes] = await Promise.all([
          axios.get(`${API_BASE}/health`),
          axios.get(`${API_BASE}/anomalies?limit=30`),
          axios.get(`${API_BASE}/root-causes?limit=30`),
          axios.get(`${API_BASE}/forecast?days=14`),
          axios.get(`${API_BASE}/recommendations?limit=10`)
        ]);

        setData({
          health: healthRes.data,
          anomalies: anomaliesRes.data,
          rootCauses: rootCausesRes.data,
          forecast: forecastRes.data,
          recommendations: recsRes.data
        });
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch dashboard data. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="app-container">
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>
      
      <main className="content">
        <header className="dashboard-header">
          <div>
            <h1 className="title">Cloud Cost Guardrail</h1>
            <p className="subtitle">AI-Driven Cost Intelligence & Optimization</p>
          </div>
          <div className={`status-badge ${data.health ? 'connected' : error ? 'error' : 'checking'}`}>
            {data.health ? <ShieldCheck size={20} /> : error ? <AlertTriangle size={20} /> : <Activity size={20} className="spin" />}
            <span>{data.health ? 'System Active' : error ? 'System Offline' : 'Connecting...'}</span>
          </div>
        </header>

        {loading ? (
          <div className="loading-state">
            <Loader2 className="spin loader-icon" size={48} />
            <p>Analyzing cloud patterns & generating insights...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <AlertTriangle size={48} />
            <h3>Connection Error</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">Retry Connection</button>
          </div>
        ) : (
          <div className="dashboard-grid">
            <DashboardCards data={data} />
            <div className="charts-section">
              <Charts data={data} />
            </div>
            <div className="bottom-section">
              <Recommendations recommendations={data.recommendations} />
              <WhatIfSimulator />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
