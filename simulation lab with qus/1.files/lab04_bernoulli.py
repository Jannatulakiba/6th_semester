"""
Lab 04: Bernoulli Distribution - Microchip Quality Control Test
===================================================================
A chip either PASSES (Success, X=1) or FAILS (Failure, X=0).
Given: probability of success p = 0.85   <-- GIVEN in problem statement

INPUTS:
  p = 0.85  -> given directly in the problem text, so no assumption needed.

No other input is needed for this lab: a Bernoulli distribution is
fully described by a single parameter p. All requested quantities
(P(X=0), E[X], Var(X)) are pure formulas evaluated from p.
"""

# ---------------- INPUT (given in problem) ----------------
p = 0.85          # probability chip passes (Success, X = 1)
q = 1 - p         # probability chip fails   (Failure, X = 0)

print("=" * 55)
print("   BERNOULLI DISTRIBUTION - MICROCHIP QC TEST")
print("=" * 55)
print(f"{'P(Success), p':<25}: {p}")
print(f"{'P(Failure), q = 1-p':<25}: {q:.4f}")
print("=" * 55)

print("\nDefinition of Random Variable X:")
print("  X = 1  -> chip PASSES the test (Success)")
print("  X = 0  -> chip FAILS the test   (Failure)")

# ---------------- CALCULATIONS ----------------
# P(X = 0) -- probability of a defect
P_X0 = q

# Mean: E[X] = p   (Bernoulli mean formula)
E_X = p

# Variance: Var(X) = p * (1 - p) = p * q
Var_X = p * q

print("\n" + "-" * 55)
print("RESULTS")
print("-" * 55)
print(f"P(X = 0)  [probability of a defect]       = {P_X0:.4f}")
print(f"E[X]      [mean / expected value]          = {E_X:.4f}")
print(f"Var(X)    [variance]                       = {Var_X:.4f}")
print("-" * 55)

print("\nHOW EACH RESULT WAS OBTAINED (rules used):")
print(f"  P(X=0) = q = 1 - p = 1 - {p} = {P_X0:.4f}")
print(f"           (Bernoulli PMF rule: P(X=0)=1-p, P(X=1)=p)")
print(f"  E[X]   = p = {E_X:.4f}")
print(f"           (Bernoulli mean formula: E[X] = p)")
print(f"  Var(X) = p(1-p) = {p} x {q:.4f} = {Var_X:.4f}")
print(f"           (Bernoulli variance formula: Var(X) = p*q)")
print("=" * 55)
