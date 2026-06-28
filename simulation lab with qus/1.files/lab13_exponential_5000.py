import random
import math
import matplotlib.pyplot as plt

# ── INPUT ──────────────────────────────────────────
print("=== 5000 Exponential Variates - Inverse Transform Method ===\n")

lam = float(input("Rate parameter (lambda): "))
N   = int(input("Number of variates (N): "))

random.seed(17)

# ── CALCULATION ────────────────────────────────────
variates = [-math.log(1 - random.random()) / lam for _ in range(N)]

sample_mean = sum(variates) / N
sample_var  = sum((v - sample_mean) ** 2 for v in variates) / (N - 1)
theo_mean   = 1 / lam
theo_var    = 1 / (lam ** 2)

# ── OUTPUT ─────────────────────────────────────────
print(f"\nFormula: x = -ln(1-U) / lambda\n")
print(f"{'Statistic':<20} {'Sample':<12} {'Theoretical'}")
print("-" * 45)
print(f"{'Mean':<20} {sample_mean:<12.4f} {theo_mean:.4f}")
print(f"{'Variance':<20} {sample_var:<12.4f} {theo_var:.4f}")
print(f"{'Min':<20} {min(variates):<12.4f} 0 (theoretical)")
print(f"{'Max':<20} {max(variates):<12.4f} unbounded")
print("\nSample statistics close to theoretical → Inverse Transform works correctly.")

# ── GRAPH ───────────────────────────────────────────
plt.figure(figsize=(9, 5))
plt.hist(variates, bins=50, density=True, color='cornflowerblue',
         edgecolor='black', alpha=0.7, label=f'Simulated histogram (n={N})')

xs  = [i * 0.01 for i in range(int(max(variates) * 100) + 1)]
pdf = [lam * math.exp(-lam * xv) for xv in xs]
plt.plot(xs, pdf, color='red', linewidth=2, label=f'Theoretical PDF (lambda={lam})')

plt.axvline(sample_mean, color='blue',  linestyle='--', linewidth=1.5, label=f'Sample Mean ({sample_mean:.2f})')
plt.axvline(theo_mean,   color='green', linestyle=':',  linewidth=1.5, label=f'Theoretical Mean ({theo_mean:.2f})')

plt.title(f'{N} Exponential Variates: Histogram vs Theoretical PDF')
plt.xlabel('x'); plt.ylabel('Density')
plt.legend(fontsize=9); plt.grid(alpha=0.3)
plt.tight_layout()
plt.show()