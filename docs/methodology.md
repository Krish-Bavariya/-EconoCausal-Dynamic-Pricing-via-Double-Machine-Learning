# Causal Model Methodology

**Project:** EconoCausal — Dynamic Pricing via Double Machine Learning  
**Member:** 1 — Causal ML Engineer  
**Module:** Causal Inference Engine (`backend/services/double_machine_learning/`)

---

## 1. Problem Framing

Standard predictive ML answers *"who will buy?"* — but not *"would this customer buy **because of** the discount?"*

This project answers the second question by estimating the **Individual Treatment Effect (ITE)**: the change in purchase probability for each customer caused specifically by offering a discount.

Formally, for customer $i$:

$$\text{ITE}_i = \mathbb{E}[Y_i(1) - Y_i(0) \mid X_i]$$

Where:
- $Y_i(1)$ = outcome if the customer **receives** a discount (potential outcome under treatment)
- $Y_i(0)$ = outcome if the customer **does not receive** a discount (potential outcome under control)
- $X_i$ = observed confounders (customer features)

---

## 2. Dataset

**Source:** Hillstrom MineThatData Email Analytics Dataset (adapted as `retail_campaign.csv`)

| Column | Role | Description |
|---|---|---|
| `recency` | Confounder | Months since last purchase |
| `history` | Confounder | Total historical spend ($) |
| `mens` | Confounder | Flag: purchased men's products |
| `womens` | Confounder | Flag: purchased women's products |
| `newbie` | Confounder | Flag: new customer (joined in last 12 months) |
| `discount_offered` | **Treatment** (T) | 1 = customer received a discount, 0 = no discount |
| `purchased` | **Outcome** (Y) | 1 = made a purchase, 0 = did not purchase |

---

## 3. Causal Assumptions

The following four assumptions are required for the causal estimates to be valid.

### 3.1 Unconfoundedness (Ignorability)
> Conditional on the observed confounders $X$, treatment assignment is independent of potential outcomes.

$$T_i \perp \!\!\! \perp (Y_i(0), Y_i(1)) \mid X_i$$

**Justification:** We include all business-relevant variables known to affect both discount targeting (treatment assignment) and purchase behavior (outcome). These are: recency, historical spend, product preferences (mens/womens), and customer tenure (newbie).

**Test:** Validated by running DoWhy refutation tests (random common cause + placebo treatment).

### 3.2 SUTVA (Stable Unit Treatment Value Assumption)
> One customer's treatment does not affect another customer's outcome.

**Justification:** Customers in this dataset operate independently; there is no social/network spillover between discount recipients.

### 3.3 Consistency
> A customer's outcome under treatment $T=1$ is the same as their observed outcome when they actually received the treatment.

**Justification:** "Receiving a discount" is a uniform, well-defined intervention across all customers.

### 3.4 Positivity (Overlap)
> Every customer has a non-zero probability of both receiving and not receiving a discount.

$$0 < P(T=1 \mid X=x) < 1 \quad \forall x$$

**Validation:** Verified via propensity score overlap plots (see `outputs/propensity_overlap.png`).

---

## 4. Causal DAG

The causal structure is encoded as a Directed Acyclic Graph (DAG):

```
recency  ─┬──→ discount_offered ──→ purchased
history  ─┤                  ↗
mens     ─┤                 /
womens   ─┤                /
newbie   ─┘──────────────────────→ purchased
```

Formally, every confounder $C \in \{$recency, history, mens, womens, newbie$\}$ has edges:
- $C \rightarrow$ `discount_offered` (confounders influence who gets a discount)
- $C \rightarrow$ `purchased` (confounders directly influence purchase probability)
- `discount_offered` $\rightarrow$ `purchased` (the causal effect we want to estimate)

DAG visualization: `outputs/causal_dag.png`

---

## 5. Double Machine Learning (DML)

### 5.1 Why DML?

Standard regression of outcome on treatment is biased because confounders affect both $T$ and $Y$. Propensity score methods have high variance with many confounders. DML achieves:

- **Debiasing** via residualization (Frisch-Waugh-Lovell)
- **Flexibility** via ML base estimators (no parametric assumptions)
- **Valid inference** (confidence intervals, hypothesis tests)

### 5.2 The DML Procedure

DML partials out the effect of confounders from both treatment and outcome, then regresses the residuals:

**Step 1 — Outcome model (nuisance):**
$$\tilde{Y}_i = Y_i - \hat{m}(X_i) \quad \text{where } \hat{m}(X_i) = \mathbb{E}[Y \mid X]$$

**Step 2 — Treatment model (nuisance):**
$$\tilde{T}_i = T_i - \hat{g}(X_i) \quad \text{where } \hat{g}(X_i) = \mathbb{E}[T \mid X]$$

**Step 3 — Causal effect regression:**
$$\tilde{Y}_i = \theta(X_i) \cdot \tilde{T}_i + \varepsilon_i$$

The coefficient $\theta(X_i)$ is the **conditional average treatment effect**, which varies per customer.

### 5.3 Implementation

**Library:** [EconML](https://econml.azurewebsites.net/) `LinearDML`

```python
from econml.dml import LinearDML

dml_model = LinearDML(
    model_y = LGBMRegressor(n_estimators=100, max_depth=5),  # outcome nuisance
    model_t = LGBMClassifier(n_estimators=100, max_depth=5), # treatment nuisance
    discrete_treatment = True,
    cv = 5,            # 5-fold cross-fitting
    random_state = 42
)
dml_model.fit(Y, T, X=X)
```

**Cross-fitting:** 5-fold cross-fitting prevents over-fitting of the nuisance models.

**Base estimators:** LightGBM (LGBM) was chosen for:
- High accuracy on tabular data
- Handles mixed numeric + binary features natively
- Efficient training time

---

## 6. ITE Estimation

After training, the ITE is computed for every customer:

```python
ite = dml_model.effect(X)  # shape: (n_customers,)
```

**Average Treatment Effect (ATE):**
$$\text{ATE} = \frac{1}{N} \sum_{i=1}^{N} \text{ITE}_i$$

ITE distribution visualization: `outputs/ite_distribution.png`

---

## 7. Customer Segmentation

Customers are classified into four segments based on their ITE and baseline purchase probability:

| Segment | Condition | Business Action |
|---|---|---|
| **Persuadables** | ITE > threshold | Offer discount ($20) — high ROI |
| **Sure Things** | ITE ≈ 0, high base prob | Small nudge ($10) — saves margin |
| **Lost Causes** | ITE ≈ 0, low base prob | No discount ($0) — saves budget |
| **Sleeping Dogs** | ITE < 0 | No discount ($0) — avoid backfire |

Segment thresholds:
- `ite_threshold = 0.01` (1 pp increase in purchase probability)
- `base_threshold = 0.50` (50% baseline purchase probability)

Segment visualization: `outputs/segments.png`

---

## 8. Causal Validation (Refutation Tests)

Two DoWhy refutation tests validate the causal estimate:

### 8.1 Random Common Cause
Adds a random (causally irrelevant) variable to the DAG and re-estimates. If the estimate changes significantly, it suggests the model is not robust.

**Pass criterion:** New effect remains close to original estimate.

### 8.2 Placebo Treatment
Randomly shuffles the treatment variable (destroying any true causal signal) and re-estimates. If the effect does not collapse to near zero, the model may be capturing spurious correlations.

**Pass criterion:** New effect ≈ 0.

---

## 9. Model Health Checks

Before serving results, six automated checks are applied:

| Check | Condition |
|---|---|
| ITE column present | `"ITE"` in results DataFrame |
| ITE has no NaN | `df["ITE"].isna().sum() == 0` |
| ITE in valid range | All values in [-1.0, 1.0] |
| Segment labels valid | Only known segment names present |
| Persuadables fraction | < 80% of total customers |
| Expected gain non-negative | All `expected_gain ≥ 0` |

---

## 10. Output Files

| File | Description |
|---|---|
| `outputs/ite_scores.csv` | Lightweight: customer_id + ITE (backward compat) |
| `outputs/ite_scores_final.csv` | Full results: ITE + segment + discount + expected_gain |
| `outputs/model_metadata.json` | Summary JSON: ATE, segments, ROI for API/dashboard |
| `outputs/causal_dag.png` | DAG visualization |
| `outputs/ite_distribution.png` | ITE histogram |
| `outputs/segments.png` | Customer segment bar chart |
| `outputs/propensity_overlap.png` | Propensity score overlap (positivity check) |
| `outputs/model_cache/` | Cached trained model (joblib) |
