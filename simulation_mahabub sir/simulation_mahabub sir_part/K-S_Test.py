import math

# ------------------------------------
# Random Numbers
# ------------------------------------
random_numbers = [
    0.12, 0.27, 0.35, 0.41, 0.55,
    0.63, 0.71, 0.82, 0.91, 0.96
]

# ------------------------------------
# Kolmogorov-Smirnov Test Function
# ------------------------------------
def kolmogorov(random_numbers, alpha=0.05):

    n = len(random_numbers)

    # Step 1: Sort the numbers
    sorted_numbers = sorted(random_numbers)

    print("=" * 75)
    print(f"{'i':<5}{'Ri':<10}{'i/n':<10}{'(i-1)/n':<10}{'D+':<15}{'D-'}")
    print("=" * 75)

    d_plus = 0
    d_minus = 0

    for i in range(n):

        Ri = sorted_numbers[i]

        Dplus = (i + 1) / n - Ri
        Dminus = Ri - i / n

        d_plus = max(d_plus, Dplus)
        d_minus = max(d_minus, Dminus)

        print(f"{i+1:<5}{Ri:<10.4f}{(i+1)/n:<10.4f}{i/n:<10.4f}{Dplus:<15.4f}{Dminus:.4f}")

    D = max(d_plus, d_minus)

    # Critical Value (alpha = 0.05)
    D_critical = 1.36 / math.sqrt(n)

    print("\n")
    print("=" * 40)
    print(f"D+ = {d_plus:.4f}")
    print(f"D- = {d_minus:.4f}")
    print(f"D  = {D:.4f}")
    print(f"Critical Value = {D_critical:.4f}")

    if D < D_critical:
        print("\nResult : Random Numbers are Uniform (Accept H0)")
    else:
        print("\nResult : Random Numbers are NOT Uniform (Reject H0)")

# ------------------------------------
# Run
# ------------------------------------
kolmogorov(random_numbers)