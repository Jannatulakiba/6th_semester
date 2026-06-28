import math
import matplotlib.pyplot as plt

# ============================================================
#   USER INPUT
# ============================================================
print("=" * 55)
print("   POISSON DISTRIBUTION - CALL CENTER SIMULATOR")
print("=" * 55)
print()

lam = float(input("   Enter lambda (avg calls/hour)  : "))
k_max = int(input("   Enter max k value (e.g. 10)    : "))
k_values = list(range(0, k_max + 1))
extra_lambdas = [10, 15]  # fixed - lab problem থেকে দেওয়া

print()
print("=" * 55)

# ============================================================
#   POISSON PMF FUNCTION
# ============================================================
def poisson_pmf(k, lam):
    # P(X=k) = (lambda^k * e^-lambda) / k!
    return (lam ** k) * math.exp(-lam) / math.factorial(k)

# ============================================================
#   OUTPUT TABLE
# ============================================================
print(f"   POISSON DISTRIBUTION - CALL CENTER (lambda = {lam})")
print("=" * 55)
print(f"   {'k (calls)':<12}{'P(X = k)':<15}")
print("   " + "-" * 30)

probs = []
for k in k_values:
    p_k = poisson_pmf(k, lam)
    probs.append(p_k)
    print(f"   {k:<12}{p_k:.6f}")

print("   " + "-" * 30)
print(f"   Sum of P(X=0..{k_max}) = {sum(probs):.6f}  (should be close to 1)")
print("=" * 55)

print()
print("   FORMULA : P(X=k) = (lambda^k * e^(-lambda)) / k!")
print(f"   Example : P(X=2) = (5^2 * e^-5) / 2!")
print(f"           = (25 * {math.exp(-5):.6f}) / 2")
print(f"           = {poisson_pmf(2, 5):.6f}")
print("=" * 55)

# ============================================================
#   PMF GRAPHS for lambda = 10 and lambda = 15
# ============================================================
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
fig.suptitle("Poisson PMF Comparison", fontsize=14, fontweight="bold")

for ax, lam_val in zip(axes, extra_lambdas):
    ks = list(range(0, lam_val * 3))
    pmf_vals = [poisson_pmf(k, lam_val) for k in ks]
    ax.bar(ks, pmf_vals, color="steelblue", edgecolor="white")
    ax.set_title(f"Poisson PMF  (λ = {lam_val})", fontsize=12)
    ax.set_xlabel("Number of calls (k)")
    ax.set_ylabel("P(X = k)")
    ax.axvline(lam_val, color="red", linestyle="--", label=f"λ = {lam_val}")
    ax.legend()

plt.tight_layout()
plt.show()

print()
print("   Graph displayed! (PMF for lambda=10 and lambda=15)")
print("=" * 55)