# 1. Project Overview

EconoCausal is a causal machine learning system designed to determine whether offering a discount will actually change a customer's purchasing behavior.

Traditional machine learning can predict whether a customer is likely to buy or churn, but prediction alone does not answer the causal question:

> "Would this customer have purchased **because of** the discount?"

EconoCausal uses causal inference and Double Machine Learning to estimate the **Individual Treatment Effect (ITE)** for each customer, then uses these causal predictions to recommend personalized discounts under a fixed marketing budget.

## End-to-End Pipeline

```text
Customer / Campaign Data
        │
        ▼
Data Preparation
        │
        ▼
Causal Graph / DAG (DoWhy)
        │
        ▼
Double Machine Learning (EconML)
        │
        ▼
Individual Treatment Effect (ITE)
        │
        ▼
Causal Refutation Tests
        │
        ▼
Optimization Engine (SciPy)
        │
        ▼
Optimal Discount Allocation
        │
        ▼
REST API
        │
        ▼
React + Plotly Dashboard
```

The project specification identifies the core technical modules as: **Causal Inference Engine** (EconML, DoWhy), **Propensity Score Matching**, **Optimization Solver** (SciPy), and **Experimentation UI** (React, Plotly).

---

# 2. Problem Statement (from Project Brief)

Standard ML models predict correlation, not causation. A churn model might trigger a $20 discount for a user with a 90% churn probability — but that user may have stayed anyway, wasting the $20. Traditional ML cannot answer:

> "Would this specific user have stayed **IF AND ONLY IF** we gave them the discount?"
