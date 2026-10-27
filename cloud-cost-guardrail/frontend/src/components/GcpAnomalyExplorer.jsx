import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  ArrowUpDown, 
  Cpu, 
  Database, 
  HardDrive, 
  Zap, 
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { getGcpServiceIcon } from './GcpIcons';

const ROOT_CAUSE_METADATA = {
  'Compute Engine Idle VMs & Overprovisioning': {
    color: '#4285F4',
    bg: 'rgba(66, 133, 244, 0.15)',
    icon: 'Compute Engine',
    desc: 'Unutilized N2/E2 instances running without workload, or overprovisioned vCPU/RAM quotas.'
  },
  'Unattached Persistent Disks (pd-standard/pd-ssd)': {
    color: '#FBBC04',
    bg: 'rgba(251, 188, 4, 0.15)',
    icon: 'Compute Engine',
    desc: 'Orphaned block storage volumes retaining data after parent VM deletion.'
  },
  'BigQuery Unpartitioned Full Table Scans': {
    color: '#669DF6',
    bg: 'rgba(102, 157, 246, 0.15)',
    icon: 'BigQuery',
    desc: 'Ad-hoc or automated analytical queries executing unconstrained multi-terabyte table scans.'
  },
  'Cloud Storage Inactive Accumulation (No Lifecycle Rules)': {
    color: '#34A853',
    bg: 'rgba(52, 168, 83, 0.15)',
    icon: 'Cloud Storage',
    desc: 'Standard storage buckets holding stale raw data without Nearline/Coldline lifecycle policies.'
  },
  'Vertex AI Endpoint Over-retention': {
    color: '#EA4335',
    bg: 'rgba(234, 67, 53, 0.15)',
    icon: 'Vertex AI',
    desc: 'Dedicated GPU/vCPU prediction endpoints deployed with 0 queries per second.'
  },
  'Inter-Region & Internet Network Egress Spike': {
    color: '#FA7B17',
    bg: 'rgba(250, 123, 23, 0.15)',
    icon: 'Networking',
    desc: 'Uncached public downloads or cross-region replication traffic surges.'
  },
  'Cloud SQL Idle Memory & Unscaled Instances': {
    color: '#12B5CB',
    bg: 'rgba(18, 181, 203, 0.15)',
    icon: 'Cloud SQL',
    desc: 'Staging/Dev database instances running 24/7 during off-hours and weekends.'
  }
};

const GcpAnomalyExplorer = ({ anomalies = [], currency = 'INR', onNavigateToWhatIf }) => {
  const [selectedCause, setSelectedCause] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectedAnomaly, setInspectedAnomaly] = useState(null);

  const fmt = (val) => {
    const locale = currency === 'INR' ? 'en-IN' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  const filtered = anomalies.filter((a) => {
    const cause = a.predicted_root_cause || 'Compute Engine Idle VMs & Overprovisioning';
    const matchesCause = selectedCause === 'ALL' || cause === selectedCause;
    const matchesSearch = searchTerm === '' || 
      (a.project_id && a.project_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      cause.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.date.includes(searchTerm);
    return matchesCause && matchesSearch;
  });

  return (
    <div className="gcp-anomaly-view-container">
      {/* 1. Anomaly Overview Banner */}
      <div className="gcp-card-box">
        <div className="gcp-card-box-header">
          <div className="header-with-badge">
            <ShieldAlert size={22} className="alert-icon-blue" />
            <div>
              <h3 className="gcp-card-box-title">Machine Learning Anomaly Detection & Attribution</h3>
              <p className="gcp-card-box-desc">
                Unsupervised Isolation Forest algorithm with 120 estimators flags statistical cloud cost spikes and attributes root causes via Random Forest classifier.
              </p>
            </div>
          </div>
          <span className="gcp-counter-pill alert-pill">{anomalies.length} Flagged Anomalies</span>
        </div>

        {/* Filter controls */}
        <div className="anomaly-filter-bar">
          <div className="gcp-search-input-box">
            <Search size={15} />
            <input 
              type="text" 
              placeholder="Search anomalies by project, date, or cause..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-select-group">
            <Filter size={15} />
            <select 
              value={selectedCause} 
              onChange={(e) => setSelectedCause(e.target.value)}
              className="gcp-service-dropdown"
            >
              <option value="ALL">All Root Causes ({anomalies.length})</option>
              {Object.keys(ROOT_CAUSE_METADATA).map((cause) => (
                <option key={cause} value={cause}>{cause}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Anomalies Grid & Inspection Panel */}
      <div className="anomaly-layout-grid">
        <div className="anomaly-list-pane">
          <div className="gcp-table-responsive">
            <table className="gcp-data-table">
              <thead>
                <tr>
                  <th>Detection Date</th>
                  <th>GCP Project</th>
                  <th>Spike Cost</th>
                  <th>ML Anomaly Score</th>
                  <th>Attributed Root Cause</th>
                  <th>Confidence</th>
                  <th>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => {
                  const cause = item.predicted_root_cause || 'Compute Engine Idle VMs & Overprovisioning';
                  const meta = ROOT_CAUSE_METADATA[cause] || { color: '#4285F4', icon: 'Compute Engine' };
                  const isInspected = inspectedAnomaly && inspectedAnomaly.date === item.date && inspectedAnomaly.project_id === item.project_id;
                  return (
                    <tr 
                      key={`${item.date}-${item.project_id || idx}`}
                      className={`anomaly-row ${isInspected ? 'row-inspected' : ''}`}
                      onClick={() => setInspectedAnomaly(item)}
                    >
                      <td className="anomaly-date-cell">{item.date}</td>
                      <td>
                        <span className="project-tag-pill">{item.project_id || 'prod-core-api'}</span>
                      </td>
                      <td className="spike-cost-cell">{fmt(item.daily_cost)}</td>
                      <td>
                        <div className="score-pill">
                          <span className="score-num">{item.anomaly_score?.toFixed(3) || '-0.142'}</span>
                          <span className="score-label">Outlier</span>
                        </div>
                      </td>
                      <td>
                        <div className="root-cause-chip" style={{ borderColor: meta.color, backgroundColor: meta.bg }}>
                          {getGcpServiceIcon(meta.icon, 15)}
                          <span style={{ color: meta.color }}>{cause}</span>
                        </div>
                      </td>
                      <td>
                        <span className="confidence-pill">
                          {Math.round((item.prediction_confidence || 0.96) * 100)}%
                        </span>
                      </td>
                      <td>
                        <button className="inspect-btn">
                          Details <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inspection Drawer */}
        {inspectedAnomaly && (
          <div className="anomaly-detail-drawer">
            <div className="drawer-header">
              <div className="drawer-title-group">
                <span className="drawer-badge">Root Cause Analysis</span>
                <h3>{inspectedAnomaly.predicted_root_cause}</h3>
                <span className="drawer-sub">
                  Detected on {inspectedAnomaly.date} • {inspectedAnomaly.project_id}
                </span>
              </div>
              <button className="close-drawer-btn" onClick={() => setInspectedAnomaly(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body">
              <div className="drawer-kpi-row">
                <div className="drawer-kpi">
                  <span className="kpi-label">Spike Cost</span>
                  <span className="kpi-val text-red">{fmt(inspectedAnomaly.daily_cost)}</span>
                </div>
                <div className="drawer-kpi">
                  <span className="kpi-label">ML Confidence</span>
                  <span className="kpi-val text-green">
                    {Math.round((inspectedAnomaly.prediction_confidence || 0.98) * 100)}%
                  </span>
                </div>
                <div className="drawer-kpi">
                  <span className="kpi-label">Anomaly Score</span>
                  <span className="kpi-val">{inspectedAnomaly.anomaly_score?.toFixed(4)}</span>
                </div>
              </div>

              {/* Service Breakdown on Spike Day */}
              {inspectedAnomaly.service_breakdown && (
                <div className="drawer-service-breakdown">
                  <h4>Service Cost Contribution on Event Day</h4>
                  <div className="breakdown-bars">
                    {Object.entries(inspectedAnomaly.service_breakdown).map(([srv, cost]) => (
                      <div key={srv} className="breakdown-bar-item">
                        <div className="bar-label-line">
                          <span className="srv-name-line">
                            {getGcpServiceIcon(srv, 16)}
                            <span>{srv}</span>
                          </span>
                          <span className="srv-cost-line">{fmt(cost)}</span>
                        </div>
                        <div className="bar-track">
                          <div 
                            className="bar-fill" 
                            style={{ 
                              width: `${Math.min((cost / (inspectedAnomaly.daily_cost || 1)) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prescriptive Remediation Shortcut */}
              <div className="drawer-remediation-box">
                <div className="remediation-header">
                  <Sparkles size={16} />
                  <span>Recommended FinOps Action</span>
                </div>
                <p className="remediation-text">
                  Apply rightsizing or lifecycle policies to prevent recurring spikes of this nature.
                </p>
                <button 
                  className="drawer-action-btn"
                  onClick={() => onNavigateToWhatIf && onNavigateToWhatIf()}
                >
                  Simulate Optimization in What-If Lab
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GcpAnomalyExplorer;
