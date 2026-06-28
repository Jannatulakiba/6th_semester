"""
Lab 06: Poisson Distribution - Customer Care Call Center
=============================================================
Calls arrive at an AVERAGE rate of lambda = 5 calls/hour.
This is a POISSON process: X = number of calls in one hour.
"""

import math
import matplotlib.pyplot as plt

# ---------------- INPUTS (given) ----------------
lam = 5
k_values = list(range(0, 11))
extra_lambdas = [10, 15]

def poisson_pmf(k, lam):
    return (lam ** k) * math.exp(-lam) / math.factorial(k)

print("=" * 55)
print("   POISSON DISTRIBUTION - CALL CENTER (lambda = 5)")
print("=" * 55)
print(f"{'k (calls)':<12}{'P(X = k)':<15}")
print("-" * 55)

probs = []
for k in k_values:
    p_k = poisson_pmf(k, lam)
    probs.append(p_k)
    print(f"{k:<12}{p_k:.6f}")

print("-" * 55)
print(f"Sum of P(X=0..10) = {sum(probs):.6f}  (should be close to 1)")
print("=" * 55)

print("\nFORMULA USED: P(X=k) = (lambda^k * e^(-lambda)) / k!")
print(f"Example for k=2: P(X=2) = (5^2 * e^-5) / 2! = (25 * {math.exp(-5):.6f}) / 2 = {poisson_pmf(2,5):.6f}")

# ---------------- PMF GRAPHS ----------------
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
for ax, lam_val in zip(axes, extra_lambdas):
    ks = list(range(0, lam_val * 3))
    pmf_vals = [poisson_pmf(k, lam_val) for k in ks]
    ax.bar(ks, pmf_vals, color="steelblue")
    ax.set_title(f"Poisson PMF (lambda = {lam_val})")
    ax.set_xlabel("Number of calls (k)")
    ax.set_ylabel("P(X = k)")

plt.tight_layout()
plt.show()
print("\nGraph displayed! (PMF for lambda=10 and lambda=15)")
print("=" * 55)