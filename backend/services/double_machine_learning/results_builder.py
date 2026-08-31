"""
results_builder.py
------------------
Assembles the complete per-customer result DataFrame from DML outputs.

Columns produced:
    customer_id       | original customer identifier
    ITE               | Individual Treatment Effect from DML
    segment           | Persuadables / Sure Things / Lost Causes / Sleeping Dogs
    recommended_discount | Optimal discount tier ($0 / $10 / $20)
    expected_gain     | ITE × avg_order_value (estimated revenue gain if treated)
    treated           | original treatment status (0/1)
    purchased         | original outcome status (0/1)
"""

import pandas as pd
import numpy as np

# ── Discount tiers ────────────────────────────────────────────────────────────
DISCOUNT_TIERS = [0, 10, 20]
AVG_ORDER_VALUE = 100.0   # assumed average order value in dollars


def _recommend_discount(segment: str) -> int:
    """
    Maps a customer segment to a recommended discount tier.

    Business logic:
        Persuadables   → $20  (high uplift, needs incentive)
        Sure Things    → $10  (will buy anyway; small nudge protects margin)
        Lost Causes    → $0   (discount won't help)
        Sleeping Dogs  → $0   (discount may backfire — negative ITE)
    """
    mapping = {
        "Persuadables":  20,
        "Sure Things":   10,
        "Lost Causes":    0,
        "Sleeping Dogs":  0,
        "Sure Things / Lost Causes": 0,
    }
    return mapping.get(segment, 0)


def _calculate_expected_gain(ite: float, discount: int,
                              avg_order_value: float = AVG_ORDER_VALUE) -> float:
    """
    Estimates expected monetary gain per customer.

    Formula:
        expected_gain = ITE × avg_order_value − discount
        (floored at 0 — we never report a negative "gain" for budget planning)
    """
    gross_gain = ite * avg_order_value
    net_gain = gross_gain - discount
    return round(max(net_gain, 0.0), 4)


def build_customer_results(
    df: pd.DataFrame,
    ite_col: str = "ITE",
    segment_col: str = "segment",
    customer_id_col: str = "customer_id",
    avg_order_value: float = AVG_ORDER_VALUE,
) -> pd.DataFrame:
    """
    Builds the finalized per-customer result DataFrame.

    Args:
        df              : DataFrame containing at minimum ITE and segment columns.
        ite_col         : Name of the ITE column.
        segment_col     : Name of the segment column.
        customer_id_col : Name of the customer ID column (created if missing).
        avg_order_value : Used to convert ITE (probability) into dollar gain.

    Returns:
        results_df : Structured DataFrame with one row per customer.
    """
    df = df.copy()

    # ── Ensure customer_id exists ────────────────────────────────────────────
    if customer_id_col not in df.columns:
        df[customer_id_col] = [f"CUST_{i:05d}" for i in range(len(df))]

    # ── Recommended discount ─────────────────────────────────────────────────
    df["recommended_discount"] = df[segment_col].apply(_recommend_discount)

    # ── Expected monetary gain ───────────────────────────────────────────────
    df["expected_gain"] = df.apply(
        lambda row: _calculate_expected_gain(
            row[ite_col], row["recommended_discount"], avg_order_value
        ),
        axis=1,
    )

    # ── Select and order final columns ───────────────────────────────────────
    core_cols = [customer_id_col, ite_col, segment_col, "recommended_discount", "expected_gain"]
    optional_cols = [c for c in ["discount_offered", "purchased"] if c in df.columns]
    result_cols = core_cols + optional_cols

    results_df = df[result_cols].rename(
        columns={
            customer_id_col: "customer_id",
            ite_col: "ITE",
            segment_col: "segment",
            "discount_offered": "treated",
            "purchased": "purchased",
        }
    )

    return results_df.reset_index(drop=True)


def get_summary_stats(results_df: pd.DataFrame) -> dict:
    """
    Computes aggregate statistics from the finalized results DataFrame.

    Returns a dict suitable for JSON serialization by the API.
    """
    total = len(results_df)
    seg_counts = results_df["segment"].value_counts().to_dict()
    persuadables = seg_counts.get("Persuadables", 0)

    total_expected_gain = float(results_df["expected_gain"].sum())
    total_discount_cost = float(
        (results_df["recommended_discount"]).sum()
    )

    return {
        "total_customers": total,
        "ate": float(results_df["ITE"].mean()),
        "ite_std": float(results_df["ITE"].std()),
        "ite_min": float(results_df["ITE"].min()),
        "ite_max": float(results_df["ITE"].max()),
        "segment_counts": seg_counts,
        "persuadables_pct": round(persuadables / total * 100, 2) if total else 0.0,
        "total_expected_gain_usd": round(total_expected_gain, 2),
        "total_discount_cost_usd": round(total_discount_cost, 2),
        "estimated_roi_pct": round(
            (total_expected_gain / total_discount_cost * 100) if total_discount_cost > 0 else 0.0, 2
        ),
    }
