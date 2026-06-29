import math

# ----------------------------------------
# Random Numbers (1 - 100)
# ----------------------------------------
random_numbers = [
    12, 45, 67, 23, 89, 34, 76, 55, 91, 28,
    49, 72, 14, 60, 83, 39, 95, 11, 58, 79
]

# ----------------------------------------
# Auto-Correlation Test
# ----------------------------------------
def auto_correlation(random_numbers):

    observed = [0] * 9

    # Adjacent pairs
    for i in range(len(random_numbers) - 1):

        r1 = random_numbers[i]
        r2 = random_numbers[i + 1]

        # Row 1
        if r1 <= 33 and r2 <= 33:
            observed[0] += 1
        elif r1 <= 67 and r2 <= 33:
            observed[1] += 1
        elif r1 <= 100 and r2 <= 33:
            observed[2] += 1

        # Row 2
        elif r1 <= 33 and r2 <= 67:
            observed[3] += 1
        elif r1 <= 67 and r2 <= 67:
            observed[4] += 1
        elif r1 <= 100 and r2 <= 67:
            observed[5] += 1

        # Row 3
        elif r1 <= 33 and r2 <= 100:
            observed[6] += 1
        elif r1 <= 67 and r2 <= 100:
            observed[7] += 1
        elif r1 <= 100 and r2 <= 100:
            observed[8] += 1

    total_pairs = len(random_numbers) - 1
    expected = total_pairs / 9

    print("=" * 55)
    print(f"{'Class':<10}{'Observed':<15}{'Expected'}")
    print("=" * 55)

    chi_square = 0

    for i in range(9):

        chi = ((observed[i] - expected) ** 2) / expected
        chi_square += chi

        print(f"{i+1:<10}{observed[i]:<15}{expected:.2f}")

    print("=" * 55)

    print("Chi-Square Statistic =", round(chi_square,4))

    critical = 15.507      # df = 8, alpha = 0.05

    print("Critical Value =", critical)

    if chi_square < critical:
        print("\nAccept H0")
        print("Random numbers are Independent.")
    else:
        print("\nReject H0")
        print("Random numbers are NOT Independent.")

# ----------------------------------------
# Run
# ----------------------------------------
auto_correlation(random_numbers)