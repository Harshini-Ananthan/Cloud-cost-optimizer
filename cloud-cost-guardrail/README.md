# AI-Based Cloud Cost Root Cause Analyzer and Optimization Recommender

## Project Overview
This project provides an intelligent, automated guardrail for cloud costs. It analyzes AWS-like cloud usage data to detect cost anomalies, pinpoint root causes (e.g., idle resources, storage growth), forecast future cloud spending, and provide actionable optimization recommendations. It features a complete production-grade FastAPI backend and a responsive, modern React dashboard.

## System Architecture
The application consists of three main components:
1. **Machine Learning Pipeline**: Generates realistic data, trains models for anomaly detection (Isolation Forest), root-cause prediction (Random Forest), cost forecasting (Linear Regression/Time Series), and what-if simulation (Random Forest Regressor).
2. **FastAPI Backend**: A production-ready API layer with Pydantic validation, secure CORS, structured logging, and startup ML model validation.
3. **React Dashboard**: A Vite-powered React UI utilizing Recharts for dynamic data visualization, presenting metrics, recommendations, and an interactive What-If Simulator.

## Technologies Used
- **Backend**: Python 3.12, FastAPI, Uvicorn, Pandas, Scikit-Learn, Joblib, Pydantic
- **Frontend**: React 19, Vite, Recharts, Lucide-React, Axios, Vanilla CSS (Glassmorphic UI)
- **Testing**: Pytest

## Directory Structure
- `frontend/`: React + Vite frontend source code
- `backend/`: FastAPI backend, API routers, schemas, and ML training scripts
- `data/raw/`: Raw generated cloud usage datasets
- `data/processed/`: Preprocessed datasets and inference results
- `notebooks/`: Jupyter notebooks for Exploratory Data Analysis (EDA)
- `models/`: Serialized ML models (`.joblib` files)
- `tests/`: Pytest suite (unit & integration tests)

## Setup Instructions

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Generate the dataset and run the ML pipeline:
   ```bash
   python generate_data.py
   python preprocess_data.py
   python train_anomaly_model.py
   python train_root_cause_model.py
   python train_forecast_model.py
   python train_what_if_model.py
   ```
5. Start the FastAPI backend server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## ML Workflow
1. **Data Generation & Preprocessing**: Creates 10,000+ realistic cloud usage records and computes anomaly flags.
2. **Anomaly Detection**: Uses Isolation Forest to isolate cost spikes.
3. **Root Cause Classification**: A Random Forest Classifier trained to categorize anomalies based on resource signatures.
4. **Forecasting**: A regression model trained to predict future daily costs based on historical trends.
5. **What-If Simulation**: A regression model that evaluates the financial impact of adjusting resource utilization parameters.

## API Endpoints
All endpoints are prefixed with `/api`.
- `GET /health` : Validates API status and ML model memory load.
- `GET /anomalies?limit=50` : Returns recently detected cost spikes.
- `GET /root-causes?limit=50` : Returns predicted root causes for cost anomalies.
- `GET /forecast?days=30` : Generates future cost estimates.
- `GET /recommendations?limit=50` : Provides actionable fixes and estimated savings.
- `POST /what-if` : Simulates cost changes based on baseline and modifications payload.

## Testing Instructions
The project includes a robust `pytest` suite for unit and integration testing.
From the root directory of the project, run:
```bash
pytest tests/
```
Ensure the backend models are generated before running the tests.
