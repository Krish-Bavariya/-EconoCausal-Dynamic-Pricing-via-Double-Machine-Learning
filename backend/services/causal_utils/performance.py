"""
performance.py
--------------
Timing decorator and structured execution logger for the causal pipeline.

Usage:
    from backend.services.causal_utils.performance import timed, ExecutionLog

    @timed("DML Training")
    def train_model(...):
        ...

    # Or use ExecutionLog for manual tracking:
    log = ExecutionLog()
    with log.step("Feature Preparation"):
        X, T, Y = prepare_model_features(df)
    print(log.summary())
"""

import time
import logging
import functools
from contextlib import contextmanager
from dataclasses import dataclass, field
from typing import Callable

logger = logging.getLogger(__name__)


# ── Step result ───────────────────────────────────────────────────────────────

@dataclass
class StepResult:
    """Records timing for a single pipeline step."""
    name: str
    elapsed_sec: float
    success: bool
    error: str | None = None

    def to_dict(self) -> dict:
        return {
            "step": self.name,
            "elapsed_sec": round(self.elapsed_sec, 4),
            "success": self.success,
            "error": self.error,
        }


# ── Decorator ─────────────────────────────────────────────────────────────────

def timed(step_name: str | None = None):
    """
    Decorator that logs execution time for a function.

    Args:
        step_name : Human-readable step label (defaults to function name).

    Example:
        @timed("DML Model Training")
        def train():
            ...
    """
    def decorator(func: Callable) -> Callable:
        label = step_name or func.__name__

        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            start = time.perf_counter()
            try:
                result = func(*args, **kwargs)
                elapsed = time.perf_counter() - start
                logger.info(f"[PERF] {label} completed in {elapsed:.3f}s")
                return result
            except Exception as e:
                elapsed = time.perf_counter() - start
                logger.error(f"[PERF] {label} FAILED after {elapsed:.3f}s: {e}")
                raise

        return wrapper
    return decorator


# ── Execution log ─────────────────────────────────────────────────────────────

class ExecutionLog:
    """
    Context-manager based execution logger for pipeline steps.

    Tracks time and success/failure for each named step, then
    provides a structured summary dict for the API response.

    Example:
        log = ExecutionLog()

        with log.step("Load Data"):
            df = pd.read_csv(...)

        with log.step("Train DML"):
            model = train_dml_model(...)

        print(log.summary())
    """

    def __init__(self):
        self._steps: list[StepResult] = []
        self._pipeline_start: float = time.perf_counter()

    @contextmanager
    def step(self, name: str):
        """Context manager that records a named pipeline step."""
        start = time.perf_counter()
        success = True
        error_msg = None
        try:
            yield
        except Exception as e:
            success = False
            error_msg = str(e)
            logger.error(f"[PERF] Step '{name}' FAILED: {e}")
            raise
        finally:
            elapsed = time.perf_counter() - start
            self._steps.append(StepResult(name, elapsed, success, error_msg))
            if success:
                logger.info(f"[PERF] Step '{name}' done in {elapsed:.3f}s")

    def summary(self) -> dict:
        """Returns a structured summary of all recorded steps."""
        total_elapsed = time.perf_counter() - self._pipeline_start
        return {
            "total_elapsed_sec": round(total_elapsed, 4),
            "steps": [s.to_dict() for s in self._steps],
            "all_succeeded": all(s.success for s in self._steps),
            "failed_steps": [s.name for s in self._steps if not s.success],
        }

    def reset(self):
        """Clears recorded steps (for re-use in tests)."""
        self._steps = []
        self._pipeline_start = time.perf_counter()
