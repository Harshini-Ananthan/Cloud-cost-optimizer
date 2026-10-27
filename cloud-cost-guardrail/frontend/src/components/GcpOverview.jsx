import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend 
} from 'recharts';
import { 
  DollarSign, 
  TrendingDown, 
  Layers, 
  ShieldAlert, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  Info,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { getGcpServiceIcon, GcpLogo } from './GcpIcons';

const COLORS = [
  '#4285F4', // GCP Blue
  '#34A853', // GCP Green
  '#FBBC04', // GCP Yellow
  '#EA4335', // GCP Red
  '#1A73E8', // Deep Blue
  '#12B5CB', // Teal
  '#9334E6', // Purple
  '#FA7B17'  // Orange
];

const GcpOverview = ({ 
  summary = {}, 
  projects = [], 
  services = [], 
  dailyCosts = [], 
  recommendations = [], 
  onNavigateTab,
  onSelectProject
}) => {
  const currency = summary.currency || 'INR';

  // Format currency helper
  const fmt = (val) => {
    const locale = currency === 'INR' ? 'en-IN' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  const topRecommendations = recommendations.slice(0, 3);
  const totalPotentialSavings = recommendations.reduce((sum, r) => sum + (r.estimated_monthly_savings || 0), 0);

  return (
    <div className="gcp-overview-container">
      {/* 1. Top Executive FinOps KPI Cards */}
      <div className="gcp-kpi-grid">
        <div className="gcp-kpi-card card-blue">
          <div className="gcp-kpi-header">
            <span className="gcp-kpi-title">Gross Cloud Spend</span>
            <span className="gcp-kpi-badge">Past to Present</span>
          </div>
          <div className="gcp-kpi-value">{fmt(summary.total_gross_cost)}</div>
          <div className="gcp-kpi-footer">
            <span>Aggregated across {summary.projects_count || projects.length} active projects</span>
          </div>
        </div>

        <div className="gcp-kpi-card card-green">
          <div className="gcp-kpi-header">
            <span className="gcp-kpi-title">GCP Credits & Discounts</span>
            <span className="gcp-kpi-badge badge-green">Saved</span>
          </div>
          <div className="gcp-kpi-value saved-text">-{fmt(summary.total_credits)}</div>
          <div className="gcp-kpi-submetrics">
            <span>SUD: {fmt(summary.sud_credits)}</span>
            <span>•</span>
            <span>CUD: {fmt(summary.cud_credits)}</span>
          </div>
        </div>

        <div className="gcp-kpi-card card-primary">
          <div className="gcp-kpi-header">
            <span className="gcp-kpi-title">Net Invoiced Spend</span>
            <span className="gcp-kpi-badge badge-primary">After Credits</span>
          </div>
          <div className="gcp-kpi-value">{fmt(summary.total_net_cost)}</div>
          <div className="gcp-kpi-footer">
            <span>Effective discount rate: {summary.total_gross_cost > 0 ? ((summary.total_credits / summary.total_gross_cost) * 100).toFixed(1) : 0}%</span>
          </div>
        </div>

        <div className="gcp-kpi-card card-purple">
          <div className="gcp-kpi-header">
            <span className="gcp-kpi-title">Monthly Projected Run Rate</span>
            <span className="gcp-kpi-badge badge-purple">Run-Rate</span>
          </div>
          <div className="gcp-kpi-value">{fmt(summary.monthly_run_rate)}</div>
          <div className="gcp-kpi-footer">
            <span>Based on latest 30-day telemetry</span>
          </div>
        </div>

        <div className="gcp-kpi-card card-gold">
          <div className="gcp-kpi-header">
            <span className="gcp-kpi-title">Identified Savings</span>
            <span className="gcp-kpi-badge badge-gold">Active Assist</span>
          </div>
          <div className="gcp-kpi-value highlight-gold">{fmt(totalPotentialSavings)}/mo</div>
          <div className="gcp-kpi-action-link" onClick={() => onNavigateTab('recommendations')}>
            <span>{recommendations.length} action items available</span>
            <ChevronRight size={14} />
          </div>
        </div>
      </div>

      {/* 2. Main Visual Charts Section */}
      <div className="gcp-chart-grid">
        {/* Daily Spend Timeline (Past to Present) */}
        <div className="gcp-card-box full-span">
          <div className="gcp-card-box-header">
            <div>
              <h3 className="gcp-card-box-title">Daily Google Cloud Spend & Credits Timeline</h3>
              <p className="gcp-card-box-desc">Historical usage from past to present date with credit offsets and ML anomaly detections</p>
            </div>
            <div className="gcp-timeline-legend">
              <span className="legend-item"><span className="dot dot-blue"></span>Gross Spend</span>
              <span className="legend-item"><span className="dot dot-green"></span>Net Cost</span>
              <span className="legend-item"><span className="dot dot-yellow"></span>Credits</span>
            </div>
          </div>
          
          <div className="gcp-chart-canvas" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyCosts} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4285F4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4285F4" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
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
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    borderColor: '#334155', 
                    borderRadius: 8, 
                    color: '#F8FAFC' 
                  }}
                  formatter={(val) => [fmt(val), '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="gross_cost" 
                  name="Gross Spend" 
                  stroke="#4285F4" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorGross)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="net_cost" 
                  name="Net Billed Cost" 
                  stroke="#34A853" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorNet)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cross-Project Cost Breakdown */}
        <div className="gcp-card-box half-span">
          <div className="gcp-card-box-header">
            <div>
              <h3 className="gcp-card-box-title">Cost by Google Cloud Project</h3>
              <p className="gcp-card-box-desc">Cross-project net spend distribution under this billing account</p>
            </div>
            <button className="gcp-view-all-link" onClick={() => onNavigateTab('services')}>
              View All Projects <ChevronRight size={14} />
            </button>
          </div>

          <div className="gcp-chart-canvas" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projects} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" horizontal={false} />
                <XAxis type="number" stroke="#9AA0A6" fontSize={11} tickFormatter={(val) => `$${val}`} />
                <YAxis 
                  type="category" 
                  dataKey="project_name" 
                  stroke="#9AA0A6" 
                  fontSize={11} 
                  width={140}
                  tickFormatter={(val) => val.length > 18 ? val.slice(0, 18) + '...' : val}
                />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: 8, color: '#F8FAFC' }}
                  formatter={(val) => [fmt(val), 'Net Spend']}
                />
                <Bar dataKey="net_cost" radius={[0, 4, 4, 0]}>
                  {projects.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Services Cost Share Doughnut */}
        <div className="gcp-card-box half-span">
          <div className="gcp-card-box-header">
            <div>
              <h3 className="gcp-card-box-title">Spend by Google Cloud Service</h3>
              <p className="gcp-card-box-desc">Proportional consumption across Compute, Storage, BigQuery & AI</p>
            </div>
            <button className="gcp-view-all-link" onClick={() => onNavigateTab('services')}>
              Deep Dive <ChevronRight size={14} />
            </button>
          </div>

          <div className="gcp-donut-wrapper">
            <div className="gcp-chart-canvas" style={{ height: 260, width: '50%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={services}
                    dataKey="net_cost"
                    nameKey="service_name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {services.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: 8, color: '#F8FAFC' }}
                    formatter={(val) => [fmt(val), 'Net Spend']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="gcp-service-legend-list">
              {services.slice(0, 6).map((s, idx) => (
                <div key={s.service_name} className="gcp-legend-row">
                  <div className="legend-title-group">
                    <span className="service-dot" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span className="service-icon-tiny">{getGcpServiceIcon(s.service_name, 16)}</span>
                    <span className="service-label">{s.service_name}</span>
                  </div>
                  <div className="legend-val-group">
                    <span className="legend-pct">{s.percentage}%</span>
                    <span className="legend-cost">{fmt(s.net_cost)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. High-Impact Active Assist FinOps Recommendations */}
      <div className="gcp-card-box full-span">
        <div className="gcp-card-box-header">
          <div className="header-with-badge">
            <Sparkles size={20} className="sparkle-icon" />
            <div>
              <h3 className="gcp-card-box-title">Active Assist Top Optimization Recommendations</h3>
              <p className="gcp-card-box-desc">ML-derived opportunities to trim unnecessary Google Cloud expenses</p>
            </div>
          </div>
          <button className="gcp-primary-btn" onClick={() => onNavigateTab('recommendations')}>
            View All Recommendations ({recommendations.length}) <ChevronRight size={16} />
          </button>
        </div>

        <div className="gcp-top-recs-grid">
          {topRecommendations.map((rec) => (
            <div key={rec.id} className="gcp-rec-preview-card">
              <div className="rec-card-top">
                <div className="rec-service-badge">
                  {getGcpServiceIcon(rec.service, 18)}
                  <span>{rec.service}</span>
                </div>
                <div className="rec-savings-tag">
                  Save {fmt(rec.estimated_monthly_savings)}/mo
                </div>
              </div>
              <h4 className="rec-title">{rec.title}</h4>
              <p className="rec-issue">{rec.detected_issue}</p>
              <div className="rec-footer-action">
                <span className="rec-project-pill">{rec.project_id}</span>
                <button 
                  className="rec-sim-btn"
                  onClick={() => onNavigateTab('simulator')}
                >
                  Test in What-If <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GcpOverview;
