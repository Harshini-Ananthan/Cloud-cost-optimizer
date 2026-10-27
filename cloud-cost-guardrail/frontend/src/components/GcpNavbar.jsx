import React from 'react';
import { 
  GcpLogo, 
  ComputeEngineIcon, 
  CloudStorageIcon, 
  BigQueryIcon, 
  CloudSqlIcon, 
  VertexAiIcon, 
  RecommenderIcon 
} from './GcpIcons';
import { 
  RefreshCw, 
  Layers, 
  Calendar, 
  Database, 
  Sliders, 
  Activity, 
  TrendingUp, 
  Settings, 
  ChevronDown, 
  ShieldCheck, 
  Search,
  ExternalLink
} from 'lucide-react';

const GcpNavbar = ({ 
  activeTab, 
  setActiveTab, 
  selectedProject, 
  setSelectedProject, 
  projects = [], 
  billingSummary = {}, 
  daysRange, 
  setDaysRange, 
  onRefresh, 
  refreshing,
  onOpenSettings
}) => {
  return (
    <header className="gcp-console-header">
      {/* 1. Top Google Cloud Brand & Global Controls Bar */}
      <div className="gcp-header-top">
        <div className="gcp-brand-group">
          <div className="gcp-logo-wrapper">
            <GcpLogo size={28} />
          </div>
          <div className="gcp-title-box">
            <div className="gcp-title-line">
              <span className="gcp-brand-name">Google Cloud</span>
              <span className="gcp-divider">/</span>
              <span className="gcp-app-name">Cloud Cost Guardrail</span>
            </div>
            <span className="gcp-subtitle">FinOps Intelligence & Real-Time Billing Optimization</span>
          </div>
        </div>

        {/* Global Project Selector */}
        <div className="gcp-project-selector-container">
          <label className="gcp-control-label">Project</label>
          <div className="gcp-select-wrapper">
            <Layers size={16} className="gcp-select-icon" />
            <select 
              value={selectedProject} 
              onChange={(e) => setSelectedProject(e.target.value)}
              className="gcp-project-select"
            >
              <option value="ALL">All Projects ({projects.length} Total)</option>
              {projects.map((p) => (
                <option key={p.project_id} value={p.project_id}>
                  {p.project_name} ({p.project_id}) - {p.environment.toUpperCase()}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="gcp-select-chevron" />
          </div>
        </div>

        {/* Billing Account & Telemetry Status Badge */}
        <div className="gcp-billing-account-badge">
          <div className="gcp-status-dot pulse-green"></div>
          <div className="gcp-badge-text">
            <span className="gcp-badge-title">Billing Account</span>
            <span className="gcp-badge-val">{billingSummary.billing_account_id || '01A4B8-92FE31-77CC90'}</span>
          </div>
          <span className="gcp-status-tag">ACTIVE FINOPS</span>
        </div>

        {/* Time Range Filter (Past to Present) */}
        <div className="gcp-time-range-group">
          <Calendar size={15} />
          <select 
            value={daysRange} 
            onChange={(e) => setDaysRange(Number(e.target.value))}
            className="gcp-time-select"
          >
            <option value={30}>Past 30 Days</option>
            <option value={90}>Past 90 Days</option>
            <option value={180}>Past 180 Days</option>
            <option value={365}>Past 365 Days (Full History)</option>
          </select>
        </div>

        {/* Action Controls */}
        <div className="gcp-header-actions">
          <button 
            onClick={onRefresh} 
            className={`gcp-action-btn ${refreshing ? 'spinning' : ''}`}
            title="Refresh Real-Time Billing Telemetry"
          >
            <RefreshCw size={16} />
            <span>Sync</span>
          </button>

          <button 
            onClick={onOpenSettings} 
            className="gcp-action-btn secondary"
            title="Configure BigQuery Export & Service Account"
          >
            <Settings size={16} />
            <span>GCP Connect</span>
          </button>
        </div>
      </div>

      {/* 2. Secondary Navigation Tabs */}
      <nav className="gcp-nav-tabs">
        <button 
          className={`gcp-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Activity size={16} />
          <span>Billing Overview</span>
        </button>

        <button 
          className={`gcp-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          <Database size={16} />
          <span>Projects & Services</span>
        </button>

        <button 
          className={`gcp-tab-btn ${activeTab === 'anomalies' ? 'active' : ''}`}
          onClick={() => setActiveTab('anomalies')}
        >
          <ShieldCheck size={16} />
          <span>ML Anomaly Guardrail</span>
        </button>

        <button 
          className={`gcp-tab-btn ${activeTab === 'forecasting' ? 'active' : ''}`}
          onClick={() => setActiveTab('forecasting')}
        >
          <TrendingUp size={16} />
          <span>Spend Forecast & CUDs</span>
        </button>

        <button 
          className={`gcp-tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          <RecommenderIcon size={16} />
          <span>Active Assist Recommender</span>
        </button>

        <button 
          className={`gcp-tab-btn ${activeTab === 'simulator' ? 'active' : ''}`}
          onClick={() => setActiveTab('simulator')}
        >
          <Sliders size={16} />
          <span>What-If FinOps Lab</span>
        </button>
      </nav>
    </header>
  );
};

export default GcpNavbar;
