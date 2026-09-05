"""
test_causal_utils.py
--------------------
Unit tests for backend/services/causal_utils/ modules.

Tests:
    - serializer.py  — numpy / NaN / pandas conversion
    - health_check.py — all 6 individual checks
    - results_builder.py — discount mapping and expected gain

Run with:
    pytest tests/test_causal_utils.py -v
"""

import json
import math
import pytest
import numpy as np
import pandas as pd

# ── Import modules under test ─────────────────────────────────────────────────
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.services.causal_utils.serializer import (
    to_json_serializable,
    results_df_to_records,
    dumps_pipeline_result,
)
from backend.services.causal_utils.health_check import (
    run_health_checks,
    _check_ite_present,
    _check_ite_no_nan,
    _check_ite_range,
    _check_segment_column,
    _check_persuadable_fraction,
    _check_expected_gain,
)
from backend.services.double_machine_learning.results_builder import (
    _recommend_discount,
    _calculate_expected_gain,
    build_customer_results,
    get_summary_stats,
)


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def sample_df():
    """Minimal valid results DataFrame."""
    return pd.DataFrame({
        "customer_id": [f"CUST_{i:03d}" for i in range(10)],
        "ITE": [0.05, -0.02, 0.001, 0.08, -0.01, 0.03, 0.0, 0.06, 0.002, -0.05],
        "segment": [
            "Persuadables", "Sleeping Dogs", "Sure Things", "Persuadables",
            "Sleeping Dogs", "Persuadables", "Lost Causes", "Persuadables",
            "Sure Things", "Sleeping Dogs",
        ],
        "recommended_discount": [20, 0, 10, 20, 0, 20, 0, 20, 10, 0],
        "expected_gain": [3.0, 0.0, 0.0, 6.0, 0.0, 1.0, 0.0, 4.0, 0.0, 0.0],
    })


@pytest.fixture
def raw_ite_df():
    """DataFrame with only customer_id and ITE (pre-classification)."""
    return pd.DataFrame({
        "customer_id": [f"C{i}" for i in range(20)],
        "ITE": np.linspace(-0.1, 0.2, 20),
    })


# ═════════════════════════════════════════════════════════════════════════════
# SERIALIZER TESTS
# ═════════════════════════════════════════════════════════════════════════════

class TestSerializer:

    def test_numpy_int_converted(self):
        result = to_json_serializable({"n": np.int64(42)})
        assert isinstance(result["n"], int)
        assert result["n"] == 42

    def test_numpy_float_converted(self):
        result = to_json_serializable({"f": np.float32(3.14)})
        assert isinstance(result["f"], float)
        assert abs(result["f"] - 3.14) < 0.01

    def test_numpy_bool_converted(self):
        result = to_json_serializable({"b": np.bool_(True)})
        assert result["b"] is True
        assert isinstance(result["b"], bool)

    def test_nan_converted_to_none(self):
        result = to_json_serializable({"v": float("nan")})
        assert result["v"] is None

    def test_inf_converted_to_none(self):
        result = to_json_serializable({"v": float("inf")})
        assert result["v"] is None

    def test_numpy_nan_converted_to_none(self):
        result = to_json_serializable({"v": np.nan})
        assert result["v"] is None

    def test_numpy_array_converted_to_list(self):
        arr = np.array([1.0, 2.0, 3.0])
        result = to_json_serializable({"arr": arr})
        assert isinstance(result["arr"], list)
        assert result["arr"] == [1.0, 2.0, 3.0]

    def test_pandas_series_converted_to_list(self):
        s = pd.Series([1, 2, 3])
        result = to_json_serializable({"s": s})
        assert isinstance(result["s"], list)

    def test_nested_dict_converted(self):
        nested = {"outer": {"inner": np.float64(1.5)}}
        result = to_json_serializable(nested)
        assert isinstance(result["outer"]["inner"], float)

    def test_json_dumps_safe(self):
        """Full dict with numpy types must serialize without error."""
        obj = {
            "ate": np.float64(0.042),
            "counts": np.int64(1000),
            "arr": np.array([0.1, 0.2, 0.3]),
            "nan": np.nan,
        }
        safe = to_json_serializable(obj)
        # Should not raise
        json_str = json.dumps(safe)
        assert isinstance(json_str, str)

    def test_results_df_to_records_returns_list(self, sample_df):
        records = results_df_to_records(sample_df)
        assert isinstance(records, list)
        assert len(records) == len(sample_df)
        assert isinstance(records[0], dict)

    def test_results_df_to_records_max_rows(self, sample_df):
        records = results_df_to_records(sample_df, max_rows=3)
        assert len(records) == 3

    def test_dumps_pipeline_result_returns_string(self):
        obj = {"status": "success", "ate": np.float64(0.04)}
        result = dumps_pipeline_result(obj)
        assert isinstance(result, str)
        parsed = json.loads(result)
        assert parsed["status"] == "success"


# ═════════════════════════════════════════════════════════════════════════════
# HEALTH CHECK TESTS
# ═════════════════════════════════════════════════════════════════════════════

class TestHealthChecks:

    # ── ITE present ──────────────────────────────────────────────────────────

    def test_ite_present_passes(self, sample_df):
        r = _check_ite_present(sample_df)
        assert r.passed is True

    def test_ite_present_fails(self):
        df = pd.DataFrame({"customer_id": [1, 2], "segment": ["A", "B"]})
        r = _check_ite_present(df)
        assert r.passed is False

    # ── ITE no NaN ───────────────────────────────────────────────────────────

    def test_ite_no_nan_passes(self, sample_df):
        r = _check_ite_no_nan(sample_df)
        assert r.passed is True

    def test_ite_no_nan_fails(self, sample_df):
        df = sample_df.copy()
        df.loc[0, "ITE"] = np.nan
        r = _check_ite_no_nan(df)
        assert r.passed is False

    # ── ITE range ────────────────────────────────────────────────────────────

    def test_ite_range_passes(self, sample_df):
        r = _check_ite_range(sample_df)
        assert r.passed is True

    def test_ite_range_fails(self, sample_df):
        df = sample_df.copy()
        df.loc[0, "ITE"] = 1.5  # outside [-1, 1]
        r = _check_ite_range(df)
        assert r.passed is False

    # ── Segment labels ────────────────────────────────────────────────────────

    def test_segment_labels_pass(self, sample_df):
        r = _check_segment_column(sample_df)
        assert r.passed is True

    def test_segment_labels_fail_unknown(self, sample_df):
        df = sample_df.copy()
        df.loc[0, "segment"] = "Undecided"  # unknown label
        r = _check_segment_column(df)
        assert r.passed is False

    def test_segment_missing_column(self):
        df = pd.DataFrame({"customer_id": [1], "ITE": [0.05]})
        r = _check_segment_column(df)
        assert r.passed is False

    # ── Persuadable fraction ──────────────────────────────────────────────────

    def test_persuadable_fraction_passes(self, sample_df):
        r = _check_persuadable_fraction(sample_df)
        assert r.passed is True

    def test_persuadable_fraction_fails_when_too_high(self, sample_df):
        df = sample_df.copy()
        # Set all to Persuadables (100%)
        df["segment"] = "Persuadables"
        r = _check_persuadable_fraction(df)
        assert r.passed is False

    # ── Expected gain ─────────────────────────────────────────────────────────

    def test_expected_gain_passes(self, sample_df):
        r = _check_expected_gain(sample_df)
        assert r.passed is True

    def test_expected_gain_fails(self, sample_df):
        df = sample_df.copy()
        df.loc[0, "expected_gain"] = -5.0
        r = _check_expected_gain(df)
        assert r.passed is False

    # ── Full health report ────────────────────────────────────────────────────

    def test_full_report_all_pass(self, sample_df):
        report = run_health_checks(sample_df)
        assert report.all_passed is True
        assert report.to_dict()["all_passed"] is True
        assert report.to_dict()["failed_count"] == 0

    def test_full_report_catches_failure(self, sample_df):
        df = sample_df.copy()
        df.loc[0, "ITE"] = np.nan
        report = run_health_checks(df)
        assert report.all_passed is False
        failed_names = [c.name for c in report.failed_checks]
        assert "ite_no_nan" in failed_names


# ═════════════════════════════════════════════════════════════════════════════
# RESULTS BUILDER TESTS
# ═════════════════════════════════════════════════════════════════════════════

class TestResultsBuilder:

    # ── Discount mapping ──────────────────────────────────────────────────────

    def test_persuadable_gets_20_discount(self):
        assert _recommend_discount("Persuadables") == 20

    def test_sure_things_gets_10_discount(self):
        assert _recommend_discount("Sure Things") == 10

    def test_lost_causes_gets_0_discount(self):
        assert _recommend_discount("Lost Causes") == 0

    def test_sleeping_dogs_gets_0_discount(self):
        assert _recommend_discount("Sleeping Dogs") == 0

    def test_unknown_segment_gets_0_discount(self):
        assert _recommend_discount("Unknown Segment") == 0

    # ── Expected gain ─────────────────────────────────────────────────────────

    def test_expected_gain_persuadable(self):
        # ITE=0.1, discount=$20, avg_order_value=$100
        # gross=0.1*100=10, net=10-20=-10 → floored to 0
        gain = _calculate_expected_gain(0.1, 20, avg_order_value=100)
        assert gain == 0.0  # net negative → floored

    def test_expected_gain_positive(self):
        # ITE=0.5, discount=$20, avg_order_value=$100
        # gross=50, net=30 → 30.0
        gain = _calculate_expected_gain(0.5, 20, avg_order_value=100)
        assert gain == 30.0

    def test_expected_gain_zero_discount(self):
        # ITE=0.05, discount=$0
        gain = _calculate_expected_gain(0.05, 0, avg_order_value=100)
        assert gain == 5.0

    def test_expected_gain_never_negative(self):
        # ITE=-0.2 (sleeping dog), discount=0
        gain = _calculate_expected_gain(-0.2, 0, avg_order_value=100)
        assert gain == 0.0

    # ── build_customer_results ────────────────────────────────────────────────

    def test_build_creates_required_columns(self, raw_ite_df):
        from backend.services.double_machine_learning.classification import classify_customers
        classified = classify_customers(raw_ite_df, ite_col="ITE")
        result = build_customer_results(classified)
        required = {"customer_id", "ITE", "segment", "recommended_discount", "expected_gain"}
        assert required.issubset(set(result.columns))

    def test_build_row_count_matches(self, raw_ite_df):
        from backend.services.double_machine_learning.classification import classify_customers
        classified = classify_customers(raw_ite_df, ite_col="ITE")
        result = build_customer_results(classified)
        assert len(result) == len(raw_ite_df)

    def test_build_discount_is_valid_tier(self, raw_ite_df):
        from backend.services.double_machine_learning.classification import classify_customers
        classified = classify_customers(raw_ite_df, ite_col="ITE")
        result = build_customer_results(classified)
        assert result["recommended_discount"].isin([0, 10, 20]).all()

    def test_build_expected_gain_non_negative(self, raw_ite_df):
        from backend.services.double_machine_learning.classification import classify_customers
        classified = classify_customers(raw_ite_df, ite_col="ITE")
        result = build_customer_results(classified)
        assert (result["expected_gain"] >= 0).all()

    # ── get_summary_stats ─────────────────────────────────────────────────────

    def test_summary_stats_keys_present(self, sample_df):
        stats = get_summary_stats(sample_df)
        required_keys = {
            "total_customers", "ate", "ite_std", "ite_min", "ite_max",
            "segment_counts", "persuadables_pct",
            "total_expected_gain_usd", "total_discount_cost_usd", "estimated_roi_pct",
        }
        assert required_keys.issubset(set(stats.keys()))

    def test_summary_stats_total_matches_df(self, sample_df):
        stats = get_summary_stats(sample_df)
        assert stats["total_customers"] == len(sample_df)

    def test_summary_stats_ate_is_mean_ite(self, sample_df):
        stats = get_summary_stats(sample_df)
        expected_ate = float(sample_df["ITE"].mean())
        assert abs(stats["ate"] - expected_ate) < 1e-9
