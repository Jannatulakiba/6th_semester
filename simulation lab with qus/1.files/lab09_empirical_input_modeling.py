import numpy as np
from scipy import stats
import matplotlib.pyplot as plt

np.random.seed(21)

n = 100
true_shape, true_scale = 2.0, 5.0
data = np.random.weibull(true_shape, n) * true_scale

print("=" * 65)
print("   EMPIRICAL INPUT MODELING - DISTRIBUTION FITTING (MLE)")
print("=" * 65)
print(f"Sample size (n)            : {n}")
print(f"Sample mean                : {np.mean(data):.4f}")
print(f"Sample std dev             : {np.std(data, ddof=1):.4f}")
print(f"Sample min / max           : {np.min(data):.4f} / {np.max(data):.4f}")
print("=" * 65)

norm_mu, norm_sigma = stats.norm.fit(data)

print("\nMLE FITTED PARAMETERS (Normal Distribution)")
print("-" * 65)
print(f"Normal     : mu={norm_mu:.4f}, sigma={norm_sigma:.4f}")
print("-" * 65)

ll_norm = np.sum(stats.norm.logpdf(data, norm_mu, norm_sigma))
print(f"\nNormal log-likelihood : {ll_norm:.4f}")
print("=" * 65)

fig, ax = plt.subplots(figsize=(6, 5))
stats.probplot(data, dist=stats.norm, sparams=(norm_mu, norm_sigma), plot=ax)
ax.set_title("Q-Q Plot: Normal Fit")

plt.tight_layout()
plt.show()