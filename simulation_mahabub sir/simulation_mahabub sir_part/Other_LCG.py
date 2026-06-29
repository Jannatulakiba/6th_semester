# ------------------------------------
# Common Congruential Generator
# ------------------------------------

a = 5          # Multiplier
c = 3          # Increment
m = 16         # Modulus
X = 7          # Initial Seed

iterations = 10

print("=" * 45)
print(f"{'Step':<5}{'Xn':<10}{'Random Number'}")
print("=" * 45)

for step in range(1, iterations + 1):

    # >>> CHANGE ONLY THIS FORMULA <<<
    #Linear Congruential Generator X=(a * X + c) % m
    #Mixed Multiplicative Congruential Generator X = (a * X + c) % m
    #Additive Congruential Generator X = (X + c) % m
    #Arithmetic Congruential GeneratorX = (X + c) % m
     

    X = (a * X + c) % m

    # -------------------------------

    R = X / m

    print(f"{step:<5}{X:<10}{R:.4f}")