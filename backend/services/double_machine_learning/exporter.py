import os

def export_model_results(df, output_path='outputs/ite_scores.csv'):
    """
    Exports the customer ITE scores to a CSV file.
    
    Args:
        df: DataFrame containing at least 'customer_id' and 'ITE'.
        output_path: Path where the CSV should be saved.
    """
    output_df = df[['customer_id', 'ITE']]
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    output_df.to_csv(output_path, index=False)
