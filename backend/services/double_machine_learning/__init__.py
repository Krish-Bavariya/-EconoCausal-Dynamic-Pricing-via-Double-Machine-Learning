# DML package — Double Machine Learning sub-modules

from .features import prepare_model_features
from .estimators import configure_base_estimators
from .training import train_dml_model
from .evaluation import generate_treatment_effects, plot_ite_distribution
from .classification import classify_customers, plot_classification_distribution
from .robustness import (
    estimate_dowhy_effect,
    refute_random_common_cause,
    refute_placebo_treatment,
    compare_robustness,
)
from .results_builder import build_customer_results, get_summary_stats
from .exporter import export_model_results, export_ite_scores_only, export_model_metadata
