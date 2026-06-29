"""
Example 4.10 : Poker Test

A sequence of 10,000 random numbers, each of four digits,
has been generated.

Observed Results:

Four different digits      = 5120
One pair                   = 4230
Two pairs                  = 560
Three of one kind          = 75
Four of one kind           = 15

Test whether the random numbers are independent
using Poker Test at α = 0.05.
"""

import scipy.stats as stats

# -------------------------------
# Total Numbers
# -------------------------------
N = 10000

# -------------------------------
# Observed Frequencies
# -------------------------------
observed = [
    5120,   # Four different digits
    4230,   # One Pair
    560,    # Two Pairs
    75,     # Three of one kind
    15      # Four of one kind
]

# -------------------------------
# Expected Probabilities
# -------------------------------
probability = [
    0.5040,   # Four different digits
    0.4320,   # One Pair
    0.0270,   # Two Pairs
    0.0360,   # Three of one kind
    0.0010    # Four of one kind
]

# -------------------------------
# Expected Frequencies
# -------------------------------
expected = [N * p for p in probability]

print("=" * 70)
print(f"{'Category':<25}{'Observed':<12}{'Expected':<12}{'Chi'}")
print("=" * 70)

chi_square = 0

categories = [
    "Four Different",
    "One Pair",
    "Two Pairs",
    "Three of Kind",
    "Four of Kind"
]

for i in range(5):

    chi = ((observed[i] - expected[i]) ** 2) / expected[i]

    chi_square += chi

    print(f"{categories[i]:<25}{observed[i]:<12}{expected[i]:<12.2f}{chi:.4f}")

print("=" * 70)

print(f"\nCalculated Chi-Square = {chi_square:.4f}")

# -------------------------------
# Critical Value
# -------------------------------
df = len(observed) - 1

critical = stats.chi2.ppf(0.95, df)

print(f"Critical Value = {critical:.4f}")

if chi_square < critical:
    print("\nResult : Accept H0")
    print("Random numbers are Independent.")
else:
    print("\nResult : Reject H0")
    print("Random numbers are NOT Independent.")