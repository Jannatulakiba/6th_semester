"""
Lab 05: Binomial Distribution - Network Packet Delivery
============================================================
A batch of n independent packets, each succeeds with probability p.
This is a BINOMIAL distribution: X = number of successful packets
out of n trials.

INPUTS (all given directly in the problem statement, no assumption
needed):
  n = 15            -> packets per batch
  p = 0.90          -> success probability per packet
  Example data: 5 batches with observed successes: 14, 13, 15, 12, 14
  k = 13             -> the specific value asked about ("exactly 13")
"""

from math import comb

# ---------------- INPUTS (given in problem) ----------------
n = 15                 # number of packets per batch
p = 0.90               # success probability per packet
q = 1 - p              # failure probability
k = 13                 # "exactly 13 packets arrive safely"
observed_data = [14, 13, 15, 12, 14]   # example batch data given in problem

print("=" * 60)
print("   BINOMIAL DISTRIBUTION - NETWORK PACKET DELIVERY")
print("=" * 60)
print(f"{'n (packets per batch)':<28}: {n}")
print(f"{'p (success probability)':<28}: {p}")
print(f"{'q (failure probability)':<28}: {q:.2f}")
print(f"{'k (target exact successes)':<28}: {k}")
print(f"{'Observed batch data':<28}: {observed_data}")
print("=" * 60)

# ---------------- EXACT PROBABILITY: P(X = k) ----------------
# Binomial PMF: P(X=k) = C(n,k) * p^k * q^(n-k)
binom_coeff = comb(n, k)
P_X_k = binom_coeff * (p ** k) * (q ** (n - k))

# ---------------- MEAN AND VARIANCE ----------------
mu = n * p              # Binomial mean formula: mu = n*p
sigma_sq = n * p * q    # Binomial variance formula: sigma^2 = n*p*q
sigma = sigma_sq ** 0.5

# ---------------- DATA VERIFICATION ----------------
avg_observed = sum(observed_data) / len(observed_data)

print("\nRESULTS")
print("-" * 60)
print(f"P(X = {k})  = C({n},{k}) * p^{k} * q^{n-k}")
print(f"           = {binom_coeff} * {p}^{k} * {q:.2f}^{n-k}")
print(f"           = {P_X_k:.4f}  ({P_X_k*100:.2f}%)")
print()
print(f"Theoretical Mean      mu      = n * p       = {n} * {p} = {mu:.2f}")
print(f"Theoretical Variance  sigma^2 = n * p * q    = {n} * {p} * {q:.2f} = {sigma_sq:.4f}")
print(f"Theoretical Std Dev   sigma                  = sqrt({sigma_sq:.4f}) = {sigma:.4f}")
print()
print(f"Average of observed data (5 batches)         = {avg_observed:.2f}")
print(f"Theoretical mean mu                           = {mu:.2f}")
diff = abs(avg_observed - mu)
print(f"Difference (|observed avg - theoretical mu|) = {diff:.2f}")
if diff < 1.0:
    print("  -> Observed average is CLOSE to theoretical mean: model fits well.")
else:
    print("  -> Observed average deviates noticeably from theoretical mean.")
print("=" * 60)
