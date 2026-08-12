# %% [markdown]
# # 01 — Data Generation
# ## Member 1 | Week 1 | Causal ML Engineer
# ---
# 
# **Project:** Dynamic Pricing via Double Machine Learning  
# **Objective:** Set up the project environment and generate a synthetic retail dataset with a known causal structure.
# 
# ### Tasks Covered
# | # | Task | Status |
# |---|------|--------|
# | 1 | Create causal ML notebook | ✅ |
# | 2 | Load the dataset | ✅ |

# %% [markdown]
# ---
# ## 1. Setup & Imports

# %%
# Task 1: Setup and Imports
from IPython import display
import pandas as pd
import numpy as np
from scipy.special import expit  # sigmoid function
import os
import warnings
warnings.filterwarnings('ignore')

# ─── Set project root ────────────────────────────────────────────────
# Ensure we're working from the project root regardless of where the notebook is run
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')) if '__file__' in dir() else os.getcwd()
if os.path.basename(PROJECT_ROOT) == 'notebooks':
    PROJECT_ROOT = os.path.dirname(PROJECT_ROOT)
os.chdir(PROJECT_ROOT)
print(f"Project root: {PROJECT_ROOT}")

print("=" * 60)
print("EconoCausal — Data Generation")
print("Member 1 | Week 1")
print("=" * 60)
print("\n[OK] All packages imported successfully")

# %% [markdown]
# ---
# ## 2. Dataset Generation
# 
# We generate a **synthetic retail campaign dataset** with a known causal structure.
# This simulates observational data where treatment (discount) is not assigned randomly.

# %%
# Task 2: Load the provided dataset

# The provided dataset is the MineThatData E-Mail Analytics Challenge
file_path = 'data/raw/Kevin_Hillstrom_MineThatData_E-MailAnalytics_DataMiningChallenge_2008.03.20.csv'

# Check if the file exists
if not os.path.exists(file_path):
    print(f"Error: Could not find dataset at {file_path}")
else:
    df = pd.read_csv(file_path)
    
    print(f"[OK] Dataset loaded successfully")
    print(f"Dataset shape: {df.shape[0]} rows × {df.shape[1]} columns\n")
    
    print("="*60)
    print("DATASET INFO:")
    print("="*60)
    df.info()
    
    print("\n" + "="*60)
    print("FIRST 5 ROWS:")
    print("="*60)
    print(df.head())

# %% [markdown]
# ---
# ## 3. Data Processing
# 
# We will use the Kevin Hillstrom dataset for our causal modeling task. We will extract the confounders (`recency`, `history`, `mens`, `womens`, `newbie`), the treatment (`discount_offered`), and the outcome (`purchased`).

# %%
# Define Treatment: discount_offered is 1 if they received any E-Mail campaign, 0 otherwise
df['discount_offered'] = (df['segment'] != 'No E-Mail').astype(int)

# Define Outcome: purchased is mapped from conversion
df['purchased'] = df['conversion']

# Select confounders, treatment, and outcome
columns_to_keep = ['recency', 'history', 'mens', 'womens', 'newbie', 'discount_offered', 'purchased']
processed_df = df[columns_to_keep].copy()

# Add a customer_id column for consistency
processed_df.insert(0, 'customer_id', np.arange(1, len(processed_df) + 1))

print(f"\n[OK] Dataset processed with shape {processed_df.shape}")

# %% [markdown]
# ---
# ## 4. Save the Dataset

# %%
os.makedirs('data/raw', exist_ok=True)
output_path = 'data/raw/retail_campaign.csv'
processed_df.to_csv(output_path, index=False)
print(f"[OK] Processed dataset saved to {output_path}")