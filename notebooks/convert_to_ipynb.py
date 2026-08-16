import json
import re
import os
import sys

if len(sys.argv) > 1:
    py_path = sys.argv[1]
else:
    py_path = r'c:\Users\ROG\Downloads\-EconoCausal-Dynamic-Pricing-via-Double-Machine-Learning-member1-causalML\notebooks\causal_graph.py'
    
ipynb_path = py_path.replace('.py', '.ipynb')

with open(py_path, 'r', encoding='utf-8') as f:
    content = f.read()

parts = re.split(r'^# %%', content, flags=re.MULTILINE)

cells = []
for i, part in enumerate(parts):
    if i == 0:
        stripped = part.strip()
        if not stripped:
            continue
        cells.append({
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [line + '\n' for line in part.rstrip().split('\n')]
        })
        continue
    
    if part.startswith(' [markdown]'):
        text = part[len(' [markdown]'):]
        lines = text.split('\n')
        md_lines = []
        for line in lines:
            if line.startswith('# '):
                md_lines.append(line[2:])
            elif line == '#':
                md_lines.append('')
            else:
                md_lines.append(line)
        
        while md_lines and md_lines[0].strip() == '':
            md_lines.pop(0)
        while md_lines and md_lines[-1].strip() == '':
            md_lines.pop()
        
        if md_lines:
            # Ensure newlines on all but last, or all
            md_lines = [line + '\n' for line in md_lines]
            cells.append({
                "cell_type": "markdown",
                "metadata": {},
                "source": md_lines
            })
    else:
        code = part.lstrip('\n')
        if code.strip():
            source_lines = [line + '\n' for line in code.rstrip().split('\n')]
            cells.append({
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": source_lines
            })

notebook = {
    "cells": cells,
    "metadata": {
        "kernelspec": {
            "display_name": "Python 3",
            "language": "python",
            "name": "python3"
        },
        "language_info": {
            "name": "python",
            "version": "3.10.0",
            "mimetype": "text/x-python",
            "file_extension": ".py"
        }
    },
    "nbformat": 4,
    "nbformat_minor": 5
}

with open(ipynb_path, 'w', encoding='utf-8') as f:
    json.dump(notebook, f, indent=1, ensure_ascii=False)

print(f"Done! Created {ipynb_path}")
print(f"Total cells: {len(cells)}")
print(f"Code cells: {sum(1 for c in cells if c['cell_type']=='code')}")
print(f"Markdown cells: {sum(1 for c in cells if c['cell_type']=='markdown')}")
