"""
backend/services/__init__.py
----------------------------
Exports the main causal pipeline entry point for the REST API layer.

Usage (from API route):
    from backend.services import run_causal_pipeline

    result = run_causal_pipeline(data_path=..., skip_robustness=False)
"""

from backend.services.causal_pipeline import run_causal_pipeline

__all__ = ["run_causal_pipeline"]
