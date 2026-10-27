import React from 'react';

// Official Google Cloud SVG Brand Icons with exact brand colors and geometry

export const GcpLogo = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M149.2 86.8c1.3-4.9 2-10 2-15.3 0-33.1-26.9-60-60-60-26.6 0-49.1 17.3-56.9 41.3C14.7 57.6 0 74.3 0 94.6c0 22.8 18.5 41.4 41.4 41.4h106.3c24.5 0 44.3-19.8 44.3-44.3 0-21.5-15.3-39.4-35.8-43.3l-7-1.6z" fill="#4285F4"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M147.7 136H41.4C18.5 136 0 117.4 0 94.6c0-19.4 13.4-35.7 31.7-40.3L37 77l44.6 15 66.1 44z" fill="#3367D6"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M91.2 11.5c-26.6 0-49.1 17.3-56.9 41.3l27.1 27.1L91.2 11.5z" fill="#4285F4"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M91.2 11.5c33.1 0 60 26.9 60 60 0 5.3-.7 10.4-2 15.3l35.8 4.9c4.5-6.2 7-13.8 7-22 0-21.5-15.3-39.4-35.8-43.3l-7-1.6C141.4 34.6 118.5 11.5 91.2 11.5z" fill="#EA4335"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M147.7 136h-44l-22.1-44 66.1 44z" fill="#FBBC04"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M192 91.7c0 24.5-19.8 44.3-44.3 44.3h-44l44.3-44.3z" fill="#34A853"/>
  </svg>
);

export const GeminiApiIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4772 12 22C12 16.4772 16.4772 12 22 12C16.4772 12 12 7.52285 12 2Z" fill="url(#gemini-grad)"/>
    <defs>
      <linearGradient id="gemini-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1B73E8"/>
        <stop offset="0.5" stopColor="#7C3AED"/>
        <stop offset="1" stopColor="#EC4899"/>
      </linearGradient>
    </defs>
  </svg>
);

export const AppEngineIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" fill="#4285F4"/>
    <path d="M12 7l4 2.5v5L12 17l-4-2.5v-5L12 7z" fill="#FFFFFF"/>
    <circle cx="12" cy="12" r="2" fill="#1A73E8"/>
  </svg>
);

export const FirebaseIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M4.5 18.5L8 3l3.5 6.5-7 9z" fill="#FFA000"/>
    <path d="M19.5 18.5L16 8.5 4.5 18.5h15z" fill="#F57C00"/>
    <path d="M12.5 10l-4.5 8.5h11.5L12.5 10z" fill="#FFCA28"/>
  </svg>
);

export const CloudRunIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" fill="#4285F4"/>
    <path d="M8 12l3 3 5-6" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ArtifactRegistryIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" fill="#34A853"/>
    <path d="M12 6.5l5.5 3.2v6.4L12 19.3 6.5 16.1V9.7L12 6.5z" stroke="#FFFFFF" strokeWidth="1.5" fill="none"/>
    <rect x="9.5" y="9.5" width="5" height="5" rx="0.5" fill="#FFFFFF"/>
  </svg>
);

export const SecretManagerIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2L4 5v6.5C4 16.5 7.5 21 12 22c4.5-1 8-5.5 8-10.5V5l-8-3z" fill="#1A73E8"/>
    <circle cx="12" cy="10.5" r="2.2" fill="#FBBC04"/>
    <path d="M12 12.7v4M10.5 15.2h3" stroke="#FBBC04" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

export const CloudBuildIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3" y="5" width="18" height="14" rx="2" fill="#4285F4"/>
    <path d="M8 12h8M12 8v8" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="5.5" cy="8" r="0.75" fill="#FFFFFF"/>
    <circle cx="5.5" cy="12" r="0.75" fill="#FFFFFF"/>
    <circle cx="5.5" cy="16" r="0.75" fill="#FFFFFF"/>
  </svg>
);

export const GoogleMapsIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335"/>
    <circle cx="12" cy="9" r="3" fill="#FFFFFF"/>
    <circle cx="12" cy="9" r="1.5" fill="#1A73E8"/>
  </svg>
);

export const CloudLoggingIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3" y="4" width="18" height="16" rx="2" fill="#1A73E8"/>
    <path d="M7 8h10M7 12h10M7 16h6" stroke="#FFFFFF" strokeWidth="1.75" strokeLinecap="round"/>
  </svg>
);

export const IdentityPlatformIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="8" r="4" fill="#4285F4"/>
    <path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" fill="#3367D6"/>
    <circle cx="17.5" cy="16.5" r="3" fill="#34A853"/>
    <path d="M16.5 16.5l0.8 0.8 1.5-1.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

export const CloudTasksIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="9" fill="#4285F4"/>
    <path d="M12 7v5l3.5 2" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const ComputeEngineIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M4 7a1 1 0 011-1h14a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V7z" fill="#4285F4"/>
    <path d="M7 3v3M12 3v3M17 3v3M7 18v3M12 18v3M17 18v3M1 9h3M1 12h3M1 15h3M20 9h3M20 12h3M20 15h3" stroke="#4285F4" strokeWidth="1.75" strokeLinecap="round"/>
    <rect x="7.5" y="8.5" width="9" height="7" rx="0.75" fill="#FFFFFF"/>
    <circle cx="10" cy="12" r="1.2" fill="#4285F4"/>
    <circle cx="14" cy="12" r="1.2" fill="#34A853"/>
  </svg>
);

export const CloudStorageIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3" y="4" width="18" height="4.5" rx="1" fill="#4285F4"/>
    <rect x="3" y="9.75" width="18" height="4.5" rx="1" fill="#34A853"/>
    <rect x="3" y="15.5" width="18" height="4.5" rx="1" fill="#FBBC04"/>
    <circle cx="6" cy="6.25" r="0.9" fill="#FFFFFF"/>
    <circle cx="6" cy="12" r="0.9" fill="#FFFFFF"/>
    <circle cx="6" cy="17.75" r="0.9" fill="#FFFFFF"/>
    <path d="M14 6.25h4M14 12h4M14 17.75h4" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

export const BigQueryIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" fill="#4285F4"/>
    <path d="M12 4.2L5.2 8 12 11.8 18.8 8 12 4.2z" fill="#669DF6"/>
    <path d="M5 9.5v5l7 3.9v-5.1L5 9.5z" fill="#3367D6"/>
    <path d="M19 9.5l-7 3.8v5.1l7-3.9v-5z" fill="#1A73E8"/>
    <path d="M12 11v6M9 9.5v3M15 9.5v3" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const CloudSqlIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <ellipse cx="12" cy="6" rx="8" ry="3" fill="#4285F4"/>
    <path d="M4 6v5c0 1.66 3.58 3 8 3s8-1.34 8-3V6" fill="#3367D6"/>
    <ellipse cx="12" cy="11" rx="8" ry="3" fill="#669DF6"/>
    <path d="M4 11v5c0 1.66 3.58 3 8 3s8-1.34 8-3v-5" fill="#1A73E8"/>
    <ellipse cx="12" cy="16" rx="8" ry="3" fill="#4285F4"/>
  </svg>
);

export const GkeIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z" fill="#326CE5"/>
    <path d="M12 5.5l5.5 3.2v6.4L12 18.3 6.5 15.1V8.7L12 5.5z" stroke="#FFFFFF" strokeWidth="1.5" fill="none"/>
    <circle cx="12" cy="12" r="2.2" fill="#FFFFFF"/>
  </svg>
);

export const VertexAiIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="9" fill="#1A73E8"/>
    <circle cx="12" cy="7" r="1.8" fill="#FFFFFF"/>
    <circle cx="7" cy="15" r="1.8" fill="#FFFFFF"/>
    <circle cx="17" cy="15" r="1.8" fill="#FFFFFF"/>
    <path d="M12 7l-5 8M12 7l5 8M7 15h10" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="1.4" fill="#FBBC04"/>
  </svg>
);

export const NetworkingIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="2" y="14" width="6" height="6" rx="1" fill="#4285F4"/>
    <rect x="16" y="14" width="6" height="6" rx="1" fill="#34A853"/>
    <rect x="9" y="4" width="6" height="6" rx="1" fill="#FBBC04"/>
    <path d="M12 10v4M5 14v-2h14v2" stroke="#4285F4" strokeWidth="1.75" strokeLinecap="round"/>
  </svg>
);

export const RecommenderIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="9" fill="#34A853"/>
    <path d="M12 6v6l4 2" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="2" fill="#FFFFFF"/>
  </svg>
);

export const DataplexIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="6" cy="6" r="3" fill="#4285F4"/>
    <circle cx="18" cy="6" r="3" fill="#34A853"/>
    <circle cx="12" cy="18" r="3" fill="#FBBC04"/>
    <path d="M6 6l12 0M6 6l6 12M18 6l-6 12" stroke="#FFFFFF" strokeWidth="1.5"/>
  </svg>
);

export const TranslateIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3" y="4" width="18" height="16" rx="2" fill="#4285F4"/>
    <path d="M7 8h6M10 8v6M14 10l3 6M17 10l-3 6" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const getGcpServiceIcon = (serviceName, size = 20) => {
  const s = (serviceName || '').toLowerCase();
  
  // Gemini & Generative AI
  if (s.includes('gemini') || s.includes('generative') || s.includes('ai platform')) {
    return <GeminiApiIcon size={size} />;
  }
  // App Engine & Firestore
  if (s.includes('app engine') || s.includes('firestore') || s.includes('datastore')) {
    return <AppEngineIcon size={size} />;
  }
  // Firebase
  if (s.includes('firebase')) {
    return <FirebaseIcon size={size} />;
  }
  // Cloud Run & Functions
  if (s.includes('run') || s.includes('function')) {
    return <CloudRunIcon size={size} />;
  }
  // Artifact Registry & Container Registry
  if (s.includes('artifact') || s.includes('container registry')) {
    return <ArtifactRegistryIcon size={size} />;
  }
  // Secret Manager
  if (s.includes('secret')) {
    return <SecretManagerIcon size={size} />;
  }
  // Cloud Build
  if (s.includes('build')) {
    return <CloudBuildIcon size={size} />;
  }
  // Google Maps, Places, Geocoding, Routes
  if (s.includes('place') || s.includes('map') || s.includes('geocode') || s.includes('route')) {
    return <GoogleMapsIcon size={size} />;
  }
  // Cloud Logging & Monitoring
  if (s.includes('logging') || s.includes('monitoring') || s.includes('trace') || s.includes('stackdriver')) {
    return <CloudLoggingIcon size={size} />;
  }
  // Identity Platform & IAM
  if (s.includes('identity') || s.includes('auth') || s.includes('iam')) {
    return <IdentityPlatformIcon size={size} />;
  }
  // Cloud Tasks & Cloud Scheduler
  if (s.includes('task') || s.includes('scheduler') || s.includes('cron')) {
    return <CloudTasksIcon size={size} />;
  }
  // Dataplex
  if (s.includes('dataplex') || s.includes('data catalog')) {
    return <DataplexIcon size={size} />;
  }
  // Translate
  if (s.includes('translate')) {
    return <TranslateIcon size={size} />;
  }
  // Compute Engine
  if (s.includes('compute') || s.includes('gce') || s.includes('vm') || s.includes('instance')) {
    return <ComputeEngineIcon size={size} />;
  }
  // Cloud Storage
  if (s.includes('storage') || s.includes('gcs') || s.includes('bucket')) {
    return <CloudStorageIcon size={size} />;
  }
  // BigQuery
  if (s.includes('bigquery') || s.includes('bq') || s.includes('warehouse')) {
    return <BigQueryIcon size={size} />;
  }
  // Cloud SQL
  if (s.includes('sql') || s.includes('postgres') || s.includes('mysql')) {
    return <CloudSqlIcon size={size} />;
  }
  // Kubernetes / GKE
  if (s.includes('kubernetes') || s.includes('gke')) {
    return <GkeIcon size={size} />;
  }
  // Vertex AI
  if (s.includes('vertex')) {
    return <VertexAiIcon size={size} />;
  }
  // Networking / Egress
  if (s.includes('network') || s.includes('egress') || s.includes('vpc') || s.includes('nat')) {
    return <NetworkingIcon size={size} />;
  }

  return <GcpLogo size={size} />;
};
