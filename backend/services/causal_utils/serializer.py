"""
serializer.py
-------------
JSON-safe conversion helpers for numpy / pandas types produced by the
causal ML pipeline.

The EconML / DoWhy pipeline produces numpy scalars, numpy arrays, and
pandas DataFrames — none of which are directly JSON-serializable by
Python's built-in `json` module.  These utilities handle the conversion
so that API response payloads are always clean Python primitives.
"""

import json
import math
import numpy as np
import pandas as pd
from typing import Any


# ── Low-level type converter ──────────────────────────────────────────────────

def _convert_value(value: Any) -> Any:
    """
    Recursively converts a single value to a JSON-safe Python type.

    Handles:
        numpy scalars   → int / float / bool
        numpy arrays    → list (with recursive conversion)
        pandas Series   → list
        pandas DataFrame → list of dicts
        NaN / Inf       → None  (JSON null)
        dict / list     → recursively converted
    """
    # ── numpy scalar ──────────────────────────────────────────────────────────
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating,)):
        v = float(value)
        return None if (math.isnan(v) or math.isinf(v)) else v
    if isinstance(value, (np.bool_,)):
        return bool(value)

    # ── numpy / pandas array-like ─────────────────────────────────────────────
    if isinstance(value, np.ndarray):
        return [_convert_value(v) for v in value.tolist()]
    if isinstance(value, pd.Series):
        return [_convert_value(v) for v in value.tolist()]
    if isinstance(value, pd.DataFrame):
        return [
            {k: _convert_value(v) for k, v in row.items()}
            for row in value.to_dict(orient="records")
        ]

    # ── plain Python float (could be NaN / Inf) ───────────────────────────────
    if isinstance(value, float):
        return None if (math.isnan(value) or math.isinf(value)) else value

    # ── containers ────────────────────────────────────────────────────────────
    if isinstance(value, dict):
        return {k: _convert_value(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_convert_value(v) for v in value]

    # ── everything else — return as-is (str, int, bool, None) ─────────────────
    return value


def to_json_serializable(obj: Any) -> Any:
    """
    Converts any object returned by the causal pipeline into a
    JSON-serializable Python structure.

    Usage:
        result = to_json_serializable(pipeline_output)
        json.dumps(result)  # always safe after this call
    """
    return _convert_value(obj)


def results_df_to_records(df: pd.DataFrame, max_rows: int | None = None) -> list[dict]:
    """
    Converts a results DataFrame to a list of JSON-safe record dicts.

    Args:
        df       : The finalized results DataFrame from results_builder.
        max_rows : Optional row limit (useful for API pagination previews).

    Returns:
        List of dicts, one per customer, all values JSON-safe.
    """
    if max_rows is not None:
        df = df.head(max_rows)

    records = df.to_dict(orient="records")
    return [_convert_value(record) for record in records]


def dumps_pipeline_result(pipeline_result: dict) -> str:
    """
    Serializes the full pipeline result dict to a JSON string.

    Wraps `to_json_serializable` + `json.dumps` with proper formatting.
    """
    safe = to_json_serializable(pipeline_result)
    return json.dumps(safe, indent=2, ensure_ascii=False)
