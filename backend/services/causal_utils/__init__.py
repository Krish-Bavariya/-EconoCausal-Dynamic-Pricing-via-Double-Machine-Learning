"""
causal_utils
------------
Utility functions for the EconoCausal causal ML engine.

Modules:
    model_summary  — human-readable summary generation
    serializer     — JSON-safe conversion helpers
    health_check   — model output validation checks
    model_cache    — file-based model caching (joblib)
    performance    — timing decorator and execution logger
"""

from .model_summary import generate_model_summary
from .serializer import to_json_serializable, results_df_to_records, dumps_pipeline_result
from .health_check import run_health_checks, HealthCheckResult, HealthReport
from .model_cache import (
    save_model_to_cache,
    load_model_from_cache,
    save_results_to_cache,
    load_results_from_cache,
    clear_cache,
)
from .performance import timed, ExecutionLog, StepResult

__all__ = [
    # Summary
    "generate_model_summary",
    # Serializer
    "to_json_serializable",
    "results_df_to_records",
    "dumps_pipeline_result",
    # Health
    "run_health_checks",
    "HealthCheckResult",
    "HealthReport",
    # Cache
    "save_model_to_cache",
    "load_model_from_cache",
    "save_results_to_cache",
    "load_results_from_cache",
    "clear_cache",
    # Performance
    "timed",
    "ExecutionLog",
    "StepResult",
]
