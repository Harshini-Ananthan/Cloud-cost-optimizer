import React, { useState } from 'react';
import axios from 'axios';
import { Sliders, Calculator, Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const DEFAULT_BASELINE = {
  cpu_utilization: 75.0,
  memory_utilization: 80.0,
  storage_gb: 1000.0,
  network_transfer_gb: 500.0,
  ec2_instances: 50,
  rds_usage_hours: 730,
  snapshot_count: 30,
  autoscaling_events: 10,
  lambda_invocations: 100000
};

const WhatIfSimulator = () => {
  const [modifications, setModifications] = useState({
    cpu_utilization: 75.0,
    ec2_instances: 50,
    storage_gb: 1000.0
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/what-if`, {
        baseline: DEFAULT_BASELINE,
        modifications: modifications
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="simulator-container">
      <div className="section-header">
        <Sliders color="#3b82f6" size={24} />
        <h3>What-If Simulator</h3>
      </div>
      <p className="sim-desc">Adjust usage parameters to simulate cost impact.</p>

      <div className="sliders-container">
        <div className="slider-group">
          <div className="slider-labels">
            <label>CPU Utilization (%)</label>
            <span>{modifications.cpu_utilization}%</span>
          </div>
          <input 
            type="range" min="10" max="100" 
            value={modifications.cpu_utilization}
            onChange={(e) => setModifications({...modifications, cpu_utilization: Number(e.target.value)})}
          />
        </div>

        <div className="slider-group">
          <div className="slider-labels">
            <label>EC2 Instances</label>
            <span>{modifications.ec2_instances}</span>
          </div>
          <input 
            type="range" min="5" max="200" 
            value={modifications.ec2_instances}
            onChange={(e) => setModifications({...modifications, ec2_instances: Number(e.target.value)})}
          />
        </div>

        <div className="slider-group">
          <div className="slider-labels">
            <label>Storage (GB)</label>
            <span>{modifications.storage_gb} GB</span>
          </div>
          <input 
            type="range" min="100" max="5000" step="100"
            value={modifications.storage_gb}
            onChange={(e) => setModifications({...modifications, storage_gb: Number(e.target.value)})}
          />
        </div>
      </div>

      <button className="simulate-btn" onClick={handleSimulate} disabled={loading}>
        {loading ? <Loader2 className="spin" size={20} /> : <Calculator size={20} />}
        Run Simulation
      </button>

      {result && (
        <div className="sim-results">
          <div className="sim-card baseline">
            <h4>Baseline Cost</h4>
            <div className="val">${result.baseline_estimated_cost.toFixed(2)}</div>
          </div>
          <div className="sim-card new">
            <h4>Simulated Cost</h4>
            <div className="val">${result.simulated_estimated_cost.toFixed(2)}</div>
          </div>
          <div className={`sim-card diff ${result.estimated_savings > 0 ? 'positive' : 'negative'}`}>
            <h4>{result.estimated_savings >= 0 ? 'Savings' : 'Extra Cost'}</h4>
            <div className="val">${Math.abs(result.estimated_savings).toFixed(2)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatIfSimulator;
