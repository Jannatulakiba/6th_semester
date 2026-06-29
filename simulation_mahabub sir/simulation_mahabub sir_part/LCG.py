# -----------------------------
# Linear Congruential Generator (LCG)
# -----------------------------

# Parameters
a = 5          # Multiplier
c = 3          # Increment
m = 16         # Modulus
seed = 7       # Initial Seed (X0)

iterations = 10

print("=" * 45)
print(f"{'Step':<5}{'Xn':<10}{'Random Number':<15}")
print("=" * 45)

X = seed

for step in range(1, iterations + 1):

    # LCG Formula
    X = (a * X + c) % m

    # Random number between 0 and 1
    R = X / m

    print(f"{step:<5}{X:<10}{R:<15.4f}")