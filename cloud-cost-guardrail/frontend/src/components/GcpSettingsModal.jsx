import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  X, 
  Settings, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  ExternalLink, 
  Database, 
  Key, 
  Layers, 
  Info,
  ShieldCheck,
  UploadCloud,
  FileSpreadsheet
} from 'lucide-react';
import { GcpLogo, BigQueryIcon } from './GcpIcons';

const API_BASE = 'http://localhost:8000/api';

const GcpSettingsModal = ({ isOpen, onClose, onConfigSaved }) => {
  const [connectMethod, setConnectMethod] = useState('csv'); // 'csv' or 'bigquery'
  const [config, setConfig] = useState({
    billing_account_id: '01A4B8-92FE31-77CC90',
    gcp_project_id: 'cloud-cost-guardrail-prod',
    bigquery_dataset: 'billing_export',
    bigquery_table: 'gcp_billing_export_v1_01A4B8_92FE31_77CC90',
    credentials_path: ''
  });

  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState(null);

  useEffect(() => {
    if (isOpen) {
      axios.get(`${API_BASE}/gcp/config`)
        .then(res => setConfig(res.data))
        .catch(err => console.error('Failed to load config:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const res = await axios.post(`${API_BASE}/gcp/test-connection`, config);
      setTestResult(res.data);
    } catch (err) {
      setTestResult({
        connected: false,
        message: err.response?.data?.detail || err.message
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/gcp/config`, config);
      setConfig(res.data);
      setSaveSuccess(true);
      if (onConfigSaved) onConfigSaved(res.data);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to save GCP config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setUploading(true);
      setUploadFeedback(null);
      const res = await axios.post(`${API_BASE}/gcp/upload-billing-csv`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadFeedback({
        success: true,
        message: res.data.message
      });
      if (onConfigSaved) onConfigSaved();
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setUploadFeedback({
        success: false,
        message: err.response?.data?.detail || err.message
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="gcp-modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="gcp-modal-header">
          <div className="header-title-box">
            <GcpLogo size={24} />
            <div>
              <h3>Connect Real Google Cloud Billing Data</h3>
              <p>Choose between direct Cost Table CSV export or BigQuery streaming</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Method Toggle */}
        <div className="modal-method-tabs" style={{ display: 'flex', borderBottom: '1px solid #334155', background: '#141E33', padding: '0 24px' }}>
          <button 
            type="button"
            className={`gcp-tab-btn ${connectMethod === 'csv' ? 'active' : ''}`}
            onClick={() => setConnectMethod('csv')}
          >
            <FileSpreadsheet size={15} />
            <span>Option A: Instant Console CSV (No BigQuery Needed)</span>
          </button>
          <button 
            type="button"
            className={`gcp-tab-btn ${connectMethod === 'bigquery' ? 'active' : ''}`}
            onClick={() => setConnectMethod('bigquery')}
          >
            <BigQueryIcon size={15} />
            <span>Option B: BigQuery Streaming Export</span>
          </button>
        </div>

        {/* METHOD A: DIRECT CONSOLE CSV EXPORT */}
        {connectMethod === 'csv' && (
          <form onSubmit={handleFileUpload} className="gcp-modal-body">
            <div className="gcp-info-callout" style={{ borderLeftColor: '#34A853' }}>
              <Info size={18} className="callout-icon" style={{ color: '#34A853' }} />
              <div className="callout-content">
                <strong>How to get your Billing CSV from Google Cloud Console (30 seconds):</strong>
                <ol style={{ paddingLeft: '18px', marginTop: '6px', lineHeight: '1.6' }}>
                  <li>Open <strong>Google Cloud Console</strong> &gt; navigate to <strong>Billing</strong> &gt; <strong>Cost Table</strong> (or <strong>Reports</strong>).</li>
                  <li>In the top filters, select all your desired projects and date range.</li>
                  <li>Click <strong>Export &gt; CSV</strong> (or Download CSV) at the top right of the table.</li>
                  <li>Upload that downloaded file right here below!</li>
                </ol>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <UploadCloud size={16} /> Select Google Cloud Billing CSV File
              </label>
              <input 
                type="file" 
                accept=".csv"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="form-input"
                style={{ padding: '8px' }}
                required
              />
              <span className="field-hint">
                Accepts Google Cloud Cost Table CSVs, Reports CSVs, or BigQuery CSV query exports.
              </span>
            </div>

            {uploadFeedback && (
              <div className={`connection-feedback-box ${uploadFeedback.success ? 'box-success' : 'box-warning'}`}>
                {uploadFeedback.success ? <CheckCircle2 size={18} className="text-green" /> : <AlertTriangle size={18} className="text-yellow" />}
                <span>{uploadFeedback.message}</span>
              </div>
            )}

            <div className="modal-actions-bar" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="save-btn" disabled={uploading || !selectedFile} style={{ background: '#34A853' }}>
                {uploading ? (
                  <>
                    <Loader2 size={15} className="spin" /> Importing & Training ML...
                  </>
                ) : (
                  'Import & Analyze Real Usage'
                )}
              </button>
            </div>
          </form>
        )}

        {/* METHOD B: BIGQUERY EXPORT */}
        {connectMethod === 'bigquery' && (
          <form onSubmit={handleSave} className="gcp-modal-body">
            <div className="gcp-info-callout">
              <Info size={18} className="callout-icon" />
              <div className="callout-content">
                <strong>How to enable BigQuery Billing Export in Google Cloud:</strong>
                <p>
                  In Google Cloud Console, go to <strong>Billing &gt; Billing export &gt; BigQuery export</strong>. Enable <em>Detailed usage cost export</em>. Google Cloud streams billing records directly to BigQuery for continuous real-time analysis.
                </p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Layers size={14} /> Google Cloud Billing Account ID
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. 01A4B8-92FE31-77CC90"
                value={config.billing_account_id || ''}
                onChange={(e) => setConfig({ ...config, billing_account_id: e.target.value })}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">
                  <Database size={14} /> GCP Project ID (Hosting BigQuery)
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. prod-billing-analysis"
                  value={config.gcp_project_id || ''}
                  onChange={(e) => setConfig({ ...config, gcp_project_id: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <BigQueryIcon size={14} /> BigQuery Dataset Name
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. billing_export"
                  value={config.bigquery_dataset || ''}
                  onChange={(e) => setConfig({ ...config, bigquery_dataset: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Database size={14} /> BigQuery Export Table ID
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. gcp_billing_export_v1_01A4B8_92FE31_77CC90"
                value={config.bigquery_table || ''}
                onChange={(e) => setConfig({ ...config, bigquery_table: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Key size={14} /> Service Account Credentials Path (Optional / ADC)
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="C:\keys\gcp-service-account.json (or leave empty to use ADC)"
                value={config.credentials_path || ''}
                onChange={(e) => setConfig({ ...config, credentials_path: e.target.value })}
              />
              <span className="field-hint">
                If omitted, standard Google Application Default Credentials (`gcloud auth application-default login`) or cached billing store will be used.
              </span>
            </div>

            {testResult && (
              <div className={`connection-feedback-box ${testResult.connected ? 'box-success' : 'box-warning'}`}>
                {testResult.connected ? (
                  <>
                    <CheckCircle2 size={18} className="text-green" />
                    <span>{testResult.message}</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={18} className="text-yellow" />
                    <span>{testResult.message}</span>
                  </>
                )}
              </div>
            )}

            {saveSuccess && (
              <div className="connection-feedback-box box-success">
                <CheckCircle2 size={18} className="text-green" />
                <span>GCP connection settings saved successfully! Syncing telemetry...</span>
              </div>
            )}

            <div className="modal-actions-bar">
              <button 
                type="button" 
                className="test-conn-btn" 
                onClick={handleTestConnection}
                disabled={testing}
              >
                {testing ? <Loader2 size={15} className="spin" /> : <ShieldCheck size={15} />}
                <span>Test Live BigQuery Connection</span>
              </button>

              <div className="primary-actions-group">
                <button type="button" className="cancel-btn" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? <Loader2 size={15} className="spin" /> : 'Save & Sync'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default GcpSettingsModal;
