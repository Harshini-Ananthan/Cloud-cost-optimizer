import React, { useState } from 'react';
import { 
  Layers, 
  Database, 
  Search, 
  Filter, 
  ChevronRight, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle,
  HardDrive,
  Cpu,
  BarChart2
} from 'lucide-react';
import { getGcpServiceIcon, GcpLogo } from './GcpIcons';

const GcpServicesView = ({ 
  projects = [], 
  services = [], 
  skus = [], 
  selectedProject, 
  setSelectedProject, 
  currency = 'INR',
  onSelectServiceFilter 
}) => {
  const [skuSearch, setSkuSearch] = useState('');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState('ALL');

  const fmt = (val) => {
    const locale = currency === 'INR' ? 'en-IN' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  const filteredSkus = skus.filter(sku => {
    const matchesService = selectedServiceFilter === 'ALL' || sku.service_name === selectedServiceFilter;
    const matchesSearch = skuSearch === '' || 
      sku.sku_description.toLowerCase().includes(skuSearch.toLowerCase()) ||
      sku.sku_id.toLowerCase().includes(skuSearch.toLowerCase()) ||
      sku.service_name.toLowerCase().includes(skuSearch.toLowerCase());
    return matchesService && matchesSearch;
  });

  return (
    <div className="gcp-services-container">
      {/* 1. Projects Breakdown Card */}
      <div className="gcp-card-box">
        <div className="gcp-card-box-header">
          <div>
            <h3 className="gcp-card-box-title">Google Cloud Projects Hierarchy</h3>
            <p className="gcp-card-box-desc">All projects linked to Billing Account with environment tags and cost shares</p>
          </div>
          <span className="gcp-counter-pill">{projects.length} Active Projects</span>
        </div>

        <div className="gcp-table-responsive">
          <table className="gcp-data-table">
            <thead>
              <tr>
                <th>Project Details</th>
                <th>Environment</th>
                <th>Active Services</th>
                <th>Gross Spend</th>
                <th>Credits & CUDs</th>
                <th>Net Invoiced</th>
                <th>Share</th>
                <th>Anomalies</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((proj) => {
                const isSelected = selectedProject === proj.project_id;
                return (
                  <tr key={proj.project_id} className={isSelected ? 'row-selected' : ''}>
                    <td>
                      <div className="project-cell">
                        <div className="project-icon-box">
                          <Layers size={18} />
                        </div>
                        <div>
                          <div className="project-name">{proj.project_name}</div>
                          <div className="project-id">{proj.project_id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`env-pill env-${proj.environment.toLowerCase()}`}>
                        {proj.environment.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="services-mini-icons">
                        {proj.services.slice(0, 4).map((s) => (
                          <span key={s} title={s} className="service-mini-icon">
                            {getGcpServiceIcon(s, 16)}
                          </span>
                        ))}
                        {proj.services.length > 4 && (
                          <span className="services-more">+{proj.services.length - 4}</span>
                        )}
                      </div>
                    </td>
                    <td>{fmt(proj.gross_cost)}</td>
                    <td className="credits-text">-{fmt(proj.credits)}</td>
                    <td className="net-cost-text">{fmt(proj.net_cost)}</td>
                    <td>
                      <div className="share-cell">
                        <span>{proj.cost_share_pct}%</span>
                        <div className="share-bar-bg">
                          <div className="share-bar-fill" style={{ width: `${Math.min(proj.cost_share_pct, 100)}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {proj.anomaly_count > 0 ? (
                        <span className="anomaly-badge-warning">
                          <AlertTriangle size={12} /> {proj.anomaly_count} detected
                        </span>
                      ) : (
                        <span className="anomaly-badge-clean">
                          <CheckCircle2 size={12} /> Clean
                        </span>
                      )}
                    </td>
                    <td>
                      <button 
                        className={`filter-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => setSelectedProject(isSelected ? 'ALL' : proj.project_id)}
                      >
                        {isSelected ? 'Filtered' : 'Filter Project'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Services Breakdown Grid */}
      <div className="gcp-card-box">
        <div className="gcp-card-box-header">
          <div>
            <h3 className="gcp-card-box-title">Google Cloud Services Consumption</h3>
            <p className="gcp-card-box-desc">Resource utilization across Compute, BigQuery, Cloud Storage, Cloud SQL and Vertex AI</p>
          </div>
          <span className="gcp-counter-pill">{services.length} Google Cloud Services</span>
        </div>

        <div className="gcp-services-card-grid">
          {services.map((srv) => (
            <div 
              key={srv.service_name} 
              className={`gcp-service-card ${selectedServiceFilter === srv.service_name ? 'card-selected' : ''}`}
              onClick={() => setSelectedServiceFilter(selectedServiceFilter === srv.service_name ? 'ALL' : srv.service_name)}
            >
              <div className="service-card-header">
                <div className="service-brand-icon">
                  {getGcpServiceIcon(srv.service_name, 28)}
                </div>
                <div className="service-percentage-badge">
                  {srv.percentage}% of total
                </div>
              </div>
              <h4 className="service-card-name">{srv.service_name}</h4>
              <div className="service-card-cost">{fmt(srv.net_cost)}</div>
              <div className="service-card-footer">
                <span>{srv.skus_count} SKUs tracked</span>
                {srv.anomaly_count > 0 ? (
                  <span className="footer-warning"><AlertTriangle size={12} /> {srv.anomaly_count} spikes</span>
                ) : (
                  <span className="footer-ok">Normal</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. SKU Level Usage and Unit Rates */}
      <div className="gcp-card-box">
        <div className="gcp-card-box-header">
          <div>
            <h3 className="gcp-card-box-title">Granular SKU Consumption & Pricing Table</h3>
            <p className="gcp-card-box-desc">Real-time billed unit quantities, pricing rates, and net invoice contribution per SKU</p>
          </div>

          <div className="gcp-table-controls">
            <div className="gcp-search-input-box">
              <Search size={15} />
              <input 
                type="text" 
                placeholder="Search SKU or service..." 
                value={skuSearch}
                onChange={(e) => setSkuSearch(e.target.value)}
              />
            </div>

            <select 
              value={selectedServiceFilter} 
              onChange={(e) => setSelectedServiceFilter(e.target.value)}
              className="gcp-service-dropdown"
            >
              <option value="ALL">All Services</option>
              {services.map(s => (
                <option key={s.service_name} value={s.service_name}>{s.service_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="gcp-table-responsive">
          <table className="gcp-data-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>SKU ID</th>
                <th>SKU Description</th>
                <th>Usage Quantity</th>
                <th>Pricing Unit</th>
                <th>Gross Cost</th>
                <th>Net Cost</th>
              </tr>
            </thead>
            <tbody>
              {filteredSkus.map((sku) => (
                <tr key={sku.sku_id}>
                  <td>
                    <div className="sku-service-pill">
                      {getGcpServiceIcon(sku.service_name, 16)}
                      <span>{sku.service_name}</span>
                    </div>
                  </td>
                  <td><code className="gcp-sku-code">{sku.sku_id}</code></td>
                  <td className="sku-desc-text">{sku.sku_description}</td>
                  <td className="usage-qty-text">{sku.usage_amount.toLocaleString()}</td>
                  <td><span className="unit-pill">{sku.usage_unit}</span></td>
                  <td>{fmt(sku.gross_cost)}</td>
                  <td className="net-cost-text">{fmt(sku.net_cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GcpServicesView;
