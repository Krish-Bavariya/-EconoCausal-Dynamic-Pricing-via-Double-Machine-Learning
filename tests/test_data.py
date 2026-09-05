import pandas as pd

from backend.services.validation import validate_dataset


def test_retail_dataset_has_valid_schema():
    frame = pd.read_csv("data/raw/retail_campaign.csv")
    result = validate_dataset(frame)
    assert result.valid
    assert result.required_columns["status"] == "pass"


def test_validation_reports_duplicates_and_missing_columns():
    frame = pd.DataFrame({"customer_id": [1, 1], "purchased": [0, 1]})
    result = validate_dataset(frame)
    assert result.duplicates["count"] == 0
    assert result.required_columns["status"] == "fail"
