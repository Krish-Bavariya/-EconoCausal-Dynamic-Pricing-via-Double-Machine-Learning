import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import os

def generate_treatment_effects(dml_model, X, df):
    """
    Generates Individual Treatment Effects (ITE) and computes Average Treatment Effect (ATE).
    
    Args:
        dml_model: The trained LinearDML model.
        X: The features matrix used for inference.
        df: The original dataframe to append ITE scores.
        
    Returns:
        df: Updated dataframe with ITE column.
        ate: Average Treatment Effect.
    """
    ite = dml_model.effect(X)
    df['ITE'] = ite
    
    ate = np.mean(ite)
    return df, ate

def plot_ite_distribution(df, ate, output_path='outputs/ite_distribution.png'):
    """
    Plots and saves the ITE distribution graph.
    
    Args:
        df: DataFrame containing the 'ITE' column.
        ate: Average Treatment Effect to plot as a vertical line.
        output_path: Path where the PNG plot should be saved.
    """
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    plt.figure(figsize=(10, 6))
    sns.set_palette('husl')
    
    sns.histplot(df['ITE'], bins=50, kde=True, color='#42A5F5')
    plt.axvline(ate, color='#EF5350', linestyle='--', linewidth=2, label=f'ATE: {ate:.4f}')
    
    plt.title('Distribution of Individual Treatment Effects (ITE)', fontsize=16, fontweight='bold', pad=20)
    plt.xlabel('Individual Treatment Effect (Probability Increase)', fontsize=12)
    plt.ylabel('Number of Customers', fontsize=12)
    plt.legend()
    plt.tight_layout()
    
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    plt.close()
