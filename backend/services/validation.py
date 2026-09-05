from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any

import pandas as pd

REQUIRED_COLUMNS = {
    "customer_id",
    "recency",
    "history",
    "mens",
    "womens",
    "newbie",
    "discount_offered",
    "purchased",
}


@dataclass(frozen=True)
class ValidationResult:
    schema_check: dict[str, Any]
    missing_values: dict[str, Any]
    duplicates: dict[str, Any]
    required_columns: dict[str, Any]
    data_types: dict[str, Any]
    invalid_values: dict[str, Any]

    @property
    def valid(self) -> bool:
        return all(item["status"] == "pass" for item in asdict(self).values())

    def as_dict(self) -> dict[str, Any]:
        result = asdict(self)
        result["valid"] = self.valid
        return result


def validate_dataset(frame: pd.DataFrame) -> ValidationResult:
    missing_columns = sorted(REQUIRED_COLUMNS - set(frame.columns))
    missing_values = int(frame.isna().sum().sum())
    duplicate_rows = int(frame.duplicated().sum())
    invalid_values = int(
        ((frame.get("discount_offered", pd.Series(dtype=float)).isin([0, 1]) == False).sum())
        + ((frame.get("purchased", pd.Series(dtype=float)).isin([0, 1]) == False).sum())
    )
    numeric_columns = REQUIRED_COLUMNS - {"customer_id"}
    type_issues = [column for column in numeric_columns if column in frame and not pd.api.types.is_numeric_dtype(frame[column])]
    return ValidationResult(
        schema_check={"status": "pass", "message": "Schema inspected"},
        missing_values={"status": "pass" if missing_values == 0 else "fail", "count": missing_values},
        duplicates={"status": "pass" if duplicate_rows == 0 else "fail", "count": duplicate_rows},
        required_columns={"status": "pass" if not missing_columns else "fail", "message": "All present" if not missing_columns else ", ".join(missing_columns)},
        data_types={"status": "pass" if not type_issues else "fail", "message": "Valid" if not type_issues else ", ".join(type_issues)},
        invalid_values={"status": "pass" if invalid_values == 0 else "fail", "count": invalid_values},
    )
