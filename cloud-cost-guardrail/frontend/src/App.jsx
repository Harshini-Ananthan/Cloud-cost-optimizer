import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [backendStatus, setBackendStatus] = useState({ status: 'checking', message: 'Connecting to backend...' });

  useEffect(() => {
    // Check backend health
    fetch('http://localhost:8000/api/health')
      .then(res => res.json())
      .then(data => setBackendStatus({ status: 'connected', message: data.message }))
      .catch(err => setBackendStatus({ status: 'error', message: 'Failed to connect to backend.' }));
  }, []);

  return (
    <div className="app-container">
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>
      
      <main className="content">
        <header className="hero">
          <div className="badge">Phase 1 Complete</div>
          <h1 className="title">Cloud Cost Guardrail</h1>
          <p className="subtitle">
            AI-Based Cloud Cost Root Cause Analyzer and Optimization Recommender
          </p>
          
          <div className={`status-card ${backendStatus.status}`}>
            <div className="status-indicator">
              <span className="pulse-ring"></span>
              <span className="pulse-dot"></span>
            </div>
            <div className="status-text">
              <h3>Backend Status: {backendStatus.status.toUpperCase()}</h3>
              <p>{backendStatus.message}</p>
            </div>
          </div>
        </header>

        <section className="features-grid">
          <div className="feature-card">
            <div className="icon">📊</div>
            <h3>Intelligent Analytics</h3>
            <p>Processing over 10,000+ realistic AWS-like usage records to discover hidden cost patterns.</p>
          </div>
          <div className="feature-card">
            <div className="icon">🔍</div>
            <h3>Root Cause Detection</h3>
            <p>Identifying anomalies like Idle Resources, Storage Growth, and Database Load dynamically.</p>
          </div>
          <div className="feature-card">
            <div className="icon">💡</div>
            <h3>Actionable Insights</h3>
            <p>Preparing the foundation for ML-driven optimization recommendations.</p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
