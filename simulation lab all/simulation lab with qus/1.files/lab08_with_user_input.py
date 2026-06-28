import math
import random
import matplotlib.pyplot as plt

# ── USER INPUT ──────────────────────────────────────
print("=== Lab 08 - Exponential Distribution ===\n")

mean_gap  = float(input("Mean gap between waves (days) [default 100]: ") or 100)
x         = float(input("Threshold days [default 120]: ") or 120)
n_samples = int(input("Number of samples [default 1000]: ") or 1000)

print("\nRate list input (e.g. 0.5 1.0 2.0 4.0):")
rate_input = input("Enter rates separated by spaces [default 0.5 1.0 2.0 4.0]: ").strip()
rate_list  = [float(r) for r in rate_input.split()] if rate_input else [0.5, 1.0, 2.0, 4.0]

seed_input = input("Random seed (press Enter to skip): ").strip()
if seed_input:
    random.seed(int(seed_input))

# ── CALCULATIONS ────────────────────────────────────
lam = 1 / mean_gap
P_more_than_x = math.exp(-lam * x)

# ── PART 1: Probability ─────────────────────────────
print("\n=== PART 1: P(Next COVID Wave > {} Days) ===\n".format(int(x)))
print(f"Mean gap between waves  : {mean_gap} days")
print(f"Rate lambda = 1/mean    : {lam:.4f} per day")
print(f"Threshold x             : {x} days")
print()
print(f"FORMULA: P(X > x) = e^(-lambda x)")
print(f"P(X > {x}) = e^(-{lam:.4f} x {x}) = e^(-{lam*x:.2f}) = {P_more_than_x:.4f}")
print(f"=> {P_more_than_x*100:.2f}% chance the gap exceeds {x} days")

# ── PART 2: Simulation ──────────────────────────────
print("\n=== PART 2: Simulated Exponential Distributions ===\n")

all_samples = []
for rate in rate_list:
    samples = [random.expovariate(rate) for _ in range(n_samples)]
    all_samples.append(samples)
    sim_mean  = sum(samples) / n_samples
    theo_mean = 1 / rate
    print(f"rate={rate} | theoretical mean={theo_mean:.4f} | simulated mean={sim_mean:.4f}")

# ── GRAPHS ──────────────────────────────────────────
cols = 2
rows = math.ceil(len(rate_list) / cols)
fig, axes = plt.subplots(rows, cols, figsize=(12, 4 * rows))
fig.suptitle("Lab 08 - Exponential Distribution", fontsize=13, fontweight='bold')
axes = axes.flatten() if hasattr(axes, 'flatten') else [axes]

for i, (rate, samples) in enumerate(zip(rate_list, all_samples)):
    ax = axes[i]
    ax.hist(samples, bins=30, color='slateblue', edgecolor='black', density=True)
    xs  = [j * 0.01 for j in range(int(max(samples) * 100) + 1)]
    pdf = [rate * math.exp(-rate * xv) for xv in xs]
    ax.plot(xs, pdf, color='red', linewidth=2, label='PDF')
    ax.axvline(1/rate, color='green', linestyle='--', linewidth=1.5,
               label=f'Mean ({1/rate:.2f})')
    ax.set_title(f'Exponential (rate={rate})')
    ax.set_xlabel('x'); ax.set_ylabel('Density')
    ax.legend(fontsize=8); ax.grid(alpha=0.3)

# অতিরিক্ত খালি subplot লুকানো
for j in range(len(rate_list), len(axes)):
    axes[j].set_visible(False)

plt.tight_layout()
plt.show()