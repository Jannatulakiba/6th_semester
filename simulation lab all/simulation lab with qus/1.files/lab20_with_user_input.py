import statistics
import math
import matplotlib.pyplot as plt
from scipy import stats

# ── INPUT ──────────────────────────────────────────
print("=== Drive-Thru Pharmacy - Statistical Output Analysis ===\n")

raw = input("Enter replication waiting times (comma separated, e.g. 3.2,4.3,5.1,4.2,4.6): ")
data = list(map(float, raw.split(',')))

confidence_level    = float(input("Confidence level (e.g. 0.95): "))
desired_half_width  = float(input("Desired half-width (e.g. 0.5): "))

n = len(data)

# ── 1. POINT ESTIMATE ──────────────────────────────
sample_mean = statistics.mean(data)

print(f"\n1) POINT ESTIMATE")
print(f"   ({' + '.join(str(d) for d in data)}) / {n} = {sum(data)} / {n} = {sample_mean:.4f} min")

# ── 2. VARIANCE & STANDARD ERROR ───────────────────
sample_var    = statistics.variance(data)
sample_std    = statistics.stdev(data)
standard_error = sample_std / math.sqrt(n)

print(f"\n2) SAMPLE VARIANCE & STANDARD ERROR")
print(f"   Variance s²  = {sample_var:.4f}")
print(f"   Std Dev  s   = {sample_std:.4f}")
print(f"   Std Error SE = {sample_std:.4f} / sqrt({n}) = {standard_error:.4f}")

# ── 3. CONFIDENCE INTERVAL ─────────────────────────
alpha      = 1 - confidence_level
df         = n - 1
t_critical = stats.t.ppf(1 - alpha / 2, df=df)
half_width = t_critical * standard_error
ci_lower   = sample_mean - half_width
ci_upper   = sample_mean + half_width

print(f"\n3) {confidence_level*100:.0f}% CONFIDENCE INTERVAL")
print(f"   degree of freedom        = {df}")
print(f"   t-critical = {t_critical:.4f}")
print(f"   Half-width = {t_critical:.4f} x {standard_error:.4f} = {half_width:.4f}")
print(f"   CI = {sample_mean:.4f} ± {half_width:.4f} = [{ci_lower:.4f}, {ci_upper:.4f}] min")

# ── 4. REQUIRED REPLICATIONS ───────────────────────
print(f"\n4) REPLICATIONS NEEDED FOR HALF-WIDTH <= {desired_half_width}")
print(f"   {'n':<6} {'t-critical':<12} {'Half-width':<12} {'OK?'}")
print("   " + "-" * 40)

required_n = n
while True:
    required_n += 1
    t_val = stats.t.ppf(1 - alpha / 2, df=required_n - 1)
    hw    = t_val * sample_std / math.sqrt(required_n)
    ok    = "<= OK" if hw <= desired_half_width else ""
    print(f"   {required_n:<6} {t_val:<12.4f} {hw:<12.4f} {ok}")
    if hw <= desired_half_width:
        break
    if required_n > 200:
        break

print(f"\n   RESULT: {required_n} total replications needed")
print(f"   ({required_n - n} more beyond the {n} already run)")

# ── GRAPHS ──────────────────────────────────────────
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
fig.suptitle("Drive-Thru Pharmacy - Statistical Output Analysis", fontsize=13, fontweight='bold')

# 1. Replication results with CI
ax = axes[0]
ax.bar(range(1, n+1), data, color='steelblue', edgecolor='white', label='Replication data')
ax.axhline(sample_mean, color='green', linestyle='-',  linewidth=2,   label=f'Mean ({sample_mean:.2f})')
ax.axhline(ci_upper,    color='red',   linestyle='--', linewidth=1.5, label=f'CI Upper ({ci_upper:.2f})')
ax.axhline(ci_lower,    color='red',   linestyle='--', linewidth=1.5, label=f'CI Lower ({ci_lower:.2f})')
ax.set_title('Replication Results with CI')
ax.set_xlabel('Replication #'); ax.set_ylabel('Avg Wait Time (min)')
ax.set_xticks(range(1, n+1))
ax.legend(fontsize=8); ax.grid(alpha=0.3, axis='y')

# 2. Half-width vs replications needed
ax = axes[1]
n_vals = list(range(n, required_n + 3))
hw_vals = [stats.t.ppf(1 - alpha/2, df=nv-1) * sample_std / math.sqrt(nv) for nv in n_vals]
ax.plot(n_vals, hw_vals, color='steelblue', marker='o', markersize=5, linewidth=2)
ax.axhline(desired_half_width, color='red', linestyle='--', linewidth=1.5,
           label=f'Desired half-width ({desired_half_width})')
ax.axvline(required_n, color='green', linestyle='--', linewidth=1.5,
           label=f'Required n = {required_n}')
ax.set_title('Half-width vs Replications')
ax.set_xlabel('Number of Replications'); ax.set_ylabel('Half-width (min)')
ax.legend(fontsize=8); ax.grid(alpha=0.3)

plt.tight_layout()
plt.show()