import matplotlib.pyplot as plt

# ── INPUT ──────────────────────────────────────────
print("=== Linear Congruential Generator (LCG) ===\n")

X0 = int(input("Seed (X0): "))
a  = int(input("Multiplier (a): "))
c  = int(input("Increment (c): "))
m  = int(input("Modulus (m): "))
N  = int(input("How many numbers to generate (N): "))

# ── LCG CALCULATION ────────────────────────────────
print(f"\nFORMULA: X(n+1) = (a*X(n) + c) mod m  |  R(n) = X(n)/m\n")
print(f"{'n':<6} {'X(n)':<8} {'R(n)'}")
print("-" * 30)

X       = X0
seen    = set()
results = []

for n in range(N):
    R = X / m
    print(f"{n:<6} {X:<8} {R:.4f}")
    results.append(R)
    seen.add(X)
    X = (a * X + c) % m

# ── RESULTS ─────────────────────────────────────────
print("-" * 30)
print(f"Generated {N} numbers.")
print(f"Distinct values: {len(seen)} out of m={m}")
if len(seen) == m:
    print("-> Full period achieved — good generator.")
else:
    print("-> Full period NOT achieved — repeats early.")

# ── GRAPHS ──────────────────────────────────────────
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
fig.suptitle(f"LCG  (X0={X0}, a={a}, c={c}, m={m})", fontsize=13, fontweight='bold')

# 1. R(n) values over sequence
ax = axes[0]
ax.plot(range(N), results, color='steelblue', marker='o', markersize=4, linewidth=1.2)
ax.axhline(0.5, color='red', linestyle='--', linewidth=1.2, label='0.5 midpoint')
ax.set_title('Generated R(n) Values')
ax.set_xlabel('n'); ax.set_ylabel('R(n)')
ax.set_ylim(0, 1)
ax.legend(fontsize=8); ax.grid(alpha=0.3)

# 2. Histogram — uniformity check
ax = axes[1]
ax.hist(results, bins=10, range=(0, 1), color='orange', edgecolor='black')
ax.axhline(N/10, color='red', linestyle='--', linewidth=1.2, label=f'Expected ({N/10:.1f})')
ax.set_title('Histogram — Uniformity Check')
ax.set_xlabel('R(n)'); ax.set_ylabel('Frequency')
ax.legend(fontsize=8); ax.grid(alpha=0.3, axis='y')

plt.tight_layout()
plt.show()