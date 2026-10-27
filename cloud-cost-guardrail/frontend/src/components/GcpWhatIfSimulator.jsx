import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Sliders, 
  RotateCcw, 
  TrendingDown, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  Cpu, 
  HardDrive, 
  Database, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { ComputeEngineIcon, CloudStorageIcon, BigQueryIcon, RecommenderIcon } from './GcpIcons';

const API_BASE = 'http://localhost:8000/api';

const PRESETS = [
  {
    title: 'Aggressive Compute Rightsizing',
    desc: 'Downscale overprovisioned N2 instances, terminate unattached disks, and leverage Spot VMs for batch jobs.',
    tag: 'Quick Win',
    mods: {
      compute_engine_reduction_pct: 35.0,
      storage_lifecycle_pct: 40.0,
      bigquery_optimization_pct: 25.0,
      cud_commitment_coverage_pct: 60.0
    }
  },
  {
    title: 'BigQuery & Data Lake Optimization',
    desc: 'Enforce table partitioning by date and auto-tier historical parquet data to Coldline Storage ($0.004/GB).',
    tag: 'Analytics',
    mods: {
      compute_engine_reduction_pct: 10.0,
      storage_lifecycle_pct: 75.0,
      bigquery_optimization_pct: 55.0,
      cud_commitment_coverage_pct: 20.0
    }
  },
  {
    title: 'Maximum FinOps CUD Commitments',
    desc: 'Lock in 1-Year or 3-Year Committed Use Discounts across all baseline production compute and Cloud SQL nodes.',
    tag: 'FinOps Policy',
    mods: {
      compute_engine_reduction_pct: 15.0,
      storage_lifecycle_pct: 30.0,
      bigquery_optimization_pct: 20.0,
      cud_commitment_coverage_pct: 85.0
    }
  },
  {
    title: 'Non-Production Environment Parking',
    desc: 'Automatically shut down staging/development clusters and database instances during off-peak hours.',
    tag: 'DevOps',
    mods: {
      compute_engine_reduction_pct: 45.0,
      storage_lifecycle_pct: 20.0,
      bigquery_optimization_pct: 10.0,
      cud_commitment_coverage_pct: 40.0
    }
  }
];

const GcpWhatIfSimulator = ({ initialModifications = null, currency = 'INR' }) => {
  const [modifications, setModifications] = useState(
    initialModifications || {
      compute_engine_reduction_pct: 25.0,
      storage_lifecycle_pct: 50.0,
      bigquery_optimization_pct: 30.0,
      cud_commitment_coverage_pct: 60.0
    }
  );

  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = useCallback(async (modsToRun) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/what-if`, { modifications: modsToRun });
      setSimulationResult(res.data);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runSimulation(modifications);
  }, []);

  const handleSliderChange = (key, value) => {
    const updated = { ...modifications, [key]: Number(value) };
    setModifications(updated);
    runSimulation(updated);
  };

  const handleApplyPreset = (preset) => {
    setModifications(preset.mods);
    runSimulation(preset.mods);
  };

  const handleReset = () => {
    const defaults = {
      compute_engine_reduction_pct: 0.0,
      storage_lifecycle_pct: 0.0,
      bigquery_optimization_pct: 0.0,
      cud_commitment_coverage_pct: 0.0
    };
    setModifications(defaults);
    runSimulation(defaults);
  };

  const fmt = (val) => {
    const locale = currency === 'INR' ? 'en-IN' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  const chartData = simulationResult ? [
    {
      name: 'Current Baseline',
      cost: simulationResult.baseline_estimated_cost,
      fill: '#4285F4'
    },
    {
      name: 'Simulated Target',
      cost: simulationResult.simulated_estimated_cost,
      fill: '#34A853'
    }
  ] : [];

  return (
    <div className="gcp-whatif-container">
      {/* 1. Header Banner */}
      <div className="gcp-card-box">
        <div className="gcp-card-box-header">
          <div className="header-with-badge">
            <Sliders size={22} className="trend-icon-blue" />
            <div>
              <h3 className="gcp-card-box-title">Google Cloud FinOps What-If Scenario Simulator</h3>
              <p className="gcp-card-box-desc">
                Evaluate the financial impact of infrastructure rightsizing, GCS lifecycle tiering, BigQuery optimization, and Committed Use Discounts (CUD).
              </p>
            </div>
          </div>

          <button className="reset-sliders-btn" onClick={handleReset}>
            <RotateCcw size={14} /> Reset
          </button>
        </div>

        {/* Preset scenario buttons */}
        <div className="presets-bar">
          <span className="preset-label">Recommended Presets:</span>
          <div className="preset-pill-list">
            {PRESETS.map((p) => (
              <button 
                key={p.title} 
                className="preset-pill-btn"
                onClick={() => handleApplyPreset(p)}
              >
                <span className="preset-tag">{p.tag}</span>
                <span>{p.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Interactive Sliders & Results Grid */}
      <div className="whatif-main-grid">
        {/* Sliders Pane */}
        <div className="sliders-pane gcp-card-box">
          <h4 className="pane-title">Adjust Google Cloud Architecture Levers</h4>

          {/* Slider 1: Compute Engine */}
          <div className="slider-box">
            <div className="slider-header">
              <div className="slider-name">
                <ComputeEngineIcon size={18} />
                <span>Compute Engine Rightsizing & Spot VMs</span>
              </div>
              <span className="slider-val">{modifications.compute_engine_reduction_pct}%</span>
            </div>
            <input 
              type="range" 
              min={0} 
              max={60} 
              step={5}
              value={modifications.compute_engine_reduction_pct}
              onChange={(e) => handleSliderChange('compute_engine_reduction_pct', e.target.value)}
              className="gcp-range-slider"
            />
            <p className="slider-desc">Downscale overprovisioned vCPU/RAM quotas, terminate idle instances, and adopt Spot VMs for fault-tolerant batch pipelines.</p>
          </div>

          {/* Slider 2: Cloud Storage */}
          <div className="slider-box">
            <div className="slider-header">
              <div className="slider-name">
                <CloudStorageIcon size={18} />
                <span>Cloud Storage Lifecycle Tiering to Coldline</span>
              </div>
              <span className="slider-val">{modifications.storage_lifecycle_pct}%</span>
            </div>
            <input 
              type="range" 
              min={0} 
              max={80} 
              step={5}
              value={modifications.storage_lifecycle_pct}
              onChange={(e) => handleSliderChange('storage_lifecycle_pct', e.target.value)}
              className="gcp-range-slider"
            />
            <p className="slider-desc">Transition objects older than 30 days to Nearline ($0.010/GB) and &gt;90 days to Coldline ($0.004/GB), trimming up to 65% off raw storage.</p>
          </div>

          {/* Slider 3: BigQuery */}
          <div className="slider-box">
            <div className="slider-header">
              <div className="slider-name">
                <BigQueryIcon size={18} />
                <span>BigQuery Table Partitioning & Clustering</span>
              </div>
              <span className="slider-val">{modifications.bigquery_optimization_pct}%</span>
            </div>
            <input 
              type="range" 
              min={0} 
              max={60} 
              step={5}
              value={modifications.bigquery_optimization_pct}
              onChange={(e) => handleSliderChange('bigquery_optimization_pct', e.target.value)}
              className="gcp-range-slider"
            />
            <p className="slider-desc">Eliminate full-table analytical scans by partitioning on date and clustering by key query dimensions, reducing billed bytes scanned.</p>
          </div>

          {/* Slider 4: CUDs */}
          <div className="slider-box">
            <div className="slider-header">
              <div className="slider-name">
                <RecommenderIcon size={18} />
                <span>Committed Use Discount (CUD) Coverage</span>
              </div>
              <span className="slider-val">{modifications.cud_commitment_coverage_pct}%</span>
            </div>
            <input 
              type="range" 
              min={0} 
              max={90} 
              step={5}
              value={modifications.cud_commitment_coverage_pct}
              onChange={(e) => handleSliderChange('cud_commitment_coverage_pct', e.target.value)}
              className="gcp-range-slider"
            />
            <p className="slider-desc">Enroll predictable baseline production compute and database instances into 1-Year or 3-Year CUDs to save 37% to 55% over on-demand rates.</p>
          </div>
        </div>

        {/* Results & Visual Comparison Pane */}
        <div className="results-pane gcp-card-box">
          <div className="results-header">
            <h4 className="pane-title">Simulated Financial Impact</h4>
            {loading && <Loader2 size={16} className="spin text-blue" />}
          </div>

          {simulationResult ? (
            <>
              {/* Savings Highlights */}
              <div className="sim-savings-highlight-card">
                <div className="highlight-tag">PROJECTED SAVINGS</div>
                <div className="highlight-value text-green">
                  {fmt(simulationResult.monthly_projected_savings)} <span className="period">/ month</span>
                </div>
                <div className="highlight-sub">
                  Annualized Run-Rate Reduction: <strong>{fmt(simulationResult.annual_projected_savings)} / year</strong> ({simulationResult.savings_percentage}% overall reduction)
                </div>
              </div>

              {/* Before and After Chart */}
              <div className="sim-chart-container" style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" vertical={false} />
                    <XAxis dataKey="name" stroke="#9AA0A6" fontSize={12} />
                    <YAxis stroke="#9AA0A6" fontSize={11} tickFormatter={(val) => `$${val}`} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: 8, color: '#F8FAFC' }}
                      formatter={(val) => [fmt(val), 'Daily Spend']}
                    />
                    <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Granular Breakdown */}
              <div className="sim-breakdown-table">
                <div className="sim-metric-row">
                  <span>Current Baseline Daily Spend:</span>
                  <strong>{fmt(simulationResult.baseline_estimated_cost)}</strong>
                </div>
                <div className="sim-metric-row">
                  <span>Simulated Target Daily Spend:</span>
                  <strong className="text-green">{fmt(simulationResult.simulated_estimated_cost)}</strong>
                </div>
                <div className="sim-metric-row border-top">
                  <span>Net Daily Savings:</span>
                  <strong className="text-green">+{fmt(simulationResult.daily_savings)} / day</strong>
                </div>
              </div>
            </>
          ) : (
            <div className="loading-sim">
              <Loader2 size={32} className="spin text-blue" />
              <p>Evaluating multi-parameter elasticity model...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GcpWhatIfSimulator;
