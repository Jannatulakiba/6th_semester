import random
from scipy import stats
import statistics
import matplotlib.pyplot as plt

# ── INPUT ──────────────────────────────────────────
print("=== Confidence Interval Estimation ===\n")

num_replications      = int(input("Number of replications: "))
mean_interarrival     = float(input("Mean inter-arrival time: "))
mean_service          = float(input("Mean service time: "))
num_customers_per_run = int(input("Customers per replication: "))
confidence_level      = float(input("Confidence level (e.g. 0.95): "))

# ── SIMULATION FUNCTION ─────────────────────────────
def run_one_replication(seed):
    rng           = random.Random(seed)
    arrival_time  = 0.0
    server_free   = 0.0
    total_delay   = 0.0
    for _ in range(num_customers_per_run):
        ia            = rng.expovariate(1.0 / mean_interarrival)
        svc           = rng.expovariate(1.0 / mean_service)
        arrival_time += ia
        service_start = max(arrival_time, server_free)
        total_delay  += service_start - arrival_time
        server_free   = service_start + svc
    return total_delay / num_customers_per_run

# ── RUN REPLICATIONS ────────────────────────────────
print(f"\n{'Replication':<14} {'Avg Wait Time'}")
print("-" * 30)

results = []
for r in range(1, num_replications + 1):
    avg_wait = run_one_replication(seed=100 + r)
    results.append(avg_wait)
    print(f"{r:<14} {avg_wait:.4f}")

# ── CONFIDENCE INTERVAL ─────────────────────────────
n              = len(results)
sample_mean    = statistics.mean(results)
sample_std     = statistics.stdev(results)
standard_error = sample_std / (n ** 0.5)
alpha          = 1 - confidence_level
t_critical     = stats.t.ppf(1 - alpha / 2, df=n - 1)
half_width     = t_critical * standard_error
ci_lower       = sample_mean - half_width
ci_upper       = sample_mean + half_width

print(f"\n=== RESULTS ===")
print(f"Sample Mean          : {sample_mean:.4f}")
print(f"Sample Std Dev       : {sample_std:.4f}")
print(f"Standard Error       : {standard_error:.4f}")
print(f"Degrees of Freedom   : {n-1}")
print(f"t-critical           : {t_critical:.4f}")
print(f"Half-width           : {half_width:.4f}")
print(f"\n{confidence_level*100:.0f}% Confidence Interval : [{ci_lower:.4f}, {ci_upper:.4f}]")
print(f"We are {confidence_level*100:.0f}% confident the true mean waiting time lies in this interval.")

# ── GRAPHS ──────────────────────────────────────────
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
fig.suptitle("Confidence Interval Estimation", fontsize=13, fontweight='bold')

# 1. Replication results bar chart
ax = axes[0]
ax.bar(range(1, n+1), results, color='steelblue', edgecolor='black')
ax.axhline(sample_mean, color='red',   linestyle='--', linewidth=1.5, label=f'Mean ({sample_mean:.2f})')
ax.axhline(ci_upper,    color='green', linestyle=':',  linewidth=1.2, label=f'CI Upper ({ci_upper:.2f})')
ax.axhline(ci_lower,    color='green', linestyle=':',  linewidth=1.2, label=f'CI Lower ({ci_lower:.2f})')
ax.set_title('Avg Wait Time per Replication')
ax.set_xlabel('Replication'); ax.set_ylabel('Avg Wait Time')
ax.set_xticks(range(1, n+1))
ax.legend(fontsize=8); ax.grid(alpha=0.3, axis='y')

# 2. Confidence interval plot
ax = axes[1]
ax.errorbar(1, sample_mean, yerr=half_width, fmt='o', color='steelblue',
            ecolor='red', elinewidth=2, capsize=10, markersize=8, label='Mean ± Half-width')
ax.axhline(sample_mean, color='steelblue', linestyle='--', linewidth=1, alpha=0.5)
ax.annotate(f'Upper: {ci_upper:.4f}', xy=(1, ci_upper), xytext=(1.1, ci_upper), fontsize=9)
ax.annotate(f'Mean:  {sample_mean:.4f}', xy=(1, sample_mean), xytext=(1.1, sample_mean), fontsize=9)
ax.annotate(f'Lower: {ci_lower:.4f}', xy=(1, ci_lower), xytext=(1.1, ci_lower), fontsize=9)
ax.set_title(f'{confidence_level*100:.0f}% Confidence Interval')
ax.set_ylabel('Avg Wait Time')
ax.set_xlim(0.5, 2); ax.set_xticks([])
ax.legend(fontsize=8); ax.grid(alpha=0.3, axis='y')

plt.tight_layout()
plt.show()