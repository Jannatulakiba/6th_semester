import random
import statistics
import matplotlib.pyplot as plt
import numpy as np

def normal_pdf(x, mu, sigma):
    return (1 / (sigma * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((x - mu) / sigma) ** 2)

# ── INPUT ──────────────────────────────────────────
print("=== Normal Distribution Simulator ===\n")

mean_b      = float(input("Part B - Mean (e.g. 100): "))
std_b       = float(input("Part B - Std dev (e.g. 20): "))
sample_size = int(input("Part B - Sample size (e.g. 200): "))

print()
bp_mean = float(input("Part C - BP mean (e.g. 80): "))
bp_std  = float(input("Part C - BP std dev (e.g. 20): "))
bp_n    = int(input("Part C - BP sample size (e.g. 1000): "))

# ── CALCULATIONS ───────────────────────────────────
random.seed(3)
samples    = [random.gauss(mean_b, std_b) for _ in range(sample_size)]
bp_samples = [random.gauss(bp_mean, bp_std) for _ in range(bp_n)]

sample_mean = statistics.mean(samples)
sample_std  = statistics.stdev(samples)
bp_sim_mean = statistics.mean(bp_samples)
bp_sim_std  = statistics.stdev(bp_samples)

# ── OUTPUT ─────────────────────────────────────────
print("\n=== PART B: Random Samples ~ Normal(mean, std) ===")
print(f"First 10 samples : {[round(s, 2) for s in samples[:10]]}")
print(f"Requested mean   : {mean_b}")
print(f"Requested std    : {std_b}")
print(f"Sample mean (n={sample_size}) : {sample_mean:.4f}")
print(f"Sample std  (n={sample_size}) : {sample_std:.4f}")
print("(Closer to requested values with more samples)")

print("\n=== PART C: Blood Pressure ~ Normal(mean, std) ===")
print(f"First 10 samples   : {[round(s, 2) for s in bp_samples[:10]]}")
print(f"Population mean    : {bp_mean}")
print(f"Population std     : {bp_std}")
print(f"Simulated mean (n={bp_n}) : {bp_sim_mean:.4f}")
print(f"Simulated std  (n={bp_n}) : {bp_sim_std:.4f}")

# ── GRAPHS ─────────────────────────────────────────
x          = np.linspace(-10, 30, 1000)
unimodal   = normal_pdf(x, 10, 3)
multimodal = 0.5 * normal_pdf(x, 5, 2) + 0.5 * normal_pdf(x, 18, 2)

fig, axes = plt.subplots(2, 2, figsize=(12, 8))
fig.suptitle("Lab 07 - Normal Distribution", fontsize=13, fontweight='bold')

# Graph A1: Unimodal
axes[0, 0].plot(x, unimodal, color='darkblue')
axes[0, 0].set_title('Part A - Unimodal Normal Density')
axes[0, 0].set_xlabel('x'); axes[0, 0].set_ylabel('Density')
axes[0, 0].grid(alpha=0.3)

# Graph A2: Multimodal
axes[0, 1].plot(x, multimodal, color='darkred')
axes[0, 1].set_title('Part A - Multimodal (Bimodal) Density')
axes[0, 1].set_xlabel('x'); axes[0, 1].set_ylabel('Density')
axes[0, 1].grid(alpha=0.3)

# Graph B: Sample Histogram
axes[1, 0].hist(samples, bins=20, color='seagreen', edgecolor='black')
axes[1, 0].axvline(sample_mean, color='red', linestyle='--', linewidth=1.5,
                   label=f'Mean ({sample_mean:.2f})')
axes[1, 0].set_title(f'Part B - {sample_size} Samples ~ Normal({mean_b}, {std_b})')
axes[1, 0].set_xlabel('Value'); axes[1, 0].set_ylabel('Frequency')
axes[1, 0].legend(fontsize=8); axes[1, 0].grid(alpha=0.3, axis='y')

# Graph C: Blood Pressure
axes[1, 1].hist(bp_samples, bins=30, color='indianred', edgecolor='black')
axes[1, 1].axvline(bp_sim_mean, color='blue', linestyle='--', linewidth=1.5,
                   label=f'Mean ({bp_sim_mean:.2f})')
axes[1, 1].set_title(f'Part C - Blood Pressure ~ Normal({bp_mean}, {bp_std})')
axes[1, 1].set_xlabel('Blood Pressure'); axes[1, 1].set_ylabel('Frequency')
axes[1, 1].legend(fontsize=8); axes[1, 1].grid(alpha=0.3, axis='y')

plt.tight_layout()
plt.show()