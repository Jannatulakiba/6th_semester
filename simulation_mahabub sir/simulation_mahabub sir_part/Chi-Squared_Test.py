import math

# ----------------------------------------
# Random Numbers (0 to 1)
# ----------------------------------------
random_numbers = [
    0.12, 0.27, 0.35, 0.41, 0.55,
    0.63, 0.71, 0.82, 0.91, 0.96
]

# ----------------------------------------
# Chi-Square Test Function
# ----------------------------------------
def chi_square_test(random_numbers, k):

    n = len(random_numbers)
    expected = n / k

    observed = [0] * k

    # Count observations in each interval
    for number in random_numbers:

        index = min(int(number * k), k - 1)

        observed[index] += 1

    print("=" * 65)
    print(f"{'Class':<10}{'Observed':<15}{'Expected':<15}{'(O-E)^2/E'}")
    print("=" * 65)

    chi_square = 0

    for i in range(k):

        value = ((observed[i] - expected) ** 2) / expected

        chi_square += value

        print(f"{i+1:<10}{observed[i]:<15}{expected:<15.2f}{value:.4f}")

    print("=" * 65)

    print("Chi-Square Statistic =", round(chi_square,4))

    # Critical Value for df = k-1 at alpha=0.05
    critical = {
        2:5.991,
        3:7.815,
        4:9.488,
        5:11.070,
        6:12.592,
        7:14.067,
        8:15.507,
        9:16.919,
        10:18.307
    }

    df = k - 1

    if df in critical:

        print("Critical Value =", critical[df])

        if chi_square < critical[df]:
            print("\nAccept H0 (Uniform Distribution)")
        else:
            print("\nReject H0 (Not Uniform Distribution)")

# ----------------------------------------
# Run
# ----------------------------------------
chi_square_test(random_numbers, 5)