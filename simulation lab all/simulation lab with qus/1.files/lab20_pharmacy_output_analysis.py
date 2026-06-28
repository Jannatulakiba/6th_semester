"""
Lab 20: Statistical Output Analysis - Drive-Thru Pharmacy
================================================================
GIVEN: 5 independent replications, average waiting times per run:
    3.2, 4.3, 5.1, 4.2, 4.6  minutes
Tasks:
  1. Point estimate (sample mean)
  2. Sample variance and standard error
  3. 95% confidence interval using Student's t-distribution
  4. Number of replications needed for half-width <= 0.5 minutes

INPUTS (all given directly in problem - no assumption needed):
  data = [3.2, 4.3, 5.1, 4.2, 4.6]
  confidence_level = 0.95
  desired_half_width = 0.5
"""

import statistics
from scipy import stats
import math

# ---------------- INPUTS (given) ----------------
data = [3.2, 4.3, 5.1, 4.2, 4.6]   # given: 5 replication averages
confidence_level = 0.95              # given: 95% CI
desired_half_width = 0.5              # given: desired precision

n = len(data)

print("=" * 60)
print("  DRIVE-THRU PHARMACY - STATISTICAL OUTPUT ANALYSIS")
print("=" * 60)
print(f"Replication waiting times (min): {data}")
print(f"Number of replications (n)     : {n}")
print(f"Confidence level                : {confidence_level*100:.0f}%")
print(f"Desired half-width              : {desired_half_width} minutes")
print("=" * 60)

# ---------------- 1. POINT ESTIMATE (sample mean) ----------------
sample_mean = statistics.mean(data)

# ---------------- 2. SAMPLE VARIANCE & STANDARD ERROR ----------------
sample_var = statistics.variance(data)        # uses (n-1) denominator
sample_std = statistics.stdev(data)
standard_error = sample_std / math.sqrt(n)

print("\n1) POINT ESTIMATE")
print("-" * 60)
print(f"Sample Mean (x_bar) = (sum of all values) / n")
print(f"                    = ({' + '.join(str(d) for d in data)}) / {n}")
print(f"                    = {sum(data)} / {n} = {sample_mean:.4f} minutes")

print("\n2) SAMPLE VARIANCE & STANDARD ERROR")
print("-" * 60)
print(f"Sample Variance s^2 = sum((x_i - x_bar)^2) / (n-1) = {sample_var:.4f}")
print(f"Sample Std Dev    s = sqrt(s^2) = {sample_std:.4f}")
print(f"Standard Error  SE = s / sqrt(n) = {sample_std:.4f} / sqrt({n}) = {standard_error:.4f}")

# ---------------- 3. 95% CONFIDENCE INTERVAL (t-distribution) ----------------
alpha = 1 - confidence_level
df = n - 1
t_critical = stats.t.ppf(1 - alpha / 2, df=df)
half_width = t_critical * standard_error
ci_lower = sample_mean - half_width
ci_upper = sample_mean + half_width

print("\n3) 95% CONFIDENCE INTERVAL (Student's t-distribution)")
print("-" * 60)
print(f"Degrees of freedom (df = n-1)      : {df}")
print(f"t-critical (t_(0.025, {df}))         : {t_critical:.4f}")
print(f"Half-width = t_critical * SE        : {t_critical:.4f} * {standard_error:.4f} = {half_width:.4f}")
print(f"CI = x_bar +/- half-width")
print(f"   = {sample_mean:.4f} +/- {half_width:.4f}")
print(f"   = [{ci_lower:.4f}, {ci_upper:.4f}] minutes")

# ---------------- 4. REPLICATIONS NEEDED FOR HALF-WIDTH <= 0.5 ----------------
# Formula: required n' such that t_(alpha/2, n'-1) * s / sqrt(n') <= desired_half_width
# Solved iteratively (since t depends on df which depends on n').
print("\n4) REQUIRED REPLICATIONS FOR HALF-WIDTH <= 0.5 MINUTES")
print("-" * 60)
print("FORMULA: find smallest n' such that  t(alpha/2, n'-1) * s / sqrt(n') <= H")
print(f"  where s = {sample_std:.4f} (using current sample std dev as estimate),")
print(f"  H = {desired_half_width} (desired half-width)")
print("-" * 60)

required_n = n
while True:
    required_n += 1
    t_val = stats.t.ppf(1 - alpha / 2, df=required_n - 1)
    hw = t_val * sample_std / math.sqrt(required_n)
    print(f"  Trying n'={required_n:<4} -> t={t_val:.4f}, half-width={hw:.4f}"
          f"{'  <= 0.5 OK' if hw <= desired_half_width else ''}")
    if hw <= desired_half_width:
        break
    if required_n > 200:   # safety break
        break

print("-" * 60)
print(f"RESULT: At least {required_n} total replications are needed to")
print(f"        achieve a half-width of {desired_half_width} minutes or less.")
print(f"        (That means {required_n - n} MORE replications beyond the")
print(f"        {n} already run.)")
print("=" * 60)
