import numpy as np

def estimate_effect(treatment, outcome):
    """Simple causal effect estimator using difference in means."""
    treat = outcome[treatment == 1]
    control = outcome[treatment == 0]
    return np.mean(treat) - np.mean(control)

if __name__ == "__main__":
    # Example usage
    np.random.seed(0)
    treatment = np.random.binomial(1, 0.5, 100)
    outcome = 5 + 2 * treatment + np.random.normal(0, 1, 100)
    effect = estimate_effect(treatment, outcome)
    print(f"Estimated causal effect of treatment: {effect:.2f}")
