from math import comb, sqrt
import matplotlib.pyplot as plt

# ── INPUT ──────────────────────────────────────────
print("=== Binomial Distribution - Network Packet Delivery ===\n")

n = int(float(input("Number of packets per batch (n): ")))
p = float(input("Success probability per packet (p): "))
k = int(float(input("Exact successes to find P(X=k), k: ")))

print("Enter observed batch data (comma separated, e.g. 14,13,15,12,14): ")
observed_data = list(map(int, input().split(',')))

q = 1 - p

# ── CALCULATIONS ───────────────────────────────────
binom_coeff = comb(n, k)
P_X_k       = binom_coeff * (p ** k) * (q ** (n - k))

mu       = n * p
sigma_sq = n * p * q
sigma    = sqrt(sigma_sq)

avg_observed = sum(observed_data) / len(observed_data)
diff         = abs(avg_observed - mu)

# ── OUTPUT ─────────────────────────────────────────
print("\n=== RESULTS ===")
print(f"P(X={k}) = C({n},{k}) x p^{k} x q^{n-k}")
print(f"       = {binom_coeff} x {p}^{k} x {q:.2f}^{n-k}")
print(f"       = {P_X_k:.4f}  ({P_X_k*100:.2f}%)")
print()
print(f"Mean     mu      = n x p         = {n} x {p} = {mu:.2f}")
print(f"Variance sigma^2 = n x p x q     = {n} x {p} x {q:.2f} = {sigma_sq:.4f}")
print(f"Std Dev  sigma   = sqrt({sigma_sq:.4f}) = {sigma:.4f}")
print()
print(f"Observed average : {avg_observed:.2f}")
print(f"Theoretical mean : {mu:.2f}")
print(f"Difference       : {diff:.2f}")
if diff < 1.0:
    print("-> Observed average is CLOSE to theoretical mean: model fits well.")
else:
    print("-> Observed average deviates noticeably: model may not fit well.")

# ── GRAPHS ─────────────────────────────────────────
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
fig.suptitle(f"Binomial Distribution  (n={n}, p={p})", fontsize=13, fontweight='bold')

# 1. PMF Bar Chart
ax = axes[0]
x_vals = list(range(0, n + 1))
pmf    = [comb(n, x) * (p ** x) * (q ** (n - x)) for x in x_vals]
colors = ['tomato' if x == k else 'steelblue' for x in x_vals]
ax.bar(x_vals, pmf, color=colors)
ax.set_title(f'PMF — P(X=k) for all k\n(red = k={k})')
ax.set_xlabel('k (successes)')
ax.set_ylabel('Probability')
ax.axvline(mu, color='green', linestyle='--', linewidth=1.5, label=f'Mean = {mu:.2f}')
ax.legend(fontsize=8)
ax.grid(alpha=0.3, axis='y')

# 2. Observed vs Theoretical
ax = axes[1]
batch_nums = list(range(1, len(observed_data) + 1))
ax.bar(batch_nums, observed_data, color='steelblue', label='Observed')
ax.axhline(mu,           color='green', linestyle='--', linewidth=1.5, label=f'Theoretical Mean ({mu:.2f})')
ax.axhline(avg_observed, color='orange', linestyle=':',  linewidth=1.5, label=f'Observed Avg ({avg_observed:.2f})')
ax.set_title('Observed Data vs Theoretical Mean')
ax.set_xlabel('Batch')
ax.set_ylabel('Successes')
ax.set_xticks(batch_nums)
ax.legend(fontsize=8)
ax.grid(alpha=0.3, axis='y')

plt.tight_layout()
plt.show()