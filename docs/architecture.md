# System Architecture

**Project:** EconoCausal — Dynamic Pricing via Double Machine Learning  
**Member:** 1 — Causal ML Engineer

---

## 1. High-Level Architecture

```
Customer Dataset (CSV)
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│                    causal_pipeline.py                         │
│              (Single API Entry Point)                         │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │  features.py │  │ estimators.py│  │   training.py    │    │
│  │  (X, T, Y)   │  │  (LightGBM) │  │  (LinearDML)     │    │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘    │
│         └─────────────────┴──────────────────▼              │
│                                        evaluation.py         │
│                                        (ITE / ATE)           │
│                                               │               │
│                                        classification.py      │
│                                        (Segments)             │
│                                               │               │
│                                        robustness.py         │
│                                        (DoWhy refutation)     │
│                                               │               │
│                                        results_builder.py     │
│                                        (Full result DF)       │
└───────────────────────────────────────────────┬───────────────┘
                                                 │
                    ┌────────────────────────────┤
                    ▼                            ▼
             causal_utils/                  exporter.py
        ┌──────────────────────┐     (CSV + JSON outputs)
        │  model_summary.py    │
        │  serializer.py       │
        │  health_check.py     │
        │  model_cache.py      │
        │  performance.py      │
        └──────────────────────┘
                    │
                    ▼
            REST API (Member 4)
            React Dashboard (Member 3)
```

---

## 2. Module Reference

### `backend/services/double_machine_learning/`

| Module | Responsibility |
|---|---|
| `features.py` | Extracts X (confounders), T (treatment), Y (outcome) from raw DataFrame |
| `estimators.py` | Configures LGBMRegressor (outcome) and LGBMClassifier (treatment) |
| `training.py` | Initializes and fits EconML `LinearDML` with cross-fitting |
| `evaluation.py` | Computes ITE per customer and ATE; plots ITE distribution |
| `classification.py` | Assigns customers to Persuadables / Sure Things / Lost Causes / Sleeping Dogs |
| `robustness.py` | DoWhy causal model, effect estimation, refutation tests, robustness comparison |
| `results_builder.py` | Assembles full results DataFrame with discount recommendations and expected gain |
| `exporter.py` | Exports CSV (full + ITE-only) and JSON metadata |

### `backend/services/causal_utils/`

| Module | Responsibility |
|---|---|
| `model_summary.py` | Generates structured summary dict + plain-text narrative for dashboard |
| `serializer.py` | Converts numpy/pandas types to JSON-safe Python primitives |
| `health_check.py` | 6-point validation of model outputs before serving via API |
| `model_cache.py` | Joblib-based file cache keyed by data fingerprint; invalidates on data change |
| `performance.py` | `@timed` decorator + `ExecutionLog` context manager for step-by-step timing |

### `backend/services/causal_pipeline.py`

The **single entry point** for the REST API. Orchestrates all sub-modules and returns a fully JSON-serializable result dict. Supports:
- Caching (skip re-training if data hasn't changed)
- Skipping robustness tests (for fast dev/test runs)
- CSV + JSON metadata export

---

## 3. Data Flow

```
retail_campaign.csv
      │
      ├── features.py ──────────────→ X (confounders)
      │                               T (treatment)
      │                               Y (outcome)
      │
      ├── training.py ──────────────→ LinearDML model
      │                                     │
      ├── evaluation.py ◄──────────────────┘
      │       │ ITE per customer
      │       │ ATE (mean ITE)
      │
      ├── classification.py ◄────────── ITE
      │       │ segment per customer
      │
      ├── robustness.py ◄────────────── df + confounders
      │       │ refutation test results
      │
      ├── results_builder.py ◄────────── ITE + segment
      │       │ customer_id | ITE | segment | discount | gain
      │
      ├── exporter.py ─────────────────→ ite_scores_final.csv
      │                                   model_metadata.json
      │
      └── causal_utils/ ───────────────→ health_report
                                          summary_dict
                                          timing_dict
                                                │
                                       API Response JSON
```

---

## 4. Caching Strategy

```
First call (cold):
  Load data → Fingerprint → Check cache → MISS
  → Train model → Save to cache → Run pipeline → Cache results

Second call (warm):
  Load data → Fingerprint → Check cache → HIT
  → Load results from cache → Skip training → Return immediately
  (Typically 10–50× faster)

Cache invalidation:
  Cache key = SHA-256(first 1000 rows of data)
  If data changes → new fingerprint → automatic cache miss → retrain
```

Cache directory: `outputs/model_cache/`

---

## 5. API Contract

The `run_causal_pipeline()` function returns:

```json
{
  "status": "success",
  "summary": {
    "ate": 0.0423,
    "ate_pct": 4.23,
    "total_customers": 64000,
    "segment_counts": {
      "Persuadables": 18340,
      "Sure Things": 22100,
      "Lost Causes": 15200,
      "Sleeping Dogs": 8360
    },
    "persuadables_count": 18340,
    "persuadables_pct": 28.66,
    "expected_gain_usd": 112400.0,
    "random_baseline_usd": 67200.0,
    "saving_usd": 45200.0,
    "roi_pct": 147.3,
    "robustness_passed": true,
    "narrative_text": "The causal model identified an ATE of +0.0423..."
  },
  "health": {
    "all_passed": true,
    "checks": [...],
    "failed_count": 0
  },
  "performance": {
    "total_elapsed_sec": 12.34,
    "steps": [...],
    "all_succeeded": true,
    "failed_steps": []
  },
  "records": [...],
  "output_path": "outputs/ite_scores_final.csv"
}
```

---

## 6. Dependencies

| Library | Version | Purpose |
|---|---|---|
| `econml` | ≥ 0.15 | Double Machine Learning |
| `dowhy` | ≥ 0.11 | Causal DAG + refutation tests |
| `lightgbm` | ≥ 4.0 | DML base estimators |
| `scikit-learn` | ≥ 1.3 | Cross-validation, logistic regression |
| `pandas` | ≥ 2.0 | Data manipulation |
| `numpy` | ≥ 1.24 | Numerical computation |
| `matplotlib` / `seaborn` | ≥ 3.7 / 0.12 | Visualization |
| `networkx` | ≥ 3.1 | DAG graph visualization |
| `joblib` | bundled with sklearn | Model caching |
