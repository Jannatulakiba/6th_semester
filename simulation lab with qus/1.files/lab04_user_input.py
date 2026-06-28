import matplotlib.pyplot as plt

# ── INPUT ──────────────────────────────────────────
print("=== Bernoulli Distribution - Microchip QC Test ===\n")

p = float(input("Enter probability of success (p): "))
q = 1 - p

# ── CALCULATIONS ───────────────────────────────────
P_X0  = q
P_X1  = p
E_X   = p
Var_X = p * q

# ── OUTPUT ─────────────────────────────────────────
print("\nRandom Variable X:")
print("  X = 1 -> chip PASSES (Success)")
print("  X = 0 -> chip FAILS  (Failure)")

print("\n=== RESULTS ===")
print(f"P(X=0) = q = 1 - {p} = {P_X0:.4f}")
print(f"P(X=1) = p           = {P_X1:.4f}")
print(f"E[X]   = p           = {E_X:.4f}")
print(f"Var(X) = p x q = {p} x {q:.4f} = {Var_X:.4f}")

# ── GRAPHS ─────────────────────────────────────────
fig, axes = plt.subplots(1, 2, figsize=(10, 5))
fig.suptitle(f"Bernoulli Distribution  (p = {p})", fontsize=13, fontweight='bold')

# 1. PMF Bar Chart
ax = axes[0]
ax.bar([0, 1], [P_X0, P_X1], color=['tomato', 'steelblue'], width=0.4)
ax.set_xticks([0, 1])
ax.set_xticklabels(['X=0 (Fail)', 'X=1 (Pass)'])
ax.set_ylabel('Probability')
ax.set_title('PMF — P(X=0) and P(X=1)')
ax.set_ylim(0, 1)
for x, val in zip([0, 1], [P_X0, P_X1]):
    ax.text(x, val + 0.02, f'{val:.4f}', ha='center', fontsize=11)
ax.grid(alpha=0.3, axis='y')

# 2. Mean and Variance
ax = axes[1]
ax.bar(['E[X] (Mean)', 'Var(X) (Variance)'], [E_X, Var_X],
       color=['steelblue', 'orange'], width=0.4)
ax.set_ylabel('Value')
ax.set_title('Mean and Variance')
for i, val in enumerate([E_X, Var_X]):
    ax.text(i, val + 0.01, f'{val:.4f}', ha='center', fontsize=11)
ax.grid(alpha=0.3, axis='y')

plt.tight_layout()
plt.show()