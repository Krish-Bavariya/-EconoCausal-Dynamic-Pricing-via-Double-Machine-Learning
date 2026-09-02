"""
health_check.py
---------------
Validates the causal model's output before serving it via the API.

Checks:
    1. ITE column is present and has no NaN values
    2. ITE values are within a plausible probability-delta range [-1, 1]
    3. Segment column is present with known labels
    4. Persuadables are not more than 80% of customers (potential over-fitting signal)
    5. expected_gain column contains no negative values

Each check returns a `HealthCheckResult` namedtuple with:
    passed  : bool
    name    : str
    message : str
"""

from dataclasses import dataclass, field
import numpy as np
import pandas as pd
import logging

logger = logging.getLogger(__name__)


VALID_SEGMENTS = {
    "Persuadables", "Sure Things", "Lost Causes", "Sleeping Dogs",
    "Sure Things / Lost Causes", "Unknown",
}

ITE_MIN = -1.0
ITE_MAX =  1.0
MAX_PERSUADABLE_FRACTION = 0.80  # flag if >80% are persuadables


@dataclass
class HealthCheckResult:
    """Result of a single health check."""
    name: str
    passed: bool
    message: str


@dataclass
class HealthReport:
    """Aggregated results from all health checks."""
    checks: list[HealthCheckResult] = field(default_factory=list)

    @property
    def all_passed(self) -> bool:
        return all(c.passed for c in self.checks)

    @property
    def failed_checks(self) -> list[HealthCheckResult]:
        return [c for c in self.checks if not c.passed]

    def to_dict(self) -> dict:
        return {
            "all_passed": self.all_passed,
            "checks": [
                {"name": c.name, "passed": c.passed, "message": c.message}
                for c in self.checks
            ],
            "failed_count": len(self.failed_checks),
        }


# ── Individual checks ─────────────────────────────────────────────────────────

def _check_ite_present(df: pd.DataFrame) -> HealthCheckResult:
    """Check 1: ITE column exists."""
    passed = "ITE" in df.columns
    return HealthCheckResult(
        name="ite_column_present",
        passed=passed,
        message="ITE column found." if passed else "ITE column is MISSING from results.",
    )


def _check_ite_no_nan(df: pd.DataFrame) -> HealthCheckResult:
    """Check 2: ITE has no NaN values."""
    if "ITE" not in df.columns:
        return HealthCheckResult("ite_no_nan", False, "Cannot check — ITE column missing.")
    nan_count = int(df["ITE"].isna().sum())
    passed = nan_count == 0
    return HealthCheckResult(
        name="ite_no_nan",
        passed=passed,
        message=f"ITE NaN count: {nan_count}." if not passed else "No NaN values in ITE.",
    )


def _check_ite_range(df: pd.DataFrame) -> HealthCheckResult:
    """Check 3: ITE values are within [-1, 1]."""
    if "ITE" not in df.columns:
        return HealthCheckResult("ite_range", False, "Cannot check — ITE column missing.")
    ite = df["ITE"].dropna()
    out_of_range = int(((ite < ITE_MIN) | (ite > ITE_MAX)).sum())
    passed = out_of_range == 0
    return HealthCheckResult(
        name="ite_range",
        passed=passed,
        message=(
            f"{out_of_range} ITE values outside [{ITE_MIN}, {ITE_MAX}]."
            if not passed
            else f"All ITE values within [{ITE_MIN}, {ITE_MAX}]."
        ),
    )


def _check_segment_column(df: pd.DataFrame) -> HealthCheckResult:
    """Check 4: Segment column is present and contains valid labels."""
    if "segment" not in df.columns:
        return HealthCheckResult("segment_column", False, "Segment column is MISSING.")
    unknown_segs = set(df["segment"].unique()) - VALID_SEGMENTS
    passed = len(unknown_segs) == 0
    return HealthCheckResult(
        name="segment_column",
        passed=passed,
        message=(
            f"Unknown segment labels: {unknown_segs}"
            if not passed
            else "All segment labels are valid."
        ),
    )


def _check_persuadable_fraction(df: pd.DataFrame) -> HealthCheckResult:
    """Check 5: Persuadables fraction is not suspiciously high."""
    if "segment" not in df.columns:
        return HealthCheckResult("persuadable_fraction", False, "Cannot check — segment column missing.")
    total = len(df)
    persuadables = (df["segment"] == "Persuadables").sum()
    fraction = persuadables / total if total > 0 else 0.0
    passed = fraction <= MAX_PERSUADABLE_FRACTION
    return HealthCheckResult(
        name="persuadable_fraction",
        passed=passed,
        message=(
            f"Persuadables fraction is {fraction:.1%} — exceeds {MAX_PERSUADABLE_FRACTION:.0%} threshold. "
            "Consider reviewing the ITE threshold."
            if not passed
            else f"Persuadables fraction is {fraction:.1%} — within acceptable range."
        ),
    )


def _check_expected_gain(df: pd.DataFrame) -> HealthCheckResult:
    """Check 6: expected_gain has no negative values."""
    if "expected_gain" not in df.columns:
        return HealthCheckResult("expected_gain", True, "expected_gain column not present (skipped).")
    neg_count = int((df["expected_gain"] < 0).sum())
    passed = neg_count == 0
    return HealthCheckResult(
        name="expected_gain_non_negative",
        passed=passed,
        message=(
            f"{neg_count} customers have negative expected_gain."
            if not passed
            else "All expected_gain values are non-negative."
        ),
    )


# ── Main runner ───────────────────────────────────────────────────────────────

def run_health_checks(results_df: pd.DataFrame) -> HealthReport:
    """
    Runs all health checks on the finalized results DataFrame.

    Args:
        results_df : Output of results_builder.build_customer_results().

    Returns:
        HealthReport with all individual check results.
    """
    checks = [
        _check_ite_present(results_df),
        _check_ite_no_nan(results_df),
        _check_ite_range(results_df),
        _check_segment_column(results_df),
        _check_persuadable_fraction(results_df),
        _check_expected_gain(results_df),
    ]

    report = HealthReport(checks=checks)

    if report.all_passed:
        logger.info("All health checks PASSED.")
    else:
        for failed in report.failed_checks:
            logger.warning(f"Health check FAILED [{failed.name}]: {failed.message}")

    return report
