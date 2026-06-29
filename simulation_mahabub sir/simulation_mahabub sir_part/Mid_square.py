# -----------------------------
# Mid Square Method
# -----------------------------

seed = 5735        # Initial 4-digit seed
iterations = 10

print("=" * 45)
print(f"{'Step':<5}{'Square':<12}{'Next Seed':<12}")
print("=" * 45)

for step in range(1, iterations + 1):

    # Square the seed
    square = seed * seed

    # Convert to 8 digits
    square_str = str(square).zfill(8)

    # Take middle 4 digits
    middle = square_str[2:6]

    # Next seed
    seed = int(middle)

    print(f"{step:<5}{square_str:<12}{seed:<12}")