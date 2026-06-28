"""
Lab 12: Random Variates Using the Inverse Transform Method
================================================================
General Inverse Transform technique:
  1. Generate U ~ Uniform(0,1)
  2. Find x = F^-1(U), where F is the CDF of the target distribution.

This lab demonstrates the technique on an EXPONENTIAL distribution
(a very common simulation choice for this lab):
  CDF:      F(x) = 1 - e^(-lambda*x)
  Inverse:  x = F^-1(u) = -ln(1-u) / lambda

INPUTS NEEDED (problem says "generates the desired number of random
variates" - the "desired number" and "lambda" are required but not
specified numerically in the lab text):
  1. lambda (rate parameter of target Exponential distribution)
  2. N       (how many variates desired)

Assumed values: lambda = 2.0, N = 10
"""

import random
import math

# ---------------- INPUT PARAMETERS (assumed) ----------------
lam = 2.0     # rate parameter of target Exponential distribution
N = 10        # number of random variates desired

random.seed(9)

print("=" * 60)
print("   INVERSE TRANSFORM METHOD - EXPONENTIAL VARIATES")
print("=" * 60)
print(f"{'Rate parameter (lambda)':<28}: {lam}")
print(f"{'Number of variates (N)':<28}: {N}")
print("=" * 60)
print("CDF:      F(x) = 1 - e^(-lambda*x)")
print("Inverse:  x = F^-1(u) = -ln(1 - u) / lambda")
print("=" * 60)

print(f"{'i':<5}{'U (uniform)':<16}{'x = -ln(1-U)/lambda':<22}")
print("-" * 60)

variates = []
for i in range(1, N + 1):
    u = random.random()
    x = -math.log(1 - u) / lam
    variates.append(x)
    print(f"{i:<5}{u:<16.4f}{x:<22.4f}")

print("-" * 60)
sample_mean = sum(variates) / N
theoretical_mean = 1 / lam
print(f"Sample mean of generated variates : {sample_mean:.4f}")
print(f"Theoretical mean (1/lambda)        : {theoretical_mean:.4f}")
print("(With more variates, the sample mean converges to 1/lambda")
print(" by the Law of Large Numbers.)")
print("=" * 60)
