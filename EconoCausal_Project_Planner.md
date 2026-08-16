# EconoCausal — Project Planner

## Dynamic Pricing via Double Machine Learning

**Source:** Infotact Solutions — Advanced Data Science & ML Engineering (Vol. II), Project 2
**Project Type:** Advanced Data Science & Machine Learning
**Domain:** Economics & Causal AI
**Team Size:** 4 Members
**Duration:** 4 Weeks
**Project Name:** EconoCausal — Dynamic Pricing via Double Machine Learning

---

# 0. Executive Summary

Standard predictive ML models answer *"who is likely to buy or churn?"* — but not *"would this specific customer have bought/stayed **because of** the discount?"*

EconoCausal is a causal machine learning system that answers the second question. It uses **Double Machine Learning (DML)** to estimate the **Individual Treatment Effect (ITE)** of a discount on each customer, validates that estimate with **causal refutation tests**, and then uses **prescriptive optimization** to allocate a fixed marketing budget only to "Persuadables" — the customers whose behavior actually changes because of the offer.

The deliverable is a full-stack system: a Python/EconML/DoWhy causal engine, a SciPy-based budget optimizer, a REST API, and a React + Plotly dashboard that turns causal inference into a boardroom-ready targeting decision.

```text
Prediction → Causal Inference → ITE → Causal Validation → Prescriptive Optimization → Personalized Pricing → Dashboard
```

---

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

## Use Case

A marketing director uses EconoCausal to plan a promotional campaign. Instead of standard predictive ML, the backend uses **Double Machine Learning (DML)** to calculate the **Individual Treatment Effect (ITE)**. The dashboard doesn't just show who is likely to buy — it shows exactly how much a user's purchase probability increases if shown a $10 vs. $20 discount. The director uses this to allocate budget exclusively to **"Persuadables"** (users who only buy because of the discount), maximizing ROI.

---

# 3. Project Objectives

1. Identify treatment, outcome, and confounding variables.
2. Build a causal Directed Acyclic Graph (DAG).
3. Estimate causal effects using Double Machine Learning.
4. Calculate Individual Treatment Effects (ITE) and Average Treatment Effect (ATE).
5. Perform causal refutation tests to validate the model.
6. Analyze propensity scores to simulate a randomized experiment from observational data.
7. Optimize discount allocation under a fixed marketing budget.
8. Calculate expected revenue and ROI.
9. Compare optimized (causal) targeting against random targeting via Qini/Uplift curves.
10. Build an interactive React + Plotly dashboard.
11. Expose the full system through a REST API.
12. Add data validation and basic data-drift detection.
13. Produce a final, integrated, and demonstrable system.

---

# 4. Project Scope

## In Scope

- Mock/public retail campaign dataset
- Data preprocessing (missing values, duplicates, encoding)
- Causal DAG (DoWhy) — confounders, treatment, outcome
- EconML Double/Debiased Machine Learning
- Individual Treatment Effect (ITE) / Average Treatment Effect (ATE)
- Propensity score analysis (logistic regression)
- Causal refutation tests (random common cause, placebo treatment)
- SciPy prescriptive optimization under budget constraint
- Personalized discount allocation
- Revenue / ROI calculations vs. random targeting
- Qini curve / Uplift curve visualization
- React dashboard + Plotly.js charts
- REST API (FastAPI/Flask)
- Input validation
- Basic data-drift detection
- Automated testing (data, model, optimization, API)
- Documentation (README, architecture, methodology)

## Out of Scope

The project should remain focused strictly on the requirements in the project brief. Do **not** introduce:

- Kubernetes
- AWS / cloud infrastructure
- Complex distributed systems
- Large-scale production data pipelines
- Unnecessary deep learning models (this is a classical/causal-ML project, not deep learning)
- Large proprietary or PII-containing datasets

**Goal:** deliver a complete, working, advanced ML prototype — not a production SaaS platform.

---

# 5. Technology Stack

## Machine Learning / Causal AI
- Python 3.10+
- Pandas, NumPy
- Scikit-learn (Random Forest / LightGBM base estimators)
- EconML (Double Machine Learning)
- DoWhy (causal DAG + refutation tests)
- SciPy (`scipy.optimize`) for budget-constrained optimization

## Visualization
- React
- JavaScript / JSX
- Plotly.js
- HTML / CSS

## Backend
- Python
- REST API framework (FastAPI recommended)
- Pydantic (request/response validation)

## Development & Tooling
- Jupyter Notebook / Google Colab
- VS Code
- Git & GitHub
- Pytest

## Documentation
- Markdown
- README.md
- PLANNER.md (this document)

---

# 6. Team Structure

| Member | Role | Main Responsibility |
|---|---|---|
| Member 1 | Causal ML Engineer | Causal DAG, DML training, ITE/ATE, refutation tests |
| Member 2 | Data & Optimization Engineer | Data preparation, propensity scores, SciPy budget optimization, revenue/ROI |
| Member 3 | Frontend Engineer | React + Plotly dashboard, Qini/Uplift visualization, allocation UI |
| Member 4 | Integration & API Engineer | REST API, validation, data-drift detection, testing, end-to-end integration |

---

# 7. GitHub Branch Strategy

```text
main
member1-causal
member2-data
member3-dashboard
member4-integration
```

## Branch Rules

**`main`** — contains only reviewed and integrated code. No member pushes directly to `main`.

**`member1-causal`** — used only by Member 1 (causal DAG, DML, refutation).

**`member2-data`** — used only by Member 2 (data prep, propensity, optimization).

**`member3-dashboard`** — used only by Member 3 (React + Plotly frontend).

**`member4-integration`** — used only by Member 4 (API, validation, drift detection, tests).

---

# 8. Git Workflow

Standard flow for every member, every task:

```bash
git checkout main
git pull origin main

git checkout <own-branch>

# perform work

git status
git add .
git commit -m "Meaningful commit message"
git push origin <own-branch>
```

Example:

```bash
git checkout main
git pull origin main
git checkout member2-data

git add .
git commit -m "Add missing value preprocessing"
git push origin member2-data
```

Then open a Pull Request:

```text
member2-data → main
```

A teammate reviews the PR before merging.

---

# 9. Commit Policy

Each member must complete:

```text
10 commits before Mid-Project Review
+
10 commits after Mid-Project Review
=
20 commits minimum per member
```

Total minimum team commits:

```text
4 members × 20 commits = 80 commits
```

Commits must represent real, meaningful development work.

### Avoid
```text
update
changes
final
final2
fix
test
```

### Prefer
```text
Add treatment variable preprocessing
Implement DML model training
Add Qini curve visualization
Add budget constraint validation
Create API prediction endpoint
```

---

# 10. Project Timeline

```text
WEEK 1
  ↓
WEEK 2
  ↓
10 commits/member
  ↓
MID-PROJECT REVIEW
  ↓
WEEK 3
  ↓
WEEK 4
  ↓
10 additional commits/member
  ↓
FINAL REVIEW
```

---

# 11. PHASE 1 — WEEK 1

## Objective

Complete the initial causal-analysis pipeline and dashboard scaffolding.

Per the project brief, Week 1 covers:
- Causal graphing using DoWhy (define the DAG for a mock retail dataset — confounders, treatment, outcome)
- Dashboard scaffolding: React app initialization, data upload view, budget constraint view

---

## 11.1 Member 1 — Week 1: Causal Graphing

### Tasks
1. Create causal ML notebook.
2. Load the dataset.
3. Explore the dataset (EDA).
4. Identify the treatment variable (e.g., discount offered: yes/no or $10/$20).
5. Identify the outcome variable (e.g., purchase: yes/no).
6. Identify confounding variables (e.g., past purchase frequency, customer tenure, income bracket).
7. Create the DoWhy causal model.
8. Define the causal DAG.
9. Visualize the DAG.
10. Document causal assumptions.

### Deliverable
```text
notebooks/
└── causal_graph.ipynb
```

### Commits (1–5)
```text
1. Create causal ML notebook structure
2. Load and inspect project dataset
3. Add treatment and outcome identification
4. Add confounder feature analysis
5. Create DoWhy causal model
```

---

## 11.2 Member 2 — Week 1: Data Preparation

### Tasks
1. Create preprocessing notebook.
2. Load dataset.
3. Check missing values.
4. Handle missing values.
5. Check duplicate rows.
6. Handle duplicate rows.
7. Check invalid values.
8. Prepare numerical features.
9. Prepare categorical features (encoding).
10. Produce clean dataset.

### Deliverable
```text
data/
├── raw/
└── processed/
    └── cleaned_data.csv
```

### Commits (1–5)
```text
1. Create data preprocessing notebook
2. Load and inspect raw dataset
3. Add missing value analysis
4. Add missing value handling
5. Add duplicate record handling
```

---

## 11.3 Member 3 — Week 1: Dashboard Scaffolding

### Tasks
1. Initialize React app.
2. Configure dependencies (Plotly.js, Axios, routing).
3. Create application layout.
4. Create header.
5. Create navigation.
6. Create data upload interface.
7. Create budget input component.
8. Create dashboard summary cards.
9. Create chart placeholders.
10. Create customer table placeholder.

### Deliverable
```text
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── App.jsx
└── package.json
```

### Commits (1–5)
```text
1. Initialize React dashboard
2. Configure frontend dependencies
3. Create dashboard layout
4. Create navigation and header
5. Create data upload component
```

---

## 11.4 Member 4 — Week 1: Project Infrastructure

### Tasks
1. Create project folder structure.
2. Configure GitHub repository (branches, protections).
3. Create `.gitignore`.
4. Create configuration files (env, requirements.txt, package.json).
5. Create data validation structure/stubs.
6. Create testing structure (pytest scaffolding).
7. Define shared column naming conventions.
8. Define API/data interface contracts (schemas).
9. Test dataset compatibility across modules.
10. Document project setup in README.

### Deliverable
```text
econocausal/
├── data/
├── notebooks/
├── backend/
├── frontend/
├── tests/
├── docs/
├── .gitignore
└── README.md
```

### Commits (1–5)
```text
1. Create project folder structure
2. Add project gitignore configuration
3. Add project configuration
4. Create testing structure
5. Define shared data conventions
```

---

# 12. PHASE 2 — WEEK 2

## Objective

Complete Double Machine Learning training and initial causal visualization.

Per the brief, Week 2 covers: EconML DML training (Random Forest/LightGBM base estimators) to estimate ITE, plus Plotly Qini/Uplift curves proving the causal model outperforms random rollout.

---

## 12.1 Member 1 — Week 2: Double Machine Learning

### Tasks
1. Prepare model features (X).
2. Prepare treatment vector (T).
3. Prepare outcome vector (Y).
4. Configure base estimators (Random Forest / LightGBM).
5. Initialize the EconML DML model.
6. Train the DML model.
7. Generate ITE per customer.
8. Calculate ATE.
9. Analyze ITE distribution.
10. Export model results.

### Deliverable
```text
outputs/
└── ite_scores.csv
```

### Commits (6–10)
```text
6.  Prepare DML model features
7.  Configure DML base estimators
8.  Implement EconML DML training
9.  Generate individual treatment effects
10. Export ITE results and model metrics
```

---

## 12.2 Member 2 — Week 2: Propensity Score Analysis

### Tasks
1. Prepare treatment/control dataset.
2. Train logistic regression for propensity scoring.
3. Generate propensity scores.
4. Analyze score distribution (overlap/common support).
5. Compare treatment vs. control groups.
6. Create propensity score visualization.
7. Validate score range (0–1).
8. Export scores.
9. Document methodology.
10. Hand off results to Member 1 for confounder balance checks.

### Deliverable
```text
outputs/
└── propensity_scores.csv
```

### Commits (6–10)
```text
6.  Prepare treatment control dataset
7.  Add treatment feature preprocessing
8.  Implement propensity score model
9.  Generate and validate propensity scores
10. Export propensity score analysis
```

---

## 12.3 Member 3 — Week 2: Uplift Visualization

### Tasks
1. Integrate Plotly.js.
2. Load ITE results (mock JSON initially).
3. Create ITE distribution chart.
4. Prepare uplift data.
5. Create uplift curve.
6. Create Qini curve.
7. Add chart controls (filters/sorting).
8. Add per-customer treatment-effect visualization.
9. Connect charts to backend data.
10. Test visualization performance with thousands of records.

### Commits (6–10)
```text
6.  Integrate Plotly visualization
7.  Add ITE distribution chart
8.  Prepare uplift curve data
9.  Add uplift and Qini charts
10. Connect Week 2 model results to dashboard
```

---

## 12.4 Member 4 — Week 2: Integration Testing

### Tasks
1. Validate Member 1's output schema.
2. Validate Member 2's output schema.
3. Check CSV schemas.
4. Check column names/consistency.
5. Check data types.
6. Test ITE data loading.
7. Test frontend/backend data compatibility.
8. Create integration tests.
9. Log and track issues.
10. Verify the full Week 1 + Week 2 pipeline runs end to end.

### Commits (6–10)
```text
6.  Add model output validation
7.  Add propensity score validation
8.  Add CSV schema validation
9.  Add frontend data compatibility test
10. Complete Week 1 and Week 2 integration test
```

---

# 13. MID-PROJECT REVIEW CHECKPOINT

At this point every member must have **10 commits** each (40 total), and Week 1 + Week 2 must be complete.

The brief's Mid-Project Review specifically requires:
- A **causal audit**: prove via DoWhy refutation tests that the model has isolated the causal effect from hidden confounders.
- **Data load validation**: prove the dashboard dynamically filters and charts thousands of customer ITE scores.

## Demonstration Flow
```text
Dataset → Causal DAG → DML → ITE → Uplift/Qini → React Dashboard
```

| Member | Demonstrates |
|---|---|
| Member 1 | DAG, DML, ITE, ATE, causal reasoning |
| Member 2 | Data preprocessing, propensity scores, treatment/control balance |
| Member 3 | React dashboard, Plotly Qini/Uplift charts |
| Member 4 | Integration, data validation, end-to-end pipeline test |

---

# 14. PHASE 3 — WEEK 3

## Objective

Move from causal prediction to **prescriptive optimization**.

Per the brief, Week 3 delivers a SciPy optimization script that maximizes predicted revenue under a strict budget constraint, plus a UI ("Allocation Matrix") showing the final prescription — a table of users and their mathematically optimal discount.

---

## 14.1 Member 1 — Week 3: Causal Validation

### Commits (11–15)
```text
11. Add DoWhy causal effect estimation
12. Add random common cause refutation test
13. Add placebo treatment refutation test
14. Add causal robustness comparison
15. Add customer treatment-effect classification (Persuadables / Sure Things / Lost Causes / Sleeping Dogs)
```

---

## 14.2 Member 2 — Week 3: Budget Optimization

### Commits (11–15)
```text
11. Create optimization module
12. Add budget configuration
13. Add discount constraints (e.g., $0/$10/$20 tiers)
14. Implement initial discount allocation logic
15. Implement SciPy budget-constrained optimization
```

---

## 14.3 Member 3 — Week 3: Prescription Dashboard

### Commits (11–15)
```text
11. Create prescription dashboard page
12. Add customer allocation table
13. Display personalized discount amounts
14. Add budget summary cards
15. Add allocation filtering and sorting
```

---

## 14.4 Member 4 — Week 3: Backend Integration

### Commits (11–15)
```text
11. Create backend API structure
12. Add API health endpoint
13. Add model prediction endpoint
14. Add optimization endpoint
15. Connect frontend to backend APIs
```

---

# 15. PHASE 4 — WEEK 4

## Objective

Complete API packaging, data validation/drift detection, dashboard polish, testing, and final integration.

Per the brief, Week 4 covers: wrapping the causal engine in a REST API, building an automated data-drift detector, and polishing the dashboard with natural-language summaries (e.g., *"This strategy saves $4,200 compared to blanket targeting"*).

---

## 15.1 Member 1 — Week 4

### Commits (16–20)
```text
16. Export finalized causal model results
17. Add causal model utility functions
18. Prepare model pipeline for API
19. Optimize causal inference execution
20. Finalize causal model documentation
```

---

## 15.2 Member 2 — Week 4

### Commits (16–20)
```text
16. Add expected revenue calculation
17. Add ROI calculation
18. Add random-targeting comparison
19. Add optimization edge-case handling (zero budget, over-budget, etc.)
20. Finalize budget optimization module
```

---

## 15.3 Member 3 — Week 4

### Commits (16–20)
```text
16. Add revenue visualization
17. Add ROI visualization
18. Improve dashboard responsive layout
19. Add natural language result summary
20. Finalize dashboard UI and styling
```

---

## 15.4 Member 4 — Week 4

### Commits (16–20)
```text
16. Add input validation
17. Add data drift detection
18. Add API integration tests
19. Add end-to-end testing
20. Finalize API and project integration
```

---

# 16. Final Repository Structure

```text
econocausal/
│
├── data/
│   ├── raw/
│   └── processed/
│
├── notebooks/
│   ├── causal_graph.ipynb
│   ├── dml_model.ipynb
│   ├── propensity_score.ipynb
│   └── optimization.ipynb
│
├── backend/
│   ├── app.py
│   ├── routes/
│   ├── services/
│   ├── models/
│   └── utils/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── charts/
│   │   └── services/
│   └── package.json
│
├── outputs/
│   ├── ite_scores.csv
│   ├── propensity_scores.csv
│   └── optimized_allocation.csv
│
├── tests/
│   ├── test_data.py
│   ├── test_model.py
│   ├── test_optimization.py
│   └── test_api.py
│
├── docs/
│   ├── architecture.md
│   ├── methodology.md
│   └── results.md
│
├── README.md
├── PLANNER.md
└── .gitignore
```

---

# 17. Final System Architecture

```text
                  ┌──────────────────┐
                  │ Customer Dataset │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Data Preparation │
                  └────────┬─────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
      ┌──────────────┐         ┌────────────────┐
      │  DoWhy DAG   │         │ Propensity     │
      │              │         │ Score Analysis │
      └──────┬───────┘         └───────┬────────┘
             │                         │
             └────────────┬────────────┘
                          ▼
                ┌────────────────────┐
                │ EconML Double ML   │
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │ ITE / ATE Results  │
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │ Causal Validation  │
                │ DoWhy Refutation   │
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │ SciPy Optimization │
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │ Discount Allocation│
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │      REST API      │
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │ React + Plotly UI  │
                └────────────────────┘
```

---

# 18. Final Dashboard Features

## Overview
- Total customers
- Treatment / control counts
- Average Treatment Effect (ATE)
- Total marketing budget
- Expected revenue

## Causal Analysis
- ITE distribution
- ATE
- Uplift curve
- Qini curve
- Treatment-effect categories (Persuadables, Sure Things, Lost Causes, Sleeping Dogs)

## Optimization
- Budget input
- Optimal discount allocation
- Expected gain
- Expected revenue
- ROI
- Random-targeting comparison

## Customer Analysis
- Customer ID
- Treatment status
- ITE
- Customer category
- Recommended discount
- Expected gain

## System Monitoring
- Input validation status
- Data-drift warning
- API health status

---

# 19. Testing Strategy

## Data Tests
- Missing values
- Duplicate rows
- Invalid values
- Data types
- Required columns present

## ML Tests
- Treatment variable validation
- Outcome variable validation
- ITE output validation (range, no NaNs)
- Propensity score range (0–1)
- Refutation test pass/fail thresholds

## Optimization Tests
- Zero budget
- Very small budget
- Very large budget
- Invalid discount value
- Missing ITE for a customer
- Duplicate customer entries

## API Tests
- Health endpoint
- Valid request
- Invalid request
- Missing data
- Model prediction response
- Optimization response

## Frontend Tests
- Dashboard loading
- File upload
- Chart rendering
- Table rendering
- Filters
- Budget input
- API connection

---

# 20. Risk Management

| Risk | Impact | Mitigation |
|---|---|---|
| Weak/no ground-truth for causal effect (no real A/B test) | Cannot fully validate ITE accuracy | Use refutation tests (placebo, random common cause) as the primary validation; use a semi-synthetic dataset with a known ground-truth treatment effect for sanity checking |
| Confounder misspecification in the DAG | Biased causal estimates | Document assumptions explicitly; run sensitivity/refutation tests; peer-review the DAG before training |
| EconML/DoWhy version or dependency conflicts | Blocked development | Pin versions in `requirements.txt`; use a shared virtual environment early in Week 1 |
| Dashboard performance with large ITE tables | Slow/unresponsive UI | Paginate/virtualize the customer table; test with thousands of mock records by Mid-Project Review |
| Uneven commit pacing across members | Missed commit targets before review | Track commits weekly against the 10/10 checkpoint; flag gaps by mid-Week 2 |
| Optimization infeasible under tight budgets | Optimizer fails or returns nonsensical allocation | Add edge-case handling (zero/negative/over-budget) and constrain discount tiers explicitly |

---

# 21. Evaluation / Definition of Done

- [ ] Dataset prepared and cleaned.
- [ ] Treatment / outcome / confounders identified.
- [ ] DoWhy causal DAG implemented.
- [ ] EconML DML model trained.
- [ ] ITE generated per customer.
- [ ] ATE calculated.
- [ ] Propensity scores generated and validated.
- [ ] DoWhy refutation tests completed and documented.
- [ ] Qini curve implemented.
- [ ] Uplift curve implemented.
- [ ] SciPy optimization implemented under budget constraint.
- [ ] Personalized discounts generated per customer.
- [ ] Revenue and ROI calculated.
- [ ] Random-targeting comparison completed.
- [ ] React dashboard completed.
- [ ] Plotly charts integrated.
- [ ] REST API completed.
- [ ] Data validation completed.
- [ ] Data-drift detection completed.
- [ ] Integration / end-to-end tests completed.
- [ ] Final documentation completed (README, architecture, methodology).
- [ ] Final presentation prepared.
- [ ] Each member has at least 20 meaningful commits.
- [ ] Four individual branches maintained correctly.
- [ ] `main` contains only reviewed and merged work.

---

# 22. Final Git Commit Requirement

## Before Mid-Project Review
```text
Member 1 → 10 commits
Member 2 → 10 commits
Member 3 → 10 commits
Member 4 → 10 commits

Total = 40 commits
```
These commits must contain **only Week 1 and Week 2 work**.

## After Mid-Project Review
```text
Member 1 → +10 commits
Member 2 → +10 commits
Member 3 → +10 commits
Member 4 → +10 commits

Total additional = 40 commits
```
These commits contain **Week 3 and Week 4 work**.

## Final
```text
Member 1 = 20 commits
Member 2 = 20 commits
Member 3 = 20 commits
Member 4 = 20 commits

Total = 80 minimum commits
```

---

# 23. Branch History Target

Each branch should look approximately like:

```text
member1-causal

Commit 1  → Week 1
Commit 2  → Week 1
Commit 3  → Week 1
Commit 4  → Week 1
Commit 5  → Week 1
Commit 6  → Week 2
Commit 7  → Week 2
Commit 8  → Week 2
Commit 9  → Week 2
Commit 10 → Week 2
                │
                ▼
          MID REVIEW
                │
Commit 11 → Week 3
Commit 12 → Week 3
Commit 13 → Week 3
Commit 14 → Week 3
Commit 15 → Week 3
Commit 16 → Week 4
Commit 17 → Week 4
Commit 18 → Week 4
Commit 19 → Week 4
Commit 20 → Week 4
```

The same structure applies to all four members' branches.

---

# 24. Final Team Workflow

```text
                    GITHUB REPOSITORY
                           │
                           ▼
                         main
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
 member1-causal      member2-data       member3-dashboard
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    member4-integration
                           │
                           ▼
                     Pull Requests
                           │
                           ▼
                         main
                           │
                           ▼
                    MID-PROJECT REVIEW
                           │
                           ▼
                       WEEK 3 + 4
                           │
                           ▼
                    FINAL INTEGRATION
                           │
                           ▼
                      FINAL REVIEW
```

---

# 25. Success Criteria

The final EconoCausal system should demonstrate that the team can move from:

```text
Prediction
     ↓
Causal Inference
     ↓
Individual Treatment Effect
     ↓
Causal Validation
     ↓
Prescriptive Optimization
     ↓
Personalized Pricing
     ↓
Interactive Business Dashboard
```

The final project should demonstrate the progression from **causal ML to prescriptive AI**, which is the central goal of the EconoCausal project specification — a masterclass in moving beyond predictive AI into causal and prescriptive AI, delivered as a strategic business-intelligence tool ready for enterprise marketing or finance teams.
