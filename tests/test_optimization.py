import pandas as pd
import pytest

from backend.services.optimization import optimize_allocation


def test_optimizer_respects_budget_and_targets_highest_effects():
    result = optimize_allocation(pd.DataFrame({"customer_id": [1, 2, 3], "ITE": [0.2, 0.1, -0.1]}), budget=20, max_discount=20, tiers=(0, 10, 20))
    assert result["allocated"] <= 20
    assert result["customers_targeted"] == 1
    assert result["allocation"][0]["customer_id"] == 1


def test_optimizer_rejects_invalid_constraints():
    with pytest.raises(ValueError):
        optimize_allocation(pd.DataFrame({"ITE": [0.1]}), budget=-1)
    with pytest.raises(ValueError):
        optimize_allocation(pd.DataFrame({"ITE": [0.1]}), budget=10, min_discount=20, max_discount=10)
