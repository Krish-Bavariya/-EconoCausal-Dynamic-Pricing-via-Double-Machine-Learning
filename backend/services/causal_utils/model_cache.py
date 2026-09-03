"""
model_cache.py
--------------
File-based model caching using joblib.

Avoids re-training the DML model on every API request.  The cache is
keyed on the dataset path + a SHA-256 fingerprint of the first 1 000
rows, so it automatically invalidates when the data changes.

Cache directory: outputs/model_cache/
"""

import os
import hashlib
import logging
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

try:
    import joblib
    _JOBLIB_AVAILABLE = True
except ImportError:
    _JOBLIB_AVAILABLE = False
    logger.warning("joblib not available — model caching disabled.")

CACHE_DIR = os.path.join("outputs", "model_cache")
_CACHE_VERSION = "v1"  # bump this to invalidate all cached models


# ── Cache key helpers ─────────────────────────────────────────────────────────

def _fingerprint_dataframe(df: pd.DataFrame, n_rows: int = 1000) -> str:
    """
    Generates a SHA-256 fingerprint of the first `n_rows` of a DataFrame.

    This is used as part of the cache key so the cached model is
    invalidated whenever the source data changes.
    """
    sample = df.head(n_rows)
    # Convert to bytes: column names + dtypes + values
    hash_input = (
        str(list(sample.columns))
        + str(list(sample.dtypes))
        + sample.to_csv(index=False)
    ).encode("utf-8")
    return hashlib.sha256(hash_input).hexdigest()[:16]


def _make_cache_key(df: pd.DataFrame) -> str:
    """Constructs a cache filename from the data fingerprint."""
    fp = _fingerprint_dataframe(df)
    return os.path.join(CACHE_DIR, f"dml_model_{_CACHE_VERSION}_{fp}.joblib")


def _make_results_cache_key(df: pd.DataFrame) -> str:
    """Constructs a cache filename for ITE results."""
    fp = _fingerprint_dataframe(df)
    return os.path.join(CACHE_DIR, f"ite_results_{_CACHE_VERSION}_{fp}.joblib")


# ── Cache read / write ────────────────────────────────────────────────────────

def save_model_to_cache(dml_model, df: pd.DataFrame) -> str | None:
    """
    Saves a trained DML model to disk cache.

    Returns:
        The cache path on success, None if caching is unavailable.
    """
    if not _JOBLIB_AVAILABLE:
        return None
    try:
        os.makedirs(CACHE_DIR, exist_ok=True)
        cache_path = _make_cache_key(df)
        joblib.dump(dml_model, cache_path)
        logger.info(f"Model saved to cache: {cache_path}")
        return cache_path
    except Exception as e:
        logger.warning(f"Could not save model to cache: {e}")
        return None


def load_model_from_cache(df: pd.DataFrame):
    """
    Loads a cached DML model if available and valid.

    Returns:
        The cached model object, or None if no valid cache exists.
    """
    if not _JOBLIB_AVAILABLE:
        return None
    cache_path = _make_cache_key(df)
    if not os.path.exists(cache_path):
        logger.info("No cached model found — will train from scratch.")
        return None
    try:
        model = joblib.load(cache_path)
        logger.info(f"Loaded model from cache: {cache_path}")
        return model
    except Exception as e:
        logger.warning(f"Cache load failed ({e}) — will retrain.")
        return None


def save_results_to_cache(results_df: pd.DataFrame, source_df: pd.DataFrame) -> str | None:
    """Saves ITE results DataFrame to disk cache."""
    if not _JOBLIB_AVAILABLE:
        return None
    try:
        os.makedirs(CACHE_DIR, exist_ok=True)
        cache_path = _make_results_cache_key(source_df)
        joblib.dump(results_df, cache_path)
        logger.info(f"Results saved to cache: {cache_path}")
        return cache_path
    except Exception as e:
        logger.warning(f"Could not save results to cache: {e}")
        return None


def load_results_from_cache(source_df: pd.DataFrame) -> pd.DataFrame | None:
    """Loads cached ITE results if available."""
    if not _JOBLIB_AVAILABLE:
        return None
    cache_path = _make_results_cache_key(source_df)
    if not os.path.exists(cache_path):
        return None
    try:
        results_df = joblib.load(cache_path)
        logger.info(f"Loaded results from cache: {cache_path}")
        return results_df
    except Exception as e:
        logger.warning(f"Results cache load failed ({e}).")
        return None


def clear_cache() -> int:
    """
    Clears all cached model files.

    Returns:
        Number of files deleted.
    """
    if not os.path.exists(CACHE_DIR):
        return 0
    count = 0
    for fname in os.listdir(CACHE_DIR):
        if fname.endswith(".joblib"):
            try:
                os.remove(os.path.join(CACHE_DIR, fname))
                count += 1
            except Exception as e:
                logger.warning(f"Could not delete cache file {fname}: {e}")
    logger.info(f"Cache cleared: {count} file(s) removed.")
    return count
