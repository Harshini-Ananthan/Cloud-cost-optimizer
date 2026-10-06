# AI-Based Cloud Cost Root Cause Analyzer and Optimization Recommender (Phase 1)

This project provides an intelligent guardrail for cloud costs, helping teams identify root causes of cost spikes and get actionable recommendations.

## Directory Structure
- `frontend/`: React + Vite frontend
- `backend/`: FastAPI backend and data scripts
- `data/raw/`: Raw generated cloud usage datasets
- `data/processed/`: Preprocessed datasets
- `notebooks/`: Jupyter notebooks for EDA
- `models/`: (Future) ML models for root cause analysis
- `tests/`: Pytest tests

## Setup Instructions

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies (recommended to use a virtual environment):
   ```bash
   pip install -r requirements.txt
   ```
3. Generate the realistic mock dataset (10,000 records):
   ```bash
   python generate_data.py
   ```
4. Run the preprocessing script:
   ```bash
   python preprocess_data.py
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

### 3. Running Tests
From the root directory of the project, run:
```bash
pytest tests/
```
