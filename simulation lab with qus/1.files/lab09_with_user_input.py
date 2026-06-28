import numpy as np
from scipy import stats
import matplotlib.pyplot as plt

print("=" * 65)
print("   EMPIRICAL INPUT MODELING - DISTRIBUTION FITTING (MLE)")
print("=" * 65)

n = int(input("Enter number of customer arrivals to simulate (n): "))

# Random data generate
np.random.seed(42)
data = np.random.weibull(2.0, n) * 5.0

print()
print("=" * 65)
print("               SAMPLE STATISTICS")
print("=" * 65)
print(f"  Sample size (n)     : {n}")
print(f"  Sample mean         : {np.mean(data):.4f}")
print(f"  Sample std dev      : {np.std(data, ddof=1):.4f}")
print(f"  Minimum             : {np.min(data):.4f}")
print(f"  Maximum             : {np.max(data):.4f}")
print("=" * 65)

# MLE Fitting
norm_mu, norm_sigma = stats.norm.fit(data)

print()
print("=" * 65)
print("        MLE FITTED PARAMETERS (Normal Distribution)")
print("=" * 65)
print(f"  mu (mean)           : {norm_mu:.4f}")
print(f"  sigma (std dev)     : {norm_sigma:.4f}")
print("=" * 65)

# Log-Likelihood
ll_norm = np.sum(stats.norm.logpdf(data, norm_mu, norm_sigma))

print()
print("=" * 65)
print("               GOODNESS OF FIT")
print("=" * 65)
print(f"  Log-Likelihood      : {ll_norm:.4f}")
print("  (Higher value = Better fit)")
print("=" * 65)

# Q-Q Plot
fig, ax = plt.subplots(figsize=(7, 5))
stats.probplot(data, dist=stats.norm, sparams=(norm_mu, norm_sigma), plot=ax)
ax.set_title("Q-Q Plot: Normal Distribution Fit", fontsize=14, fontweight='bold')
ax.set_xlabel("Theoretical Quantiles")
ax.set_ylabel("Sample Quantiles")
ax.grid(True, linestyle='--', alpha=0.5)

plt.tight_layout()
plt.show()