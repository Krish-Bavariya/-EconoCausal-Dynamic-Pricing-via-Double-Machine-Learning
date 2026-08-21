import os
import sys
import pandas as pd

# Add the project root to sys.path so we can import backend packages
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

from backend.services.double_machine_learning.features import prepare_model_features
from backend.services.double_machine_learning.estimators import configure_base_estimators
from backend.services.double_machine_learning.training import train_dml_model
from backend.services.double_machine_learning.evaluation import generate_treatment_effects, plot_ite_distribution
from backend.services.double_machine_learning.exporter import export_model_results

def main():
    print("[INFO] Starting Double Machine Learning Pipeline...")
    
    # Load dataset
    data_path = os.path.join(PROJECT_ROOT, 'data', 'raw', 'retail_campaign.csv')
    print(f"[INFO] Loading data from {data_path}")
    df = pd.read_csv(data_path)
    
    # 1. Prepare Features
    print("[INFO] Preparing features (X), treatment (T), and outcome (Y)...")
    X, T, Y = prepare_model_features(df)
    
    # 2. Configure Estimator
    print("[INFO] Configuring base estimators...")
    model_y, model_t = configure_base_estimators()
    
    # 3. Train DML Model
    print("[INFO] Training Double Machine Learning model... This might take a moment.")
    dml_model = train_dml_model(Y, T, X, model_y, model_t)
    print("[OK] DML model trained successfully.")
    
    # 4. Generate Treatment Effects
    print("[INFO] Generating Individual Treatment Effects (ITE)...")
    df, ate = generate_treatment_effects(dml_model, X, df)
    print(f"[OK] Average Treatment Effect (ATE): {ate:.4f}")
    
    # 5. Plot and Export
    plot_path = os.path.join(PROJECT_ROOT, 'outputs', 'ite_distribution.png')
    print(f"[INFO] Plotting ITE distribution to {plot_path}...")
    plot_ite_distribution(df, ate, output_path=plot_path)
    
    csv_path = os.path.join(PROJECT_ROOT, 'outputs', 'ite_scores.csv')
    print(f"[INFO] Exporting ITE scores to {csv_path}...")
    export_model_results(df, output_path=csv_path)
    
    print("[INFO] Pipeline completed successfully!")

if __name__ == "__main__":
    main()
