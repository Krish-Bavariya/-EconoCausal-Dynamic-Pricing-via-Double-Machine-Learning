from lightgbm import LGBMRegressor, LGBMClassifier

def configure_base_estimators():
    """
    Configures and returns the base estimators for the Double Machine Learning model.
    
    Returns:
        model_y: Estimator for predicting the outcome Y from X.
        model_t: Estimator for predicting the treatment T from X.
    """
    model_y = LGBMRegressor(n_estimators=100, max_depth=5, random_state=42)
    model_t = LGBMClassifier(n_estimators=100, max_depth=5, random_state=42)
    
    return model_y, model_t
