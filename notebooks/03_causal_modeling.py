# %% [markdown]
# # 03 — Causal Modeling & DAG
# ## Member 1 | Week 1 | Causal ML Engineer
# ---
# 
# **Project:** Dynamic Pricing via Double Machine Learning  
# **Objective:** Build the structural causal model, visualize the Directed Acyclic Graph (DAG), and test assumptions.
# 
# ### Tasks Covered
# | # | Task | Status |
# |---|------|--------|
# | 7 | Create DoWhy causal model | ✅ |
# | 8 | Define the causal DAG | ✅ |
# | 9 | Visualize the DAG | ✅ |
# | 10 | Document causal assumptions | ✅ |

# %% [markdown]
# ---
# ## 1. Setup & Imports
 
# %%
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import networkx as nx
import dowhy
from dowhy import CausalModel
from sklearn.linear_model import LogisticRegression 
import os
import warnings
warnings.filterwarnings('ignore')

# ─── Set project root ────────────────────────────────────────────────
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')) if '__file__' in dir() else os.getcwd()
if os.path.basename(PROJECT_ROOT) == 'notebooks':
    PROJECT_ROOT = os.path.dirname(PROJECT_ROOT)
os.chdir(PROJECT_ROOT)

# Set plot styling
plt.style.use('seaborn-v0_8-whitegrid')
sns.set_palette('husl')
plt.rcParams['figure.figsize'] = (10, 6)

df = pd.read_csv('data/raw/retail_campaign.csv')
confounders = ['recency', 'history', 'mens', 'womens', 'newbie']
print(f"[OK] Data loaded: {len(df)} rows")

# %% [markdown]
# ---
# ## 2. DoWhy Causal Model & DAG
# 
# We build a structural causal model using DoWhy.

# %%
# Task 7 & 8: Define the DAG and create DoWhy model
gml_graph = """
graph [
    directed 1
    node [ id "recency" label "recency" ]
    node [ id "history" label "history" ]
    node [ id "mens" label "mens" ]
    node [ id "womens" label "womens" ]
    node [ id "newbie" label "newbie" ]
    node [ id "discount_offered" label "discount_offered" ]
    node [ id "purchased" label "purchased" ]
    
    edge [ source "recency" target "discount_offered" ]
    edge [ source "recency" target "purchased" ]
    edge [ source "history" target "discount_offered" ]
    edge [ source "history" target "purchased" ]
    edge [ source "mens" target "discount_offered" ]
    edge [ source "mens" target "purchased" ]
    edge [ source "womens" target "discount_offered" ]
    edge [ source "womens" target "purchased" ]
    edge [ source "newbie" target "discount_offered" ]
    edge [ source "newbie" target "purchased" ]
    edge [ source "discount_offered" target "purchased" ]
]
"""

model = CausalModel(
    data=df,
    treatment='discount_offered',
    outcome='purchased',
    graph=gml_graph
)

print("[OK] Causal DAG defined and DoWhy model instantiated.")

# %% [markdown]
# ---
# ## 3. DAG Visualization

# %%
# Task 9: Visualize the DAG
G = nx.DiGraph()
G.add_nodes_from(confounders)
G.add_node('discount_offered')
G.add_node('purchased')

for c in confounders:
    G.add_edge(c, 'discount_offered')
    G.add_edge(c, 'purchased')
G.add_edge('discount_offered', 'purchased')

pos = {}
n_conf = len(confounders)
for i, c in enumerate(confounders):
    pos[c] = (0, (n_conf - 1) / 2 - i)
pos['discount_offered'] = (2.5, 0)
pos['purchased'] = (5.0, 0)

fig, ax = plt.subplots(figsize=(15, 9)) 

# Draw edges
nx.draw_networkx_edges(G, pos, edgelist=[(c, 'discount_offered') for c in confounders], edge_color='#42A5F5', connectionstyle='arc3,rad=0.05', ax=ax)
nx.draw_networkx_edges(G, pos, edgelist=[(c, 'purchased') for c in confounders], edge_color='#FFA726', connectionstyle='arc3,rad=-0.05', ax=ax)
nx.draw_networkx_edges(G, pos, edgelist=[('discount_offered', 'purchased')], edge_color='#43A047', width=4, arrows=True, arrowsize=25, ax=ax)

# Draw nodes
nx.draw_networkx_nodes(G, pos, nodelist=confounders, node_color='#BBDEFB', node_size=2800, edgecolors='#1565C0', ax=ax)
nx.draw_networkx_nodes(G, pos, nodelist=['discount_offered'], node_color='#C8E6C9', node_size=4000, node_shape='s', ax=ax)
nx.draw_networkx_nodes(G, pos, nodelist=['purchased'], node_color='#FFE0B2', node_size=4000, node_shape='s', ax=ax)

labels = {n: n.replace('_', '\n') for n in G.nodes()}
nx.draw_networkx_labels(G, pos, labels, font_size=8, font_weight='bold', ax=ax)

ax.set_title('Causal Directed Acyclic Graph (DAG)', fontsize=16, fontweight='bold', pad=20)
ax.axis('off')
plt.tight_layout()
plt.savefig('outputs/causal_dag.png', dpi=200, bbox_inches='tight')
plt.show()

# %% [markdown]
# ---
# ## 4. Causal Assumptions Documentation
# 
# ### Assumption 1: Unconfoundedness
# Conditional on observed confounders (recency, history, mens, womens, newbie), the treatment assignment is independent of potential outcomes. We will test robustness with random common cause refutation later.
# 
# ### Assumption 2: SUTVA
# Customer A's purchase isn't affected by whether Customer B got a discount.
# 
# ### Assumption 3: Consistency
# "Receiving a discount" is a uniform treatment across all customers.
# 
# ### Assumption 4: Positivity (Overlap)
# Every customer has a non-zero probability of both receiving and not receiving a discount. We test this below.

# %%
# Task 10: Verify positivity assumption (Propensity Score Overlap)
X_conf = df[confounders].values
T_vals = df['discount_offered'].values

lr = LogisticRegression(max_iter=1000, random_state=42)
lr.fit(X_conf, T_vals)
estimated_propensity = lr.predict_proba(X_conf)[:, 1]

fig, axes = plt.subplots(1, 2, figsize=(14, 5))

axes[0].hist(estimated_propensity[T_vals == 0], bins=30, alpha=0.6, color='#EF5350', label='Control', density=True)
axes[0].hist(estimated_propensity[T_vals == 1], bins=30, alpha=0.6, color='#66BB6A', label='Treatment', density=True)
axes[0].set_title('Propensity Score Overlap')
axes[0].legend()

data_to_plot = [estimated_propensity[T_vals == 0], estimated_propensity[T_vals == 1]]
bp = axes[1].boxplot(data_to_plot, tick_labels=['Control', 'Treatment'], patch_artist=True, showmeans=True)
bp['boxes'][0].set_facecolor('#EF5350')
bp['boxes'][1].set_facecolor('#66BB6A')
axes[1].set_title('Propensity Score by Group')

plt.tight_layout()
plt.savefig('outputs/propensity_overlap.png', dpi=150, bbox_inches='tight')
plt.show()
