"""
model_summary.py
----------------
Generates human-readable and machine-readable summaries from causal
model pipeline outputs.

Two outputs:
    1. Structured dict  — consumed by the REST API / frontend
    2. Narrative string — used by the dashboard's "Summary" card
"""

import logging

logger = logging.getLogger(__name__)


# ── Narrative templates ───────────────────────────────────────────────────────

_NARRATIVE_TEMPLATE = (
    "The causal model identified an Average Treatment Effect (ATE) of "
    "{ate:+.4f} — meaning a discount increases purchase probability by "
    "{ate_pct:.1f} percentage points on average.\n\n"
    "Out of {total_customers:,} customers analysed:\n"
    "  • {persuadables:,} are Persuadables ({persuadables_pct:.1f}%) — "
    "the best targets for discounts.\n"
    "  • {sure_things:,} are Sure Things — likely to buy without a discount.\n"
    "  • {lost_causes:,} are Lost Causes — discounts are wasted on them.\n"
    "  • {sleeping_dogs:,} are Sleeping Dogs — discounts may discourage purchase.\n\n"
    "Targeting only Persuadables is estimated to generate "
    "${expected_gain:,.2f} in incremental revenue, "
    "compared to ${random_baseline:,.2f} under random targeting — "
    "a saving of ${saving:,.2f}."
)


def _extract_segment_count(segment_counts: dict, *keys: str) -> int:
    """Returns the first matching key's count or 0."""
    for key in keys:
        if key in segment_counts:
            return segment_counts[key]
    return 0


def generate_model_summary(
    stats: dict,
    robustness: dict | None = None,
    avg_order_value: float = 100.0,
    random_targeting_rate: float = 0.5,
) -> dict:
    """
    Generates a structured summary dict from pipeline statistics.

    Args:
        stats               : Output of `results_builder.get_summary_stats()`.
        robustness          : Output of `robustness.compare_robustness()`.
        avg_order_value     : Used to compute random-targeting baseline.
        random_targeting_rate: Fraction of customers targeted randomly (default 50%).

    Returns:
        summary dict with keys:
            ate, ate_pct, total_customers, segment_counts,
            expected_gain_usd, random_baseline_usd, saving_usd,
            robustness_passed, narrative_text
    """
    ate = stats.get("ate", 0.0)
    ate_pct = ate * 100.0
    total = stats.get("total_customers", 0)
    seg_counts = stats.get("segment_counts", {})
    expected_gain = stats.get("total_expected_gain_usd", 0.0)

    # ── Segment counts ────────────────────────────────────────────────────────
    persuadables = _extract_segment_count(seg_counts, "Persuadables")
    sure_things  = _extract_segment_count(seg_counts, "Sure Things",
                                          "Sure Things / Lost Causes")
    lost_causes  = _extract_segment_count(seg_counts, "Lost Causes",
                                          "Sure Things / Lost Causes")
    sleeping_dogs = _extract_segment_count(seg_counts, "Sleeping Dogs")
    persuadables_pct = (persuadables / total * 100) if total else 0.0

    # ── Random targeting baseline ─────────────────────────────────────────────
    # Random baseline: treat random_targeting_rate% of customers with $10 avg
    random_treated = int(total * random_targeting_rate)
    random_baseline = random_treated * ate * avg_order_value

    saving = max(expected_gain - random_baseline, 0.0)

    # ── Robustness summary ────────────────────────────────────────────────────
    robustness_passed = None
    if robustness:
        refutations = robustness.get("refutations", {})
        robustness_passed = all(
            r.get("passed", False) for r in refutations.values()
        ) if refutations else None

    # ── Narrative ─────────────────────────────────────────────────────────────
    try:
        narrative = _NARRATIVE_TEMPLATE.format(
            ate=ate,
            ate_pct=ate_pct,
            total_customers=total,
            persuadables=persuadables,
            persuadables_pct=persuadables_pct,
            sure_things=sure_things,
            lost_causes=lost_causes,
            sleeping_dogs=sleeping_dogs,
            expected_gain=expected_gain,
            random_baseline=random_baseline,
            saving=saving,
        )
    except Exception as e:
        logger.warning(f"Could not format narrative: {e}")
        narrative = "Model summary unavailable."

    return {
        "ate": round(ate, 6),
        "ate_pct": round(ate_pct, 4),
        "total_customers": total,
        "segment_counts": seg_counts,
        "persuadables_count": persuadables,
        "persuadables_pct": round(persuadables_pct, 2),
        "expected_gain_usd": round(expected_gain, 2),
        "random_baseline_usd": round(random_baseline, 2),
        "saving_usd": round(saving, 2),
        "roi_pct": stats.get("estimated_roi_pct", 0.0),
        "robustness_passed": robustness_passed,
        "narrative_text": narrative,
    }
