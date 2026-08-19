from econml.dml import LinearDML

def train_dml_model(Y, T, X, model_y, model_t):
    """
    Initializes and trains the EconML LinearDML model.
    
    Args:
        Y: Outcome vector
        T: Treatment vector
        X: Confounders (features)
        model_y: Estimator for outcome
        model_t: Estimator for treatment
        
    Returns:
        dml_model: The trained Double Machine Learning model.
    """
    dml_model = LinearDML(
        model_y=model_y,
        model_t=model_t,
        discrete_treatment=True,
        random_state=42,
        cv=5
    )

    dml_model.fit(Y, T, X=X, W=None)
    
    return dml_model
