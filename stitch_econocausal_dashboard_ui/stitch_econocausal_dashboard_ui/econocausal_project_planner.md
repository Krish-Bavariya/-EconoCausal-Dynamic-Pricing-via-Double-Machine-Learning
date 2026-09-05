# EconoCausal — Project Planner

## Dynamic Pricing via Double Machine Learning

**Project Type:** Advanced Data Science & Machine Learning  
**Domain:** Economics & Causal AI  
**Team Size:** 4 Members  
**Duration:** 4 Weeks  
**Project:** EconoCausal — Dynamic Pricing via Double Machine Learning

---

# 1. Project Overview

EconoCausal is a causal machine learning system designed to determine whether offering a discount will actually change a customer's purchasing behavior.

Traditional machine learning can predict whether a customer is likely to buy or churn, but prediction alone does not answer the causal question:

> "Would this customer have purchased because of the discount?"

EconoCausal uses causal inference and Double Machine Learning to estimate the Individual Treatment Effect (ITE) for each customer.

The system then uses these causal predictions to recommend personalized discounts under a fixed marketing budget.

The final system consists of:

```text
Customer / Campaign Data
        │
        ▼
Data Preparation
        │
        ▼
Causal Graph / DAG
        │
        ▼
Double Machine Learning
        │
        ▼
Individual Treatment Effect (ITE)
        │
        ▼
Causal Refutation Tests
        │
        ▼
Optimization Engine
        │
        ▼
Optimal Discount Allocation
        │
        ▼
API
        │
        ▼
React + Plotly Dashboard
```

The project specification identifies the main technical modules as EconML/DoWhy causal inference, propensity-score analysis, SciPy optimization, and React/Plotly visualization. 

---

# 2. Project Objectives

The project aims to:

1. Identify treatment, outcome, and confounding variables.
2. Build a causal Directed Acyclic Graph (DAG).
3. Estimate causal effects using Double Machine Learning.
4. Calculate Individual Treatment Effects (ITE).
5. Perform causal refutation tests.
6. Analyze propensity scores.
7. Optimize discount allocation under a fixed budget.
8. Calculate expected revenue and ROI.
9. Compare optimized targeting with random targeting.
10. Build an interactive React + Plotly dashboard.
11. Expose the system through a REST API.
12. Add basic data validation and data-drift detection.
13. Produce a final integrated and demonstrable system.

---

# 3. Project Scope

## Included

- Mock/public retail campaign dataset
- Data preprocessing
- Causal DAG
- DoWhy
- EconML Double Machine Learning
- Individual Treatment Effect (ITE)
- Average Treatment Effect (ATE)
- Propensity score analysis
- Causal refutation tests
- SciPy optimization
- Personalized discount allocation
- Revenue/ROI calculations
- Qini/Uplift visualization
- React dashboard
- Plotly charts
- REST API
- Input validation
- Basic data drift detection
- Testing
- Documentation

## Not Required

The project should remain focused on the requirements in the project document.

Do not unnecessarily introduce:

- Kubernetes
- AWS infrastructure
- Complex cloud architecture
- Large-scale production pipelines
- Complex distributed systems
- Unnecessary deep learning models
- Large proprietary datasets

The goal is to deliver a complete, working advanced ML prototype.

---

# 4. Technology Stack

## Machine Learning / Causal AI

- Python
- Pandas
- NumPy
- Scikit-learn
- EconML
- DoWhy
- SciPy

## Visualization

- React
- JavaScript
- Plotly.js
- HTML
- CSS

## Backend

- Python
- REST API framework

## Development

- Jupyter Notebook / Google Colab
- VS Code
- Git
- GitHub

## Documentation

- Markdown
- README.md
- Planner.md

---

# 5. Team Structure

The project uses four members.

| Member | Role | Main Responsibility |
|---|---|---|
| Member 1 | Causal ML Engineer | Causal model, DML, ITE, refutation |
| Member 2 | Data & Optimization Engineer | Data preparation, propensity, budget optimization |
| Member 3 | Frontend Engineer | React + Plotly dashboard |
| Member 4 | Integration & API Engineer | API, integration, validation, testing, drift |

---

# 6. GitHub Branch Strategy

The repository must contain:

```text
main
member1-causal
member2-data
member3-dashboard
member4-integration
```

## Branch Rules

### `main`

Contains only reviewed and integrated code.

No member should directly push to `main`.

### `member1-causal`

Used only by Member 1.

### `member2-data`

Used only by Member 2.

### `member3-dashboard`

Used only by Member 3.

### `member4-integration`

Used only by Member 4.

---

# 7. Git Workflow

Every member follows:

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

Then create a Pull Request:

```text
member2-data → main
```

A teammate should review the PR before merging.

---

# 8. Commit Policy

Each member must complete:

```text
10 commits before Mid-Project Review
+
10 commits after Mid-Project Review
=
20 commits minimum
```

Total minimum team commits:

```text
4 × 20 = 80 commits
```

Commits must represent real development work.

## Avoid

```text
update
changes
final
final2
fix
test
```

## Prefer

```text
Add treatment variable preprocessing
Implement DML model training
Add Qini curve visualization
Add budget constraint validation
Create API prediction endpoint
```

---

# 9. Project Timeline

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

# 10. PHASE 1 — WEEK 1

## Objective

Complete the initial causal-analysis pipeline and dashboard scaffolding.

The project document defines Week 1 as:

- Causal graphing using DoWhy
- Identifying confounders, treatment, and outcome
- React dashboard initialization
- Data upload view
- Budget constraint view

---

# 11. Member 1 — Week 1

## Causal Graphing

### Tasks

1. Create causal ML notebook.
2. Load the dataset.
3. Explore the dataset.
4. Identify treatment variable.
5. Identify outcome variable.
6. Identify confounding variables.
7. Create DoWhy causal model.
8. Define causal DAG.
9. Visualize the DAG.
10. Document causal assumptions.

### Deliverable

```text
notebooks/
└── causal_graph.ipynb
```

### Commit 1

```text
Create causal ML notebook structure
```

### Commit 2

```text
Load and inspect project dataset
```

### Commit 3

```text
Add treatment and outcome identification
```

### Commit 4

```text
Add confounder feature analysis
```

### Commit 5

```text
Create DoWhy causal model
```

---

# 12. Member 2 — Week 1

## Data Preparation

### Tasks

1. Create preprocessing notebook.
2. Load dataset.
3. Check missing values.
4. Handle missing values.
5. Check duplicate rows.
6. Handle duplicate rows.
7. Check invalid values.
8. Prepare numerical features.
9. Prepare categorical features.
10. Produce clean dataset.

### Deliverable

```text
data/
├── raw/
└── processed/
    └── cleaned_data.csv
```

### Commit 1

```text
Create data preprocessing notebook
```

### Commit 2

```text
Load and inspect raw dataset
```

### Commit 3

```text
Add missing value analysis
```

### Commit 4

```text
Add missing value handling
```

### Commit 5

```text
Add duplicate record handling
```

---

# 13. Member 3 — Week 1

## Dashboard Scaffolding

### Tasks

1. Initialize React.
2. Configure dependencies.
3. Create application layout.
4. Create header.
5. Create navigation.
6. Create data upload interface.
7. Create budget input.
8. Create dashboard cards.
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

### Commit 1

```text
Initialize React dashboard
```

### Commit 2

```text
Configure frontend dependencies
```

### Commit 3

```text
Create dashboard layout
```

### Commit 4

```text
Create navigation and header
```

### Commit 5

```text
Create data upload component
```

---

# 14. Member 4 — Week 1

## Project Infrastructure

### Tasks

1. Create project folders.
2. Configure GitHub repository.
3. Create `.gitignore`.
4. Create configuration files.
5. Create data validation structure.
6. Create testing structure.
7. Define shared column naming.
8. Define API/data interfaces.
9. Test dataset compatibility.
10. Document project setup.

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

### Commit 1

```text
Create project folder structure
```

### Commit 2

```text
Add project gitignore configuration
```

### Commit 3

```text
Add project configuration
```

### Commit 4

```text
Create testing structure
```

### Commit 5

```text
Define shared data conventions
```

---

# 15. PHASE 2 — WEEK 2

## Objective

Complete Double Machine Learning and initial causal visualization.

The project document specifies:

- EconML Double Machine Learning
- Random Forest/LightGBM base estimators
- Individual Treatment Effect
- Qini curves
- Uplift charts

---

# 16. Member 1 — Week 2

## Double Machine Learning

### Tasks

1. Prepare model features.
2. Prepare treatment vector.
3. Prepare outcome vector.
4. Configure base estimators.
5. Initialize DML model.
6. Train DML model.
7. Generate ITE.
8. Calculate ATE.
9. Analyze ITE distribution.
10. Export model results.

### Commit 6

```text
Prepare DML model features
```

### Commit 7

```text
Configure DML base estimators
```

### Commit 8

```text
Implement EconML DML training
```

### Commit 9

```text
Generate individual treatment effects
```

### Commit 10

```text
Export ITE results and model metrics
```

### Deliverable

```text
outputs/
└── ite_scores.csv
```

---

# 17. Member 2 — Week 2

## Propensity Score Analysis

### Tasks

1. Prepare treatment/control dataset.
2. Train logistic regression.
3. Generate propensity scores.
4. Analyze score distribution.
5. Compare treatment/control groups.
6. Create propensity score visualization.
7. Validate score range.
8. Export scores.
9. Document methodology.
10. Provide results to Member 1.

### Commit 6

```text
Prepare treatment control dataset
```

### Commit 7

```text
Add treatment feature preprocessing
```

### Commit 8

```text
Implement propensity score model
```

### Commit 9

```text
Generate and validate propensity scores
```

### Commit 10

```text
Export propensity score analysis
```

### Deliverable

```text
outputs/
└── propensity_scores.csv
```

---

# 18. Member 3 — Week 2

## Uplift Visualization

### Tasks

1. Integrate Plotly.
2. Load ITE results.
3. Create ITE distribution chart.
4. Create uplift data preparation.
5. Create uplift curve.
6. Create Qini curve.
7. Add chart controls.
8. Add customer treatment-effect visualization.
9. Connect charts to data.
10. Test visualization with thousands of records.

### Commit 6

```text
Integrate Plotly visualization
```

### Commit 7

```text
Add ITE distribution chart
```

### Commit 8

```text
Prepare uplift curve data
```

### Commit 9

```text
Add uplift and Qini charts
```

### Commit 10

```text
Connect Week 2 model results to dashboard
```

---

# 19. Member 4 — Week 2

## Integration Testing

### Tasks

1. Validate Member 1 output.
2. Validate Member 2 output.
3. Check CSV schemas.
4. Check column names.
5. Check data types.
6. Test ITE data loading.
7. Test frontend data compatibility.
8. Create integration test.
9. Record issues.
10. Verify Week 1 + Week 2 pipeline.

### Commit 6

```text
Add model output validation
```

### Commit 7

```text
Add propensity score validation
```

### Commit 8

```text
Add CSV schema validation
```

### Commit 9

```text
Add frontend data compatibility test
```

### Commit 10

```text
Complete Week 1 and Week 2 integration test
```

---

# 20. MID-PROJECT REVIEW CHECKPOINT

At this point every member must have:

```text
Member 1 → 10 commits
Member 2 → 10 commits
Member 3 → 10 commits
Member 4 → 10 commits
```

Total:

```text
40 commits
```

## Week 1 + Week 2 must be complete.

The project should demonstrate:

### Causal side

- Dataset
- Treatment
- Outcome
- Confounders
- DAG
- DML
- ITE
- ATE
- Propensity analysis

### Dashboard side

- React application
- Upload interface
- Budget input
- ITE visualization
- Uplift curve
- Qini curve

The PDF's Mid-Project Review specifically requires a causal audit using DoWhy refutation tests and validation that the dashboard can dynamically filter/chart thousands of customer ITE scores.

---

# 21. Mid-Project Review Demonstration

The team should demonstrate:

```text
Dataset
   ↓
Causal DAG
   ↓
DML
   ↓
ITE
   ↓
Uplift/Qini
   ↓
React Dashboard
```

## Member 1 demonstrates

- DAG
- DML
- ITE
- ATE
- Causal reasoning

## Member 2 demonstrates

- Data preprocessing
- Propensity scores
- Treatment/control analysis

## Member 3 demonstrates

- React dashboard
- Plotly
- Qini/Uplift charts

## Member 4 demonstrates

- Integration
- Data validation
- End-to-end testing

---

# 22. PHASE 3 — WEEK 3

## Objective

Move from causal prediction to prescriptive optimization.

The project document specifies Week 3 as a SciPy optimization system that maximizes predicted revenue under a strict budget and a UI showing the optimal discount allocation.

---

# 23. Member 1 — Week 3

## Causal Validation

### Commit 11

```text
Add DoWhy causal effect estimation
```

### Commit 12

```text
Add random common cause refutation test
```

### Commit 13

```text
Add placebo treatment refutation test
```

### Commit 14

```text
Add causal robustness comparison
```

### Commit 15

```text
Add customer treatment effect classification
```

---

# 24. Member 2 — Week 3

## Budget Optimization

### Commit 11

```text
Create optimization module
```

### Commit 12

```text
Add budget configuration
```

### Commit 13

```text
Add discount constraints
```

### Commit 14

```text
Implement initial discount allocation
```

### Commit 15

```text
Implement SciPy budget optimization
```

---

# 25. Member 3 — Week 3

## Prescription Dashboard

### Commit 11

```text
Create prescription dashboard page
```

### Commit 12

```text
Add customer allocation table
```

### Commit 13

```text
Display personalized discount amounts
```

### Commit 14

```text
Add budget summary cards
```

### Commit 15

```text
Add allocation filtering and sorting
```

---

# 26. Member 4 — Week 3

## Backend Integration

### Commit 11

```text
Create backend API structure
```

### Commit 12

```text
Add API health endpoint
```

### Commit 13

```text
Add model prediction endpoint
```

### Commit 14

```text
Add optimization endpoint
```

### Commit 15

```text
Connect frontend to backend APIs
```

---

# 27. PHASE 4 — WEEK 4

## Objective

Complete API packaging, data validation/drift detection, dashboard polish, testing and final integration.

The project document identifies API packaging, data drift detection and dashboard refinement as the Week 4 objectives.

---

# 28. Member 1 — Week 4

### Commit 16

```text
Export finalized causal model results
```

### Commit 17

```text
Add causal model utility functions
```

### Commit 18

```text
Prepare model pipeline for API
```

### Commit 19

```text
Optimize causal inference execution
```

### Commit 20

```text
Finalize causal model documentation
```

---

# 29. Member 2 — Week 4

### Commit 16

```text
Add expected revenue calculation
```

### Commit 17

```text
Add ROI calculation
```

### Commit 18

```text
Add random targeting comparison
```

### Commit 19

```text
Add optimization edge-case handling
```

### Commit 20

```text
Finalize budget optimization module
```

---

# 30. Member 3 — Week 4

### Commit 16

```text
Add revenue visualization
```

### Commit 17

```text
Add ROI visualization
```

### Commit 18

```text
Improve dashboard responsive layout
```

### Commit 19

```text
Add natural language result summary
```

### Commit 20

```text
Finalize dashboard UI and styling
```

---

# 31. Member 4 — Week 4

### Commit 16

```text
Add input validation
```

### Commit 17

```text
Add data drift detection
```

### Commit 18

```text
Add API integration tests
```

### Commit 19

```text
Add end-to-end testing
```

### Commit 20

```text
Finalize API and project integration
```

---

# 32. Final Repository Structure

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

# 33. Final System Architecture

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

# 34. Final Dashboard Features

The completed dashboard should provide:

## Overview

- Total customers
- Treatment/control counts
- Average treatment effect
- Total marketing budget
- Expected revenue

## Causal Analysis

- ITE distribution
- ATE
- Uplift curve
- Qini curve
- Treatment-effect categories

## Optimization

- Budget input
- Optimal discount allocation
- Expected gain
- Expected revenue
- ROI
- Random targeting comparison

## Customer Analysis

- Customer ID
- Treatment
- ITE
- Customer category
- Recommended discount
- Expected gain

## System Monitoring

- Input validation
- Data drift warning
- API status

---

# 35. Testing Strategy

## Data Tests

- Missing values
- Duplicate rows
- Invalid values
- Data types
- Required columns

## ML Tests

- Treatment validation
- Outcome validation
- ITE output validation
- Propensity score range
- Refutation tests

## Optimization Tests

- Zero budget
- Small budget
- Large budget
- Invalid discount
- Missing ITE
- Duplicate customer

## API Tests

- Health endpoint
- Valid request
- Invalid request
- Missing data
- Model response
- Optimization response

## Frontend Tests

- Dashboard loading
- File upload
- Charts
- Table
- Filters
- Budget input
- API connection

---

# 36. Final Git Commit Requirement

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

# 37. Branch History Target

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

The same structure applies to all four members.

---

# 38. Definition of Done

The project is considered complete when:

- [ ] Dataset is prepared.
- [ ] Treatment/outcome/confounders identified.
- [ ] DoWhy DAG implemented.
- [ ] EconML DML model trained.
- [ ] ITE generated.
- [ ] ATE calculated.
- [ ] Propensity scores generated.
- [ ] DoWhy refutation tests completed.
- [ ] Qini curve implemented.
- [ ] Uplift curve implemented.
- [ ] SciPy optimization implemented.
- [ ] Budget constraints implemented.
- [ ] Personalized discounts generated.
- [ ] Revenue and ROI calculated.
- [ ] Random targeting comparison completed.
- [ ] React dashboard completed.
- [ ] Plotly charts integrated.
- [ ] REST API completed.
- [ ] Data validation completed.
- [ ] Data drift detection completed.
- [ ] Integration tests completed.
- [ ] Final documentation completed.
- [ ] Final presentation completed.
- [ ] Each member has at least 20 meaningful commits.
- [ ] Four individual branches maintained.
- [ ] `main` contains only reviewed/merged work.

---

# 39. Final Team Workflow

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

# 40. Success Criteria

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

The final project should therefore demonstrate the progression from **causal ML to prescriptive AI**, which is the central goal of the EconoCausal project specification.