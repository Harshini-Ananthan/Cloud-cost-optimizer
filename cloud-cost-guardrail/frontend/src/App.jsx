import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

// Components
import GcpNavbar from './components/GcpNavbar';
import GcpOverview from './components/GcpOverview';
import GcpServicesView from './components/GcpServicesView';
import GcpAnomalyExplorer from './components/GcpAnomalyExplorer';
import GcpForecastingView from './components/GcpForecastingView';
import GcpRecommendationsView from './components/GcpRecommendationsView';
import GcpWhatIfSimulator from './components/GcpWhatIfSimulator';
import GcpSettingsModal from './components/GcpSettingsModal';

import { AlertTriangle, Loader2 } from 'lucide-react';
import { GcpLogo } from './components/GcpIcons';

const API_BASE = 'http://localhost:8000/api';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProject, setSelectedProject] = useState('ALL');
  const [daysRange, setDaysRange] = useState(365);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Core GCP State
  const [summary, setSummary] = useState({});
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [skus, setSkus] = useState([]);
  const [dailyCosts, setDailyCosts] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // Applied Fixes tracker
  const [appliedFixes, setAppliedFixes] = useState({});
  // Pre-filled modifications for simulator
  const [simulatorCustomMods, setSimulatorCustomMods] = useState(null);

  const fetchGcpData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const projParam = selectedProject !== 'ALL' ? `&project_id=${selectedProject}` : '';
      const projQuery = selectedProject !== 'ALL' ? `?project_id=${selectedProject}` : '';

      const [
        summaryRes,
        projectsRes,
        servicesRes,
        skusRes,
        dailyRes,
        anomaliesRes,
        recsRes
      ] = await Promise.all([
        axios.get(`${API_BASE}/gcp/summary${projQuery}`),
        axios.get(`${API_BASE}/gcp/projects`),
        axios.get(`${API_BASE}/gcp/services${projQuery}`),
        axios.get(`${API_BASE}/gcp/skus?limit=40${projParam}`),
        axios.get(`${API_BASE}/gcp/daily-costs?days=${daysRange}${projParam}`),
        axios.get(`${API_BASE}/anomalies?limit=50${projParam}`),
        axios.get(`${API_BASE}/recommendations?limit=50${projParam}`)
      ]);

      setSummary(summaryRes.data);
      setProjects(projectsRes.data);
      setServices(servicesRes.data);
      setSkus(skusRes.data);
      setDailyCosts(dailyRes.data);
      setAnomalies(anomaliesRes.data);
      setRecommendations(recsRes.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching Google Cloud billing data:', err);
      setError('Failed to fetch real-time Google Cloud billing data. Ensure the FastAPI backend is running on port 8000.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedProject, daysRange]);

  useEffect(() => {
    fetchGcpData();
  }, [fetchGcpData]);

  const handleToggleApplyFix = (recId) => {
    setAppliedFixes(prev => ({
      ...prev,
      [recId]: !prev[recId]
    }));
  };

  const handleNavigateToSimulator = (recommendation) => {
    if (recommendation && recommendation.service === 'Compute Engine') {
      setSimulatorCustomMods({
        compute_engine_reduction_pct: 40.0,
        storage_lifecycle_pct: 30.0,
        bigquery_optimization_pct: 20.0,
        cud_commitment_coverage_pct: 75.0
      });
    } else if (recommendation && recommendation.service === 'BigQuery') {
      setSimulatorCustomMods({
        compute_engine_reduction_pct: 15.0,
        storage_lifecycle_pct: 40.0,
        bigquery_optimization_pct: 55.0,
        cud_commitment_coverage_pct: 30.0
      });
    } else if (recommendation && recommendation.service === 'Cloud Storage') {
      setSimulatorCustomMods({
        compute_engine_reduction_pct: 20.0,
        storage_lifecycle_pct: 70.0,
        bigquery_optimization_pct: 20.0,
        cud_commitment_coverage_pct: 40.0
      });
    } else {
      setSimulatorCustomMods({
        compute_engine_reduction_pct: 30.0,
        storage_lifecycle_pct: 50.0,
        bigquery_optimization_pct: 35.0,
        cud_commitment_coverage_pct: 60.0
      });
    }
    setActiveTab('simulator');
  };

  return (
    <div className="gcp-console-app">
      {/* Google Cloud Ambient Gradient Elements */}
      <div className="gcp-ambient-bg">
        <div className="gcp-glow glow-blue"></div>
        <div className="gcp-glow glow-green"></div>
        <div className="gcp-glow glow-yellow"></div>
      </div>

      <div className="gcp-main-wrapper">
        {/* Google Cloud Console Header Navigation */}
        <GcpNavbar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          projects={projects}
          billingSummary={summary}
          daysRange={daysRange}
          setDaysRange={setDaysRange}
          onRefresh={() => fetchGcpData(true)}
          refreshing={refreshing}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Loading & Error States */}
        {loading ? (
          <div className="gcp-loading-state">
            <GcpLogo size={48} className="gcp-pulse-logo" />
            <h3>Streaming Real-Time Google Cloud Billing Telemetry</h3>
            <p>Querying BigQuery billing exports, computing cross-project allocations, and evaluating ML anomaly models...</p>
          </div>
        ) : error ? (
          <div className="gcp-error-state">
            <AlertTriangle size={48} className="text-yellow" />
            <h3>Google Cloud Gateway Connection Error</h3>
            <p>{error}</p>
            <button onClick={() => fetchGcpData()} className="gcp-retry-btn">
              Retry Connection
            </button>
          </div>
        ) : (
          <main className="gcp-tab-content">
            {/* 1. BILLING OVERVIEW */}
            {activeTab === 'overview' && (
              <GcpOverview 
                summary={summary}
                projects={projects}
                services={services}
                dailyCosts={dailyCosts}
                recommendations={recommendations}
                currency={summary.currency || 'INR'}
                onNavigateTab={setActiveTab}
                onSelectProject={setSelectedProject}
              />
            )}

            {/* 2. PROJECTS & SERVICES DEEP DIVE */}
            {activeTab === 'services' && (
              <GcpServicesView 
                projects={projects}
                services={services}
                skus={skus}
                currency={summary.currency || 'INR'}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
              />
            )}

            {/* 3. ML ANOMALY GUARDRAIL */}
            {activeTab === 'anomalies' && (
              <GcpAnomalyExplorer 
                anomalies={anomalies}
                currency={summary.currency || 'INR'}
                onNavigateToWhatIf={() => setActiveTab('simulator')}
              />
            )}

            {/* 4. SPEND FORECAST & CUDs */}
            {activeTab === 'forecasting' && (
              <GcpForecastingView 
                selectedProject={selectedProject}
                currency={summary.currency || 'INR'}
              />
            )}

            {/* 5. ACTIVE ASSIST RECOMMENDER */}
            {activeTab === 'recommendations' && (
              <GcpRecommendationsView 
                recommendations={recommendations}
                currency={summary.currency || 'INR'}
                appliedFixes={appliedFixes}
                onToggleApplyFix={handleToggleApplyFix}
                onNavigateToSimulator={handleNavigateToSimulator}
              />
            )}

            {/* 6. WHAT-IF FINOPS LAB */}
            {activeTab === 'simulator' && (
              <GcpWhatIfSimulator 
                initialModifications={simulatorCustomMods}
                currency={summary.currency || 'INR'}
              />
            )}
          </main>
        )}
      </div>

      {/* Google Cloud Connection Modal */}
      <GcpSettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigSaved={() => fetchGcpData(true)}
      />
    </div>
  );
}

export default App;
