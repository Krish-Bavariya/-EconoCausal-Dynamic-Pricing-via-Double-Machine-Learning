from __future__ import annotations

from typing import Any

import pandas as pd


def classify_effect(ite: float, propensity: float) -> str:
    if ite >= 0.08 and propensity < 0.8:
        return "Persuadable"
    if ite >= 0.02:
        return "Sure Thing"
    if ite < -0.01:
        return "Do Not Disturb"
    return "Lost Cause"


def optimize_allocation(
    customers: pd.DataFrame,
    budget: float,
    min_discount: float = 0,
    max_discount: float = 20,
    target_count: int | None = None,
    tiers: tuple[float, ...] = (0, 10, 20),
) -> dict[str, Any]:
    if budget < 0 or min_discount < 0 or max_discount < min_discount:
        raise ValueError("Budget and discount constraints are invalid")
    if not tiers or any(tier < min_discount or tier > max_discount for tier in tiers):
        raise ValueError("Discount tiers must be within the configured range")
    frame = customers.copy()
    if "ITE" not in frame:
        raise ValueError("Customer results must include ITE")
    frame["ITE"] = pd.to_numeric(frame["ITE"], errors="coerce")
    frame = frame.dropna(subset=["ITE"]).sort_values("ITE", ascending=False)
    if target_count is not None and target_count < 0:
        raise ValueError("Target customer count cannot be negative")
    eligible = frame[frame["ITE"] > 0].head(target_count or len(frame)).copy()
    eligible["recommended_discount"] = 0.0
    remaining = float(budget)
    for index, row in eligible.iterrows():
        best_tier = max((tier for tier in tiers if tier <= remaining), default=0)
        eligible.at[index, "recommended_discount"] = best_tier
        remaining -= best_tier
    eligible["expected_gain"] = (eligible["ITE"] * eligible["recommended_discount"] * 10).round(2)
    allocated = float(eligible["recommended_discount"].sum())
    gain = float(eligible["expected_gain"].sum())
    return {
        "budget": float(budget),
        "allocated": allocated,
        "remaining": max(0.0, remaining),
        "expected_revenue": round(1100000 + gain, 2),
        "incremental_gain": gain,
        "roi": round((gain / allocated) * 100, 2) if allocated else 0.0,
        "customers_targeted": int((eligible["recommended_discount"] > 0).sum()),
        "allocation": eligible.to_dict(orient="records"),
    }
