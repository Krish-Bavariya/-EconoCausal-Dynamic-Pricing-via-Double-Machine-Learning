"""
exporter.py
-----------
Exports causal model results to structured CSV files.

Two export functions:
    export_model_results        — full finalized results (all columns)
    export_ite_scores_only      — lightweight ITE-only export (backward compat)
"""

import os
import pandas as pd
import logging

logger = logging.getLogger(__name__)


def export_model_results(
    df: pd.DataFrame,
    output_path: str = "outputs/ite_scores_final.csv",
) -> str:
    """
    Exports the finalized per-customer results DataFrame to CSV.

    Writes all columns present in the DataFrame (customer_id, ITE,
    segment, recommended_discount, expected_gain, treated, purchased).

    Args:
        df          : Finalized results DataFrame from results_builder.
        output_path : Destination CSV path.

    Returns:
        The absolute path of the written file.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    abs_path = os.path.abspath(output_path)
    logger.info(f"Results exported → {abs_path}  ({len(df):,} rows)")
    return abs_path


def export_ite_scores_only(
    df: pd.DataFrame,
    output_path: str = "outputs/ite_scores.csv",
) -> str:
    """
    Exports only customer_id and ITE columns (backward-compatible format).

    Kept for compatibility with upstream consumers (Member 2, Member 3)
    that depend on the original two-column schema.

    Args:
        df          : DataFrame containing at least customer_id and ITE columns.
        output_path : Destination CSV path.

    Returns:
        The absolute path of the written file.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    output_df = df[["customer_id", "ITE"]].copy()
    output_df.to_csv(output_path, index=False)
    abs_path = os.path.abspath(output_path)
    logger.info(f"ITE scores exported → {abs_path}  ({len(output_df):,} rows)")
    return abs_path


def export_model_metadata(
    summary: dict,
    output_path: str = "outputs/model_metadata.json",
) -> str:
    """
    Exports the model summary dict as a JSON metadata file.

    Useful for the API and dashboard to quickly access ATE, segment
    counts, and ROI without loading the full CSV.

    Args:
        summary     : Output of generate_model_summary().
        output_path : Destination JSON path.

    Returns:
        The absolute path of the written file.
    """
    import json
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    abs_path = os.path.abspath(output_path)
    logger.info(f"Model metadata exported → {abs_path}")
    return abs_path
