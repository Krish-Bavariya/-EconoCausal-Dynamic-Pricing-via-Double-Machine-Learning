# %% [markdown]
# # 02 — Exploratory Data Analysis & Variables
# ## Member 1 | Week 1 | Causal ML Engineer
# ---
# 
# **Project:** Dynamic Pricing via Double Machine Learning  
# **Objective:** Perform Exploratory Data Analysis (EDA) and identify the treatment, outcome, and confounding variables.
# 
# ### Tasks Covered
# | # | Task | Status |
# |---|------|--------|
# | 3 | Explore the dataset (EDA) | ✅ |
# | 4 | Identify treatment variable | ✅ |
# | 5 | Identify outcome variable | ✅ |
# | 6 | Identify confounding variables | ✅ |

# %% [markdown]
# ---
# ## 1. Setup & Imports

# %%
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
import warnings
warnings.filterwarnings('ignore')

# ─── Set project root ────────────────────────────────────────────────
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')) if '__file__' in dir() else os.getcwd()
if os.path.basename(PROJECT_ROOT) == 'notebooks':
    PROJECT_ROOT = os.path.dirname(PROJECT_ROOT)
os.chdir(PROJECT_ROOT)
print(f"Project root: {PROJECT_ROOT}")

# Set plot styling
plt.style.use('seaborn-v0_8-whitegrid')
sns.set_palette('husl')
plt.rcParams['figure.figsize'] = (10, 6)
plt.rcParams['figure.dpi'] = 100
plt.rcParams['font.size'] = 11

df = pd.read_csv('data/raw/retail_campaign.csv')
features = ['recency', 'history', 'mens', 'womens', 'newbie']
print(f"[OK] Data loaded: {len(df)} rows")

# %% [markdown]
# ---
# ## 2. Exploratory Data Analysis (EDA)

# %%
# Task 3: EDA — Distribution of confounder variables
fig, axes = plt.subplots(2, 3, figsize=(16, 10))
fig.suptitle('Distribution of Confounder Variables', fontsize=16, fontweight='bold', y=1.02)
colors = ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#00BCD4']

for idx, (feat, color) in enumerate(zip(features, colors)):
    ax = axes[idx // 3, idx % 3]
    ax.hist(df[feat], bins=30, color=color, alpha=0.7, edgecolor='white', linewidth=0.8)
    ax.set_title(feat.replace('_', ' ').title(), fontsize=12, fontweight='bold')
    ax.set_xlabel(feat)
    ax.set_ylabel('Count')
    mean_val = df[feat].mean()
    ax.axvline(mean_val, color='black', linestyle='--', alpha=0.7, linewidth=1)

# Remove unused axes
for j in range(len(features), 6):
    fig.delaxes(axes[j // 3, j % 3])

plt.tight_layout()
plt.savefig('outputs/confounder_distributions.png', dpi=150, bbox_inches='tight')
plt.show()

# %%
# EDA — Correlation heatmap
plt.figure(figsize=(10, 8))
corr_matrix = df.drop(columns=['customer_id']).corr()
mask = np.triu(np.ones_like(corr_matrix, dtype=bool))
sns.heatmap(corr_matrix, mask=mask, annot=True, cmap='RdBu_r', center=0,
            fmt='.3f', linewidths=0.5, square=True, vmin=-1, vmax=1)
plt.title('Feature Correlation Heatmap', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.savefig('outputs/correlation_heatmap.png', dpi=150, bbox_inches='tight')
plt.show()

# %% [markdown]
# ---
# ## 3. Treatment Variable Analysis
# 
# **Variable:** `discount_offered` (Binary: 0 = Control, 1 = Treatment)

# %%
# Task 4: Treatment variable analysis
treatment_balance = df.groupby('discount_offered')[features].mean()
treatment_balance.index = ['Control', 'Treatment']
print("SELECTION BIAS CHECK: Confounder Means by Treatment Group")
print(treatment_balance.round(2).T.to_string())

# %%
# Visualize confounder imbalance between treatment groups
fig, axes = plt.subplots(2, 3, figsize=(16, 10))
fig.suptitle('Confounder Distributions by Treatment Group (Selection Bias Check)', fontsize=14, fontweight='bold', y=1.02)

for idx, feat in enumerate(features):
    ax = axes[idx // 3, idx % 3]
    for t_val, color, label in [(0, '#EF5350', 'No Discount'), (1, '#66BB6A', 'Discount')]:
        subset = df[df['discount_offered'] == t_val][feat]
        ax.hist(subset, bins=25, alpha=0.55, color=color, label=label, edgecolor='white')
    ax.set_title(feat.replace('_', ' ').title(), fontsize=11, fontweight='bold')
    ax.legend(fontsize=8)

# Remove unused axes
for j in range(len(features), 6):
    fig.delaxes(axes[j // 3, j % 3])

plt.tight_layout()
plt.savefig('outputs/confounder_imbalance.png', dpi=150, bbox_inches='tight')
plt.show()

# %% [markdown]
# ---
# ## 4. Outcome Variable Analysis
# 
# **Variable:** `purchased` (Binary: 0 = Did not purchase, 1 = Purchased)

# %%
# Task 5: Outcome variable analysis
purchase_rates = df.groupby('discount_offered')['purchased'].mean()
naive_effect = purchase_rates[1] - purchase_rates[0]
print(f"Naive difference (biased): {naive_effect*100:+.1f} percentage points")

# Visualization
fig, ax = plt.subplots(figsize=(8, 5))
bars = ax.bar(['No Discount', 'Discount'], purchase_rates.values * 100, color=['#EF5350', '#66BB6A'])
ax.set_title('Purchase Rate by Treatment Group (Naive Comparison)', fontsize=13, fontweight='bold')
for bar, val in zip(bars, purchase_rates.values):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.8, f'{val*100:.1f}%', ha='center', fontweight='bold')

plt.tight_layout()
plt.savefig('outputs/purchase_rate_by_treatment.png', dpi=150, bbox_inches='tight')
plt.show()

# %% [markdown]
# ---
# ## 5. Confounder Feature Analysis
# 
# Confounding variables influence both treatment and outcome.

# %%
# Task 6: Confounder analysis
print("CONFOUNDING ASSESSMENT")
for feat in features:
    corr_t = df[feat].corr(df['discount_offered'])
    corr_y = df[feat].corr(df['purchased'])
    status = "✓ CONFOUNDER" if abs(corr_t) > 0.03 and abs(corr_y) > 0.03 else "  (weak)"
    print(f"{feat:25s} T: {corr_t:+.4f}  Y: {corr_y:+.4f}  -> {status}")

# Visualizing relationships
fig, axes = plt.subplots(2, 3, figsize=(16, 10))
fig.suptitle('Confounder Mean Values by Treatment × Outcome', fontsize=14, fontweight='bold', y=1.02)
for idx, feat in enumerate(features):
    ax = axes[idx // 3, idx % 3]
    means = df.groupby(['discount_offered', 'purchased'])[feat].mean().unstack()
    means.index = ['No Discount', 'Discount']
    means.columns = ['No Purchase', 'Purchased']
    means.plot(kind='bar', ax=ax, color=['#EF5350', '#66BB6A'], edgecolor='white')
    ax.set_title(feat.replace('_', ' ').title(), fontsize=11, fontweight='bold')
    ax.set_xticklabels(ax.get_xticklabels(), rotation=0)

# Remove unused axes
for j in range(len(features), 6):
    fig.delaxes(axes[j // 3, j % 3])

plt.tight_layout()
plt.savefig('outputs/confounder_relationships.png', dpi=150, bbox_inches='tight')
plt.show()
