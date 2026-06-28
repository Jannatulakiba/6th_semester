"""
Lab 15: Confidence Interval Estimation
===========================================
Run multiple independent replications of a simulation model and
calculate a 95% confidence interval for the mean system response
(here: average waiting time of an M/M/1-style queue).

INPUTS NEEDED (no numbers given in lab text - only the procedure is
described):
  1. num_replications     -> how many independent simulation runs
  2. mean_interarrival, mean_service, num_customers_per_run
                              -> parameters of each individual run
                                 (re-using Lab01-style M/M/1 queue)
  3. confidence_level = 0.95  -> given directly ("95% confidence interval")

Assumed: num_replications = 10, mean_interarrival=5, mean_service=4,
         num_customers_per_run=30
"""

import random
from scipy import stats
import statistics

# ---------------- INPUT PARAMETERS ----------------
num_replications = 10          # assumed
mean_interarrival = 5.0          # assumed
mean_service = 4.0                # assumed
num_customers_per_run = 30        # assumed
confidence_level = 0.95            # given directly in problem

print("=" * 65)
print("          CONFIDENCE INTERVAL ESTIMATION")
print("    (Average Waiting Time, Multiple Independent Replications)")
print("=" * 65)
print(f"{'Number of Replications':<30}: {num_replications}")
print(f"{'Customers per Replication':<30}: {num_customers_per_run}")
print(f"{'Mean Inter-Arrival Time':<30}: {mean_interarrival}")
print(f"{'Mean Service Time':<30}: {mean_service}")
print(f"{'Confidence Level':<30}: {confidence_level*100:.0f}%")
print("=" * 65)


def run_one_replication(seed):
    """Runs one M/M/1-style queue simulation and returns avg waiting time."""
    rng = random.Random(seed)
    arrival_time = 0.0
    server_free_at = 0.0
    total_delay = 0.0
    for _ in range(num_customers_per_run):
        ia = rng.expovariate(1.0 / mean_interarrival)
        svc = rng.expovariate(1.0 / mean_service)
        arrival_time += ia
        service_start = max(arrival_time, server_free_at)
        delay = service_start - arrival_time
        total_delay += delay
        server_free_at = service_start + svc
    return total_delay / num_customers_per_run


# ---------------- RUN REPLICATIONS ----------------
replication_results = []
print(f"{'Replication':<14}{'Avg Wait Time':<16}")
print("-" * 65)
for r in range(1, num_replications + 1):
    avg_wait = run_one_replication(seed=100 + r)
    replication_results.append(avg_wait)
    print(f"{r:<14}{avg_wait:<16.4f}")

# ---------------- CONFIDENCE INTERVAL CALCULATION ----------------
n = len(replication_results)
sample_mean = statistics.mean(replication_results)
sample_std = statistics.stdev(replication_results)   # sample std dev (n-1 denominator)
standard_error = sample_std / (n ** 0.5)

# Student's t critical value (since n is small, true variance unknown)
alpha = 1 - confidence_level
t_critical = stats.t.ppf(1 - alpha / 2, df=n - 1)

half_width = t_critical * standard_error
ci_lower = sample_mean - half_width
ci_upper = sample_mean + half_width

print("=" * 65)
print("                       RESULTS")
print("=" * 65)
print(f"Sample Mean (x_bar)            : {sample_mean:.4f}")
print(f"Sample Std Dev (s)             : {sample_std:.4f}")
print(f"Standard Error (s/sqrt(n))     : {standard_error:.4f}")
print(f"Degrees of Freedom (n-1)       : {n-1}")
print(f"t-critical (alpha={alpha:.2f}, df={n-1}) : {t_critical:.4f}")
print(f"Half-width = t * SE             : {half_width:.4f}")
print("-" * 65)
print(f"95% CONFIDENCE INTERVAL FOR MEAN WAITING TIME:")
print(f"   [{ci_lower:.4f}, {ci_upper:.4f}]")
print("-" * 65)
print("INTERPRETATION: We are 95% confident the TRUE mean waiting time")
print("of the underlying queueing system lies within this interval.")
print("=" * 65)
print("\nFORMULA USED:")
print("  CI = x_bar +/- t(alpha/2, n-1) * (s / sqrt(n))")
print("  (Student's t-distribution used because the true population")
print("   variance is unknown and must be estimated from the sample.)")
print("=" * 65)
