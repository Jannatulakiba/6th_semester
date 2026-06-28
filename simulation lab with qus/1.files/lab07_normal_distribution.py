"""
Lab 07: Normal Distribution
"""

import random
import statistics
import matplotlib.pyplot as plt
import numpy as np

def normal_pdf(x, mu, sigma):
    return (1 / (sigma * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((x - mu) / sigma) ** 2)

# ============================================================
#   PART A: Unimodal vs Multimodal
# ============================================================
x = np.linspace(-10, 30, 1000)

unimodal   = normal_pdf(x, 10, 3)
multimodal = 0.5 * normal_pdf(x, 5, 2) + 0.5 * normal_pdf(x, 18, 2)

plt.figure(figsize=(10, 4))

plt.subplot(1, 2, 1)
plt.plot(x, unimodal, color="darkblue")
plt.title("Unimodal Normal Density")
plt.xlabel("x"); plt.ylabel("density")

plt.subplot(1, 2, 2)
plt.plot(x, multimodal, color="darkred")
plt.title("Multimodal (Bimodal Mixture) Density")
plt.xlabel("x"); plt.ylabel("density")

plt.tight_layout()
plt.show()
print("Graph A displayed: Unimodal vs Multimodal")

# ============================================================
#   PART B: 200 Random Samples ~ Normal(mean=100, std=20)
# ============================================================
random.seed(3)
sample_size = 200
mean_b      = 100
std_b       = 20

samples     = [random.gauss(mean_b, std_b) for _ in range(sample_size)]
sample_mean = statistics.mean(samples)
sample_std  = statistics.stdev(samples)

print()
print("=" * 55)
print("  PART B: 200 Random Samples ~ Normal(mean=100, std=20)")
print("=" * 55)
print(f"  Requested mean         : {mean_b}")
print(f"  Requested std dev      : {std_b}")
print(f"  Sample mean  (n=200)   : {sample_mean:.4f}")
print(f"  Sample std   (n=200)   : {sample_std:.4f}")
print("  (Sample stats should be CLOSE to the requested parameters,")
print("   by the Law of Large Numbers.)")
print("=" * 55)

plt.figure(figsize=(7, 4))
plt.hist(samples, bins=20, color="seagreen", edgecolor="black")
plt.title("Histogram of 200 Samples ~ Normal(100, 20)")
plt.xlabel("Value"); plt.ylabel("Frequency")
plt.tight_layout()
plt.show()
print("Graph B displayed: Sample Histogram")

# ============================================================
#   PART C: Diastolic Blood Pressure ~ Normal(80, 20)
# ============================================================
bp_mean = 80
bp_std  = 20
bp_n    = 1000

bp_samples = [random.gauss(bp_mean, bp_std) for _ in range(bp_n)]

print()
print("=" * 55)
print("  PART C: Diastolic Blood Pressure ~ Normal(mean=80, std=20)")
print("=" * 55)
print(f"  Population mean              : {bp_mean}")
print(f"  Population std dev           : {bp_std}")
print(f"  Simulated mean   (n={bp_n})  : {statistics.mean(bp_samples):.4f}")
print(f"  Simulated std    (n={bp_n})  : {statistics.stdev(bp_samples):.4f}")
print("=" * 55)

plt.figure(figsize=(7, 4))
plt.hist(bp_samples, bins=30, color="indianred", edgecolor="black")
plt.title("Diastolic Blood Pressure Distribution (Bell Shape)")
plt.xlabel("Blood Pressure"); plt.ylabel("Frequency")
plt.tight_layout()
plt.show()
print("Graph C displayed: Blood Pressure Histogram")
print("=" * 55)