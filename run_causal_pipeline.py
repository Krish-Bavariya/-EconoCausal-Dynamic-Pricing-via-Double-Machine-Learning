import pandas as pd
import numpy as np
from backend.services.double_machine_learning.robustness import (
    estimate_dowhy_effect, 
    refute_random_common_cause, 
    refute_placebo_treatment, 
    compare_robustness
)
from backend.services.double_machine_learning.classification import (
    classify_customers, 
    plot_classification_distribution
)
import logging

logging.basicConfig(level=logging.INFO)

def generate_synthetic_data(n=1000):
    np.random.seed(42)
    
    # Confounders
    age = np.random.normal(40, 10, n)
    income = np.random.normal(50000, 15000, n)
    
    # Treatment assignment (prob depends on confounders)
    propensity = 1 / (1 + np.exp(-(-2 + 0.05 * (age - 40) + 0.0001 * (income - 50000))))
    treatment = np.random.binomial(1, propensity)
    
    # True causal effect (ITE varies by age)
    ite = 0.1 + 0.01 * (age - 40) 
    
    # Base outcome probability (depends on confounders)
    base_prob = 1 / (1 + np.exp(-(-1 + 0.02 * (age - 40) + 0.00005 * (income - 50000))))
    
    # Actual outcome
    outcome_prob = np.clip(base_prob + treatment * ite, 0, 1)
    outcome = np.random.binomial(1, outcome_prob)
    
    df = pd.DataFrame({
        'age': age,
        'income': income,
        'treatment': treatment,
        'outcome': outcome,
        'ITE': ite,
        'base_prob': base_prob
    })
    
    return df, np.mean(ite)

def run():
    print("Generating synthetic data...")
    df, true_ate = generate_synthetic_data(n=2000)
    print(f"True Average Treatment Effect (ATE): {true_ate:.4f}")
    
    # 1. DoWhy Robustness Check
    print("\n--- Running DoWhy Estimation ---")
    confounders = ['age', 'income']
    model, estimand, estimate = estimate_dowhy_effect(
        df=df, treatment='treatment', outcome='outcome', confounders=confounders
    )
    print(f"DoWhy Estimated ATE: {estimate.value:.4f}")
    
    print("\n--- Running Refutations ---")
    ref_random = refute_random_common_cause(model, estimand, estimate)
    ref_placebo = refute_placebo_treatment(model, estimand, estimate)
    
    refutations = {
        'random_common_cause': ref_random,
        'placebo_treatment': ref_placebo
    }
    
    # Mocking DML ATE (assuming it is close to True ATE)
    mock_dml_ate = true_ate + 0.005 
    
    report = compare_robustness(mock_dml_ate, estimate, refutations)
    print("\n--- Robustness Report ---")
    print(f"DML ATE: {report['dml_ate']:.4f}")
    print(f"DoWhy ATE: {report['dowhy_ate']:.4f}")
    print(f"Difference: {report['difference_percent']:.2f}%")
    
    for name, res in report['refutations'].items():
        print(f"Refutation ({name}): Passed={res['passed']}, New Effect={res['new_effect']:.4f}, p-value={res['p_value']}")

    # 2. Customer Classification
    print("\n--- Running Customer Classification ---")
    df_classified = classify_customers(
        df=df, 
        ite_col='ITE', 
        base_prediction_col='base_prob', 
        ite_threshold=0.1, 
        base_threshold=0.3
    )
    
    print("Segment Counts:")
    print(df_classified['segment'].value_counts())
    
    print("\nSaving segment distribution plot to 'outputs/segments.png'...")
    plot_classification_distribution(df_classified, output_path='outputs/segments.png')
    print("Pipeline completed successfully!")

if __name__ == "__main__":
    import warnings
    warnings.filterwarnings('ignore')
    run()
