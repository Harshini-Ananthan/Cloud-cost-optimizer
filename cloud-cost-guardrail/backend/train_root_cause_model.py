import pandas as pd
import numpy as np
import os
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

def train_and_predict(input_csv, output_csv, model_dir):
    print(f"Loading data from {input_csv}")
    df = pd.read_csv(input_csv)
    
    # Select numerical features
    features = [
        'cpu_utilization',
        'memory_utilization',
        'storage_gb',
        'network_transfer_gb',
        'ec2_instances',
        'rds_usage_hours',
        'snapshot_count',
        'autoscaling_events',
        'lambda_invocations',
        'daily_cost'
    ]
    
    X = df[features].copy()
    y = df['root_cause']
    
    X = X.fillna(X.median())
    
    print("Splitting data into train and test sets...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest Classifier...")
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train)
    
    print("Evaluating model...")
    y_pred = rf_model.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    rec = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
    cm = confusion_matrix(y_test, y_pred)
    
    print(f"Accuracy:  {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"F1-score:  {f1:.4f}")
    print("Confusion Matrix:")
    print(cm)
    
    print(f"Saving model to {model_dir}...")
    os.makedirs(model_dir, exist_ok=True)
    joblib.dump(rf_model, os.path.join(model_dir, 'root_cause_model.joblib'))
    
    print("Generating predictions for the entire dataset...")
    # Get predictions and probabilities for all data
    df['predicted_root_cause'] = rf_model.predict(X)
    probs = rf_model.predict_proba(X)
    df['prediction_confidence'] = np.max(probs, axis=1)
    
    # Save the output
    output_cols = ['date', 'daily_cost', 'anomaly_flag', 'predicted_root_cause', 'prediction_confidence']
    if 'root_cause' in df.columns:
        output_cols.append('root_cause') # Optional: Keep actual root cause for reference
        
    out_df = df[output_cols]
    
    os.makedirs(os.path.dirname(output_csv), exist_ok=True)
    out_df.to_csv(output_csv, index=False)
    print(f"Saved predictions to {output_csv}")

if __name__ == "__main__":
    base_dir = os.path.join(os.path.dirname(__file__), '..')
    input_csv = os.path.join(base_dir, 'data', 'processed', 'anomaly_detection_results.csv')
    output_csv = os.path.join(base_dir, 'data', 'processed', 'root_cause_results.csv')
    model_dir = os.path.join(base_dir, 'models')
    
    if not os.path.exists(input_csv):
        print(f"Error: {input_csv} not found. Run train_anomaly_model.py first.")
    else:
        train_and_predict(input_csv, output_csv, model_dir)
