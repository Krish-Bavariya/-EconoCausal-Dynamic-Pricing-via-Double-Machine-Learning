import pandas as pd
import numpy as np
from dowhy import CausalModel
import logging
import networkx as nx

logger = logging.getLogger(__name__)

def build_dowhy_model(df: pd.DataFrame, treatment: str, outcome: str, confounders: list) -> CausalModel:
    """Builds the DoWhy CausalModel."""
    return CausalModel(
        data=df,
        treatment=treatment,
        outcome=outcome,
        common_causes=confounders,
        effect_modifiers=[]
    )

def identify_dowhy_effect(model: CausalModel):
    """Identifies the causal effect from the model."""
    return model.identify_effect(proceed_when_unidentifiable=True)

def fit_dowhy_estimate(model: CausalModel, identified_estimand):
    """Estimates the causal effect using propensity score stratification."""
    return model.estimate_effect(
        identified_estimand,
        method_name="backdoor.propensity_score_stratification",
        test_significance=False
    )

def estimate_dowhy_effect(df: pd.DataFrame, treatment: str, outcome: str, confounders: list):
    """
    Orchestrates DoWhy model creation, identification, and estimation.
    """
    try:
        model = build_dowhy_model(df, treatment, outcome, confounders)
        identified_estimand = identify_dowhy_effect(model)
        estimate = fit_dowhy_estimate(model, identified_estimand)
        
        return model, identified_estimand, estimate
    except Exception as e:
        logger.error(f"Error in DoWhy estimation: {e}")
        raise

def refute_random_common_cause(model, identified_estimand, estimate):
    """
    Runs the random common cause refutation test.
    
    Args:
        model: The DoWhy CausalModel.
        identified_estimand: The identified estimand from DoWhy.
        estimate: The causal effect estimate.
        
    Returns:
        refute_results: The results of the refutation test.
    """
    try:
        refute_results = model.refute_estimate(
            identified_estimand, 
            estimate,
            method_name="random_common_cause",
            random_seed=42
        )
        return refute_results
    except Exception as e:
        logger.error(f"Error in random common cause refutation: {e}")
        return None

def refute_placebo_treatment(model, identified_estimand, estimate):
    """
    Runs the placebo treatment refutation test.
    
    Args:
        model: The DoWhy CausalModel.
        identified_estimand: The identified estimand from DoWhy.
        estimate: The causal effect estimate.
        
    Returns:
        refute_results: The results of the refutation test.
    """
    try:
        refute_results = model.refute_estimate(
            identified_estimand, 
            estimate,
            method_name="placebo_treatment_refuter",
            placebo_type="permute",
            random_seed=42
        )
        return refute_results
    except Exception as e:
        logger.error(f"Error in placebo treatment refutation: {e}")
        return None

def _calculate_percentage_diff(dml_ate: float, dowhy_ate: float) -> float:
    """Calculates the percentage difference between two estimates."""
    if dml_ate != 0:
        return abs(dml_ate - dowhy_ate) / abs(dml_ate) * 100
    return float('inf')

def _parse_refutation_results(dowhy_ate: float, refutation_results: dict) -> dict:
    """Parses and formats refutation results."""
    parsed_results = {}
    if refutation_results:
        for name, ref in refutation_results.items():
            if ref:
                parsed_results[name] = {
                    'passed': ref.new_effect > 0 if dowhy_ate > 0 else ref.new_effect < 0,
                    'new_effect': ref.new_effect,
                    'p_value': getattr(ref, 'refutation_result', {}).get('p_value', None)
                }
    return parsed_results

def compare_robustness(dml_ate: float, dowhy_estimate, refutation_results=None):
    """
    Compares the ATE from EconML with the DoWhy estimate and summarizes robustness.
    """
    dowhy_ate = dowhy_estimate.value
    diff_percent = _calculate_percentage_diff(dml_ate, dowhy_ate)
    parsed_refutations = _parse_refutation_results(dowhy_ate, refutation_results)
        
    return {
        'dml_ate': dml_ate,
        'dowhy_ate': dowhy_ate,
        'difference_percent': diff_percent,
        'refutations': parsed_refutations
    }
