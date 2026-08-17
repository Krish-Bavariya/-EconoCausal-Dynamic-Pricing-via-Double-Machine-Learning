import pandas as pd

def prepare_model_features(df: pd.DataFrame):
    """
    Isolates Features (X), Treatment (T), and Outcome (Y) vectors from the dataset.
    
    Args:
        df: Pandas DataFrame containing the customer data.
        
    Returns:
        X: Confounders (features)
        T: Treatment vector
        Y: Outcome vector
    """
    features = ['recency', 'history', 'mens', 'womens', 'newbie']
    treatment_col = 'discount_offered'
    outcome_col = 'purchased'

    X = df[features]
    T = df[treatment_col]
    Y = df[outcome_col]
    
    return X, T, Y
