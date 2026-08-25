import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import os

def _get_classification_conditions(df: pd.DataFrame, ite_col: str, base_prediction_col: str, 
                                   ite_threshold: float, base_threshold: float) -> tuple:
    """Generates conditions and choices for customer classification."""
    conditions = [
        (df[ite_col] > ite_threshold),
        (df[ite_col] < 0),
        (df[ite_col] >= 0) & (df[ite_col] <= ite_threshold)
    ]
    
    if base_prediction_col and base_prediction_col in df.columns:
        conditions[2] = (df[ite_col] >= 0) & (df[ite_col] <= ite_threshold) & (df[base_prediction_col] > base_threshold)
        conditions.append((df[ite_col] >= 0) & (df[ite_col] <= ite_threshold) & (df[base_prediction_col] <= base_threshold))
        choices = ['Persuadables', 'Sleeping Dogs', 'Sure Things', 'Lost Causes']
    else:
        choices = ['Persuadables', 'Sleeping Dogs', 'Sure Things / Lost Causes']
        
    return conditions, choices

def classify_customers(df: pd.DataFrame, ite_col: str = 'ITE', base_prediction_col: str = None, 
                       ite_threshold: float = 0.01, base_threshold: float = 0.5):
    """
    Classifies customers into four categories based on their uplift (ITE) and base prediction.
    """
    df = df.copy()
    conditions, choices = _get_classification_conditions(
        df, ite_col, base_prediction_col, ite_threshold, base_threshold
    )
    df['segment'] = np.select(conditions, choices, default='Unknown')
    return df

def plot_classification_distribution(df: pd.DataFrame, segment_col: str = 'segment', output_path: str = 'outputs/segments.png'):
    """
    Plots the distribution of customer segments.
    
    Args:
        df: DataFrame containing the customer segments.
        segment_col: Name of the segment column.
        output_path: Path to save the plot.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    plt.figure(figsize=(8, 6))
    
    # Pre-defined colors for standard segments
    palette = {
        'Persuadables': '#66BB6A', # Green
        'Sure Things': '#42A5F5', # Blue
        'Lost Causes': '#9E9E9E', # Grey
        'Sleeping Dogs': '#EF5350', # Red
        'Sure Things / Lost Causes': '#BDBDBD',
        'Unknown': '#000000'
    }
    
    counts = df[segment_col].value_counts()
    
    sns.barplot(x=counts.index, y=counts.values, palette=palette, order=counts.index)
    plt.title('Customer Treatment-Effect Classification', fontsize=14, pad=15)
    plt.xlabel('Segment', fontsize=12)
    plt.ylabel('Number of Customers', fontsize=12)
    plt.xticks(rotation=45)
    plt.tight_layout()
    
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    plt.close()
