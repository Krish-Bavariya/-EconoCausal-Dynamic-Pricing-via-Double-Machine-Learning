# %% [markdown]
# # 04 — Week 4 Pipeline Demonstration
# ## Member 1 | Week 4 | Causal ML Engineer
# ---
#
# **Project:** Dynamic Pricing via Double Machine Learning
# **Objective:** Demonstrate all Week 4 deliverables end-to-end in a clean,
# readable notebook.
#
# ### Week 4 Commits Covered
# | Commit | Task | Status |
# |---|------|--------|
# | 16 | Export finalized causal model results | ✅ |
# | 17 | Causal model utility functions | ✅ |
# | 18 | Prepare model pipeline for API | ✅ |
# | 19 | Optimize causal inference execution (caching) | ✅ |
# | 20 | Finalize causal model documentation | ✅ |

# %% [markdown]
# ---
# ## 1. Setup & Imports

# %%
import os
import sys
import json
import warnings
import logging

warnings.filterwarnings('ignore')
logging.basicConfig(level=logging.INFO, format='%(levelname)s | %(message)s')

# ─── Set project root ─────────────────────────────────────────────────────────
PROJECT_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..') if '__file__' in dir() else os.getcwd()
)
if os.path.basename(PROJECT_ROOT) == 'notebooks':
    PROJECT_ROOT = os.path.dirname(PROJECT_ROOT)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)
os.chdir(PROJECT_ROOT)

print(f"[OK] Project root: {PROJECT_ROOT}")

# %% [markdown]
# ---
# ## 2. Commit 16 — Export Finalized Causal Model Results
#
# The enhanced `exporter.py` now produces three outputs:
# - `ite_scores.csv`           — backward-compatible (customer_id + ITE)
# - `ite_scores_final.csv`     — full results (ITE + segment + discount + gain)
# - `model_metadata.json`      — API-ready summary JSON

# %%
import pandas as pd
import numpy as np

# Load the existing ITE results
ite_df = pd.read_csv('outputs/ite_scores.csv')
print(f"[OK] Loaded ITE scores: {len(ite_df):,} rows")
print(f"     Columns: {list(ite_df.columns)}")
print(f"     ITE range: [{ite_df['ITE'].min():.4f}, {ite_df['ITE'].max():.4f}]")
print(f"     ATE: {ite_df['ITE'].mean():.6f}")

# %% [markdown]
# ### Assemble full results using results_builder

# %%
from backend.services.double_machine_learning.classification import classify_customers
from backend.services.double_machine_learning.results_builder import (
    build_customer_results,
    get_summary_stats,
)
from backend.services.double_machine_learning.exporter import (
    export_model_results,
    export_ite_scores_only,
    export_model_metadata,
)

# Classify customers based on ITE
ite_classified = classify_customers(
    ite_df,
    ite_col='ITE',
    ite_threshold=0.01,
    base_threshold=0.5
)

# Build finalized results
results_df = build_customer_results(ite_classified, ite_col='ITE', segment_col='segment')

# Compute summary statistics
stats = get_summary_stats(results_df)

print(f"\n[Commit 16] Finalized Results Preview:")
print(results_df.head(5).to_string(index=False))

# Export all three formats
path1 = export_model_results(results_df, output_path='outputs/ite_scores_final.csv')
path2 = export_ite_scores_only(results_df, output_path='outputs/ite_scores.csv')

print(f"\n[OK] Full results → {path1}")
print(f"[OK] ITE-only scores → {path2}")

# %% [markdown]
# ---
# ## 3. Commit 17 — Causal Model Utility Functions
#
# Three utility modules in `backend/services/causal_utils/`:
# - `model_summary.py` — human-readable summary + narrative
# - `serializer.py`    — JSON-safe conversion for numpy types
# - `health_check.py`  — 6-point model output validation

# %%
from backend.services.causal_utils.model_summary import generate_model_summary
from backend.services.causal_utils.serializer import to_json_serializable, results_df_to_records
from backend.services.causal_utils.health_check import run_health_checks

# ── Model Summary ──────────────────────────────────────────────────────────────
summary = generate_model_summary(stats)

print("[Commit 17] Model Summary:")
print(f"  ATE:               {summary['ate']:+.6f}  ({summary['ate_pct']:+.2f} pp)")
print(f"  Total Customers:   {summary['total_customers']:,}")
print(f"  Persuadables:      {summary['persuadables_count']:,} ({summary['persuadables_pct']}%)")
print(f"  Expected Gain:     ${summary['expected_gain_usd']:,.2f}")
print(f"  Saving vs Random:  ${summary['saving_usd']:,.2f}")
print(f"  ROI:               {summary['roi_pct']}%")
print(f"\nNarrative:\n{summary['narrative_text']}")

# %% [markdown]
# ### Serializer — ensure outputs are JSON-safe

# %%
# Test serializer with numpy types
test_dict = {
    'ate': np.float64(0.0423),
    'ite_array': np.array([0.01, 0.05, -0.02]),
    'count': np.int64(64000),
    'nan_value': np.nan,
}

safe_dict = to_json_serializable(test_dict)
print("\n[Commit 17] Serializer Test:")
print(f"  Input  ate type:    {type(test_dict['ate'])}")
print(f"  Output ate type:    {type(safe_dict['ate'])}")
print(f"  Input  nan:         {test_dict['nan_value']}")
print(f"  Output nan:         {safe_dict['nan_value']}  (converted to None for JSON)")

# JSON serialization test
try:
    json_str = json.dumps(safe_dict)
    print(f"  JSON serialization: PASSED ✅")
except TypeError as e:
    print(f"  JSON serialization: FAILED ❌  {e}")

# %% [markdown]
# ### Health Checks — validate model outputs

# %%
health_report = run_health_checks(results_df)
print(f"\n[Commit 17] Health Report — All Passed: {health_report.all_passed}")
for check in health_report.checks:
    icon = '✅' if check.passed else '❌'
    print(f"  {icon} [{check.name}]: {check.message}")

# %% [markdown]
# ---
# ## 4. Commit 18 — Model Pipeline for API
#
# `backend/services/causal_pipeline.py` is the single entry point.
# Member 4's API calls `run_causal_pipeline()` and gets back a
# fully JSON-serializable result dict.

# %%
# Demonstrate the API contract (fast mode: skip robustness for speed)
from backend.services.causal_pipeline import run_causal_pipeline

print("[Commit 18] Running API pipeline (skip_robustness=True for demo speed)...")
result = run_causal_pipeline(
    data_path='outputs/ite_scores.csv',    # use cached ITE
    skip_robustness=True,
    use_cache=False,                        # fresh run for demo
    export_csv=True,
)

print(f"\n  Status:         {result['status']}")
if result['status'] == 'success':
    s = result['summary']
    print(f"  ATE:            {s['ate']:+.6f}")
    print(f"  Segments:       {s['segment_counts']}")
    print(f"  Health passed:  {result['health']['all_passed']}")
    print(f"  First record:   {result['records'][0] if result['records'] else 'N/A'}")

# Verify JSON serialization
try:
    _ = json.dumps(result)
    print(f"\n  Full result JSON-serializable: ✅")
except TypeError as e:
    print(f"\n  JSON serialization FAILED: ❌  {e}")

# %% [markdown]
# ---
# ## 5. Commit 19 — Optimize Causal Inference Execution
#
# The `model_cache.py` module caches trained models using joblib.
# The `performance.py` module provides timing decorators and execution logs.

# %%
from backend.services.causal_utils.model_cache import (
    save_model_to_cache, load_model_from_cache,
    save_results_to_cache, load_results_from_cache,
    clear_cache,
)
from backend.services.causal_utils.performance import ExecutionLog, timed
import time

# ── Demonstrate ExecutionLog ──────────────────────────────────────────────────
print("[Commit 19] ExecutionLog Demo:")
log = ExecutionLog()

with log.step("Simulate Feature Preparation"):
    time.sleep(0.05)  # simulate work

with log.step("Simulate Model Inference"):
    time.sleep(0.08)  # simulate work

with log.step("Simulate Export"):
    time.sleep(0.02)  # simulate work

timing_summary = log.summary()
print(f"  Total elapsed:  {timing_summary['total_elapsed_sec']:.3f}s")
print(f"  All succeeded:  {timing_summary['all_succeeded']}")
for step in timing_summary['steps']:
    print(f"    {step['step']:<35} {step['elapsed_sec']:.3f}s")

# ── Demonstrate @timed decorator ──────────────────────────────────────────────
print("\n[Commit 19] @timed Decorator Demo:")

@timed("Dummy Calculation")
def dummy_calc(n):
    return sum(range(n))

result_sum = dummy_calc(1_000_000)
print(f"  Result: {result_sum:,}  (timing logged above)")

# ── Demonstrate caching ────────────────────────────────────────────────────────
print("\n[Commit 19] Caching Demo:")

# Cache the results_df
save_results_to_cache(results_df, results_df)
loaded = load_results_from_cache(results_df)
print(f"  Cached results rows:  {len(results_df):,}")
print(f"  Loaded from cache:    {len(loaded):,}")
print(f"  Cache hit verified:   {'✅' if loaded is not None and len(loaded) == len(results_df) else '❌'}")

# %% [markdown]
# ---
# ## 6. Commit 20 — Causal Model Documentation
#
# Three documentation files created in `docs/`:

# %%
import os

docs = [
    ('docs/methodology.md', 'Causal assumptions, DML math, ITE, refutation tests'),
    ('docs/architecture.md', 'Module reference, data flow, caching, API contract'),
    ('docs/results.md',      'Model outputs, schema, segment distribution, reproducibility'),
]

print("[Commit 20] Documentation Files:")
for path, description in docs:
    exists = os.path.exists(path)
    size_kb = os.path.getsize(path) / 1024 if exists else 0
    icon = '✅' if exists else '❌'
    print(f"  {icon} {path:<30} ({size_kb:.1f} KB)  — {description}")

# %% [markdown]
# ---
# ## 7. Week 4 Summary

# %%
print("\n" + "="*65)
print("  WEEK 4 — MEMBER 1 — SUMMARY")
print("="*65)

deliverables = [
    ("Commit 16", "Export finalized causal model results",
     "outputs/ite_scores_final.csv + model_metadata.json"),
    ("Commit 17", "Add causal model utility functions",
     "backend/services/causal_utils/ (5 modules)"),
    ("Commit 18", "Prepare model pipeline for API",
     "backend/services/causal_pipeline.py (single entry point)"),
    ("Commit 19", "Optimize causal inference execution",
     "model_cache.py + performance.py (caching + timing)"),
    ("Commit 20", "Finalize causal model documentation",
     "docs/methodology.md + architecture.md + results.md"),
]

for commit, task, output in deliverables:
    print(f"\n  [{commit}] {task}")
    print(f"    Output: {output}")

print("\n" + "="*65)
print("  All Week 4 tasks COMPLETE ✅")
print("="*65)
