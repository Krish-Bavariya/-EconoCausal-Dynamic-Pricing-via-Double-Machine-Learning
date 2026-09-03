"""
causal_pipeline.py
------------------
Single entry-point for the EconoCausal causal ML pipeline.

This module is the bridge between the causal ML engine and Member 4's
REST API.  It:
    1. Loads and validates input data
    2. Prepares DML features (X, T, Y)
    3. Trains the EconML DML model (with caching)
    4. Generates ITE per customer and computes ATE
    5. Classifies customers into treatment-effect segments
    6. Runs DoWhy robustness / refutation checks
    7. Assembles the finalized per-customer results DataFrame
    8. Exports results to CSV
    9. Runs health checks on the output
    10. Returns a fully JSON-serializable result dict

Usage (from API):
    from backend.services.causal_pipeline import run_causal_pipeline

    result = run_causal_pipeline(data_path="data/raw/retail_campaign.csv")
    # result is JSON-safe — pass directly to API response
"""

import os
import logging
import pandas as pd

# ── DML sub-modules ──────────────────────────────────────────────────────────
from backend.services.double_machine_learning.features import prepare_model_features
from backend.services.double_machine_learning.estimators import configure_base_estimators
from backend.services.double_machine_learning.training import train_dml_model
from backend.services.double_machine_learning.evaluation import (
    generate_treatment_effects,
    plot_ite_distribution,
)
from backend.services.double_machine_learning.classification import (
    classify_customers,
    plot_classification_distribution,
)
from backend.services.double_machine_learning.robustness import (
    estimate_dowhy_effect,
    refute_random_common_cause,
    refute_placebo_treatment,
    compare_robustness,
)
from backend.services.double_machine_learning.results_builder import (
    build_customer_results,
    get_summary_stats,
)
from backend.services.double_machine_learning.exporter import export_model_results

# ── Utility modules ───────────────────────────────────────────────────────────
from backend.services.causal_utils.model_summary import generate_model_summary
from backend.services.causal_utils.serializer import to_json_serializable
from backend.services.causal_utils.health_check import run_health_checks
from backend.services.causal_utils.model_cache import (
    load_model_from_cache,
    save_model_to_cache,
    load_results_from_cache,
    save_results_to_cache,
)
from backend.services.causal_utils.performance import ExecutionLog

logger = logging.getLogger(__name__)

# ── Constants ─────────────────────────────────────────────────────────────────
DEFAULT_DATA_PATH = os.path.join("data", "raw", "retail_campaign.csv")
RESULTS_OUTPUT_PATH = os.path.join("outputs", "ite_scores_final.csv")
CONFOUNDERS = ["recency", "history", "mens", "womens", "newbie"]
TREATMENT_COL = "discount_offered"
OUTCOME_COL = "purchased"
ITE_THRESHOLD = 0.01
BASE_THRESHOLD = 0.5


# ── Step 1: Data loading ──────────────────────────────────────────────────────

def _load_data(data_path: str) -> pd.DataFrame:
    """Loads data from CSV and performs minimal validation."""
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Data file not found: {data_path}")

    df = pd.read_csv(data_path)

    required_cols = CONFOUNDERS + [TREATMENT_COL, OUTCOME_COL]
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    # Ensure customer_id exists
    if "customer_id" not in df.columns:
        df["customer_id"] = [f"CUST_{i:05d}" for i in range(len(df))]

    logger.info(f"Loaded {len(df):,} rows from {data_path}")
    return df


# ── Step 2–4: DML training with cache ────────────────────────────────────────

def _train_or_load_model(df: pd.DataFrame, X, T, Y):
    """Loads a cached DML model or trains from scratch."""
    cached_model = load_model_from_cache(df)
    if cached_model is not None:
        logger.info("Using cached DML model.")
        return cached_model

    logger.info("Training DML model from scratch...")
    model_y, model_t = configure_base_estimators()
    dml_model = train_dml_model(Y, T, X, model_y, model_t)
    save_model_to_cache(dml_model, df)
    return dml_model


# ── Step 6: Robustness checks ─────────────────────────────────────────────────

def _run_robustness(df: pd.DataFrame, ate: float, skip_refutation: bool = False) -> dict:
    """
    Runs DoWhy causal estimation and refutation tests.

    Args:
        df               : Source DataFrame.
        ate              : ATE from DML (for comparison).
        skip_refutation  : Set True to skip slow refutation tests (faster API calls).

    Returns:
        robustness dict from compare_robustness(), or empty dict on failure.
    """
    try:
        model, estimand, estimate = estimate_dowhy_effect(
            df=df,
            treatment=TREATMENT_COL,
            outcome=OUTCOME_COL,
            confounders=CONFOUNDERS,
        )

        if skip_refutation:
            return compare_robustness(ate, estimate, refutation_results=None)

        ref_random = refute_random_common_cause(model, estimand, estimate)
        ref_placebo = refute_placebo_treatment(model, estimand, estimate)

        return compare_robustness(
            ate, estimate,
            refutation_results={
                "random_common_cause": ref_random,
                "placebo_treatment": ref_placebo,
            }
        )
    except Exception as e:
        logger.warning(f"Robustness checks failed (non-fatal): {e}")
        return {}


# ── Main entry point ───────────────────────────────────────────────────────────

def run_causal_pipeline(
    data_path: str = DEFAULT_DATA_PATH,
    skip_robustness: bool = False,
    use_cache: bool = True,
    export_csv: bool = True,
) -> dict:
    """
    Runs the complete EconoCausal pipeline and returns a JSON-safe result dict.

    Args:
        data_path        : Path to the input CSV file.
        skip_robustness  : If True, skip DoWhy refutation tests (faster, for dev).
        use_cache        : If True, use cached model/results when available.
        export_csv       : If True, export the results CSV to `outputs/`.

    Returns:
        A JSON-serializable dict containing:
            status        : "success" or "error"
            summary       : Human-readable summary dict (ATE, segment counts, ROI, etc.)
            health        : Model health check results
            performance   : Timing breakdown per pipeline step
            records       : First 100 customer records (for API preview)
            output_path   : Path to the full exported CSV
    """
    log = ExecutionLog()

    try:
        # ── Load data ──────────────────────────────────────────────────────────
        with log.step("Load Data"):
            df = _load_data(data_path)

        # ── Check results cache ────────────────────────────────────────────────
        if use_cache:
            with log.step("Check Results Cache"):
                cached_results = load_results_from_cache(df)
        else:
            cached_results = None

        if cached_results is not None:
            logger.info("Using fully cached results — skipping model training.")
            results_df = cached_results
            ate = float(results_df["ITE"].mean())
            robustness = {}
        else:
            # ── Prepare features ───────────────────────────────────────────────
            with log.step("Prepare Features"):
                X, T, Y = prepare_model_features(df)

            # ── Train / load DML model ─────────────────────────────────────────
            with log.step("Train DML Model"):
                dml_model = _train_or_load_model(df, X, T, Y)

            # ── Generate ITE / ATE ─────────────────────────────────────────────
            with log.step("Generate ITE"):
                df, ate = generate_treatment_effects(dml_model, X, df)
                plot_ite_distribution(df, ate)
                logger.info(f"ATE: {ate:.6f}")

            # ── Classify customers ─────────────────────────────────────────────
            with log.step("Classify Customers"):
                df = classify_customers(
                    df,
                    ite_col="ITE",
                    ite_threshold=ITE_THRESHOLD,
                    base_threshold=BASE_THRESHOLD,
                )
                plot_classification_distribution(df)

            # ── Robustness checks ──────────────────────────────────────────────
            with log.step("Robustness Checks"):
                robustness = _run_robustness(df, ate, skip_refutation=skip_robustness)

            # ── Build finalized results ────────────────────────────────────────
            with log.step("Build Results"):
                results_df = build_customer_results(df)

            # ── Cache results ──────────────────────────────────────────────────
            if use_cache:
                save_results_to_cache(results_df, df)

        # ── Export CSV ─────────────────────────────────────────────────────────
        if export_csv:
            with log.step("Export CSV"):
                export_model_results(results_df, output_path=RESULTS_OUTPUT_PATH)

        # ── Health checks ──────────────────────────────────────────────────────
        with log.step("Health Checks"):
            health_report = run_health_checks(results_df)

        # ── Generate summary ───────────────────────────────────────────────────
        with log.step("Generate Summary"):
            stats = get_summary_stats(results_df)
            summary = generate_model_summary(stats, robustness=robustness)

        # ── Assemble final result ──────────────────────────────────────────────
        pipeline_result = {
            "status": "success",
            "summary": summary,
            "health": health_report.to_dict(),
            "performance": log.summary(),
            "records": results_df.head(100).to_dict(orient="records"),
            "output_path": RESULTS_OUTPUT_PATH if export_csv else None,
        }

        return to_json_serializable(pipeline_result)

    except Exception as e:
        logger.error(f"Pipeline FAILED: {e}", exc_info=True)
        return to_json_serializable({
            "status": "error",
            "error": str(e),
            "performance": log.summary(),
        })


# ── Allow direct execution ─────────────────────────────────────────────────────
if __name__ == "__main__":
    import json
    import warnings
    warnings.filterwarnings("ignore")
    logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(name)s | %(message)s")

    print("=" * 60)
    print("EconoCausal — Causal Pipeline (Week 4)")
    print("=" * 60)

    result = run_causal_pipeline(skip_robustness=False, use_cache=True)

    print(f"\nStatus : {result['status']}")
    if result["status"] == "success":
        s = result["summary"]
        print(f"ATE    : {s['ate']:+.6f}  ({s['ate_pct']:+.2f} pp)")
        print(f"Total  : {s['total_customers']:,} customers")
        print(f"Segments:")
        for seg, cnt in s["segment_counts"].items():
            print(f"   {seg:<30} {cnt:>6,}")
        print(f"Expected gain : ${s['expected_gain_usd']:,.2f}")
        print(f"ROI           : {s['roi_pct']}%")
        print(f"Health OK     : {result['health']['all_passed']}")
        print(f"\nNarrative:\n{s['narrative_text']}")
        print(f"\nTiming:\n{json.dumps(result['performance'], indent=2)}")
