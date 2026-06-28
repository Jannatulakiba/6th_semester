import math
import random
import matplotlib.pyplot as plt

# ── FIXED VALUES (given in problem) ────────────────
mean_gap  = 100
lam       = 1 / mean_gap
x         = 120
rate_list = [0.5, 1.0, 2.0, 4.0]
n_samples = 1000

random.seed(5)

# ── PART 1: Probability ─────────────────────────────
P_more_than_120 = math.exp(-lam * x)

print("=== PART 1: P(Next COVID Wave > 120 Days) ===\n")
print(f"Mean gap between waves  : {mean_gap} days")
print(f"Rate lambda = 1/mean    : {lam:.4f} per day")
print(f"Threshold x             : {x} days")
print()
print(f"FORMULA: P(X > x) = e^(-lambda x)")
print(f"P(X > 120) = e^(-{lam:.4f} x 120) = e^(-{lam*x:.2f}) = {P_more_than_120:.4f}")
print(f"=> {P_more_than_120*100:.2f}% chance the gap exceeds 120 days")

# ── PART 2: Simulation ──────────────────────────────
print("\n=== PART 2: Simulated Exponential Distributions ===\n")

all_samples = []
for rate in rate_list:
    samples = [random.expovariate(rate) for _ in range(n_samples)]
    all_samples.append(samples)
    sim_mean   = sum(samples) / n_samples
    theo_mean  = 1 / rate
    print(f"rate={rate} | theoretical mean={theo_mean:.4f} | simulated mean={sim_mean:.4f}")

# ── GRAPHS ──────────────────────────────────────────
fig, axes = plt.subplots(2, 2, figsize=(12, 8))
fig.suptitle("Lab 08 - Exponential Distribution", fontsize=13, fontweight='bold')
axes = axes.flatten()

for ax, rate, samples in zip(axes, rate_list, all_samples):
    ax.hist(samples, bins=30, color='slateblue', edgecolor='black', density=True)
    xs  = [i * 0.01 for i in range(int(max(samples) * 100) + 1)]
    pdf = [rate * math.exp(-rate * xv) for xv in xs]
    ax.plot(xs, pdf, color='red', linewidth=2, label='PDF')
    ax.axvline(1/rate, color='green', linestyle='--', linewidth=1.5,
               label=f'Mean ({1/rate:.2f})')
    ax.set_title(f'Exponential (rate={rate})')
    ax.set_xlabel('x'); ax.set_ylabel('Density')
    ax.legend(fontsize=8); ax.grid(alpha=0.3)

plt.tight_layout()
plt.show()