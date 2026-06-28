import random
import math
import matplotlib.pyplot as plt

# ── INPUT ──────────────────────────────────────────
print("=== Inverse Transform Method - Exponential Variates ===\n")

lam = float(input("Rate parameter (lambda): "))
N   = int(input("Number of variates (N): "))

random.seed(9)

# ── CALCULATION ────────────────────────────────────
print(f"\nCDF:     F(x) = 1 - e^(-lambda*x)")
print(f"Inverse: x = -ln(1-U) / lambda\n")

print(f"{'i':<6} {'U (uniform)':<14} {'x = -ln(1-U)/lambda'}")
print("-" * 40)

variates = []
uniforms = []

for i in range(1, N + 1):
    u = random.random()
    x = -math.log(1 - u) / lam
    variates.append(x)
    uniforms.append(u)
    print(f"{i:<6} {u:<14.4f} {x:.4f}")

sample_mean      = sum(variates) / N
theoretical_mean = 1 / lam

print("-" * 40)
print(f"Sample mean      : {sample_mean:.4f}")
print(f"Theoretical mean : {theoretical_mean:.4f}  (1/lambda)")
print(f"Difference       : {abs(sample_mean - theoretical_mean):.4f}")
print("(More variates → sample mean closer to theoretical mean)")

# ── GRAPHS ──────────────────────────────────────────
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
fig.suptitle(f"Inverse Transform Method  (lambda={lam}, N={N})", fontsize=13, fontweight='bold')

# 1. U vs x scatter
ax = axes[0]
ax.scatter(uniforms, variates, color='steelblue', s=40)
ax.set_title('U (Uniform) vs x (Exponential)')
ax.set_xlabel('U'); ax.set_ylabel('x')
ax.grid(alpha=0.3)

# 2. Histogram of variates
ax = axes[1]
ax.hist(variates, bins=20, color='orange', edgecolor='black', density=True)
xs  = [i * 0.01 for i in range(int(max(variates) * 100) + 1)]
pdf = [lam * math.exp(-lam * xv) for xv in xs]
ax.plot(xs, pdf, color='red', linewidth=2, label='Theoretical PDF')
ax.axvline(sample_mean,      color='blue',  linestyle='--', linewidth=1.5, label=f'Sample Mean ({sample_mean:.2f})')
ax.axvline(theoretical_mean, color='green', linestyle=':',  linewidth=1.5, label=f'Theoretical Mean ({theoretical_mean:.2f})')
ax.set_title('Generated Variates Histogram')
ax.set_xlabel('x'); ax.set_ylabel('Density')
ax.legend(fontsize=8); ax.grid(alpha=0.3, axis='y')

plt.tight_layout()
plt.show()