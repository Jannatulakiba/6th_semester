import random

N = 10000  # number of simulations

total_profit = 0
success = 0

for _ in range(N):

    H = 0
    T = 0
    flips = 0

    # play one game
    while abs(H - T) < 3:
        toss = random.choice(["H", "T"])
        flips += 1

        if toss == "H":
            H += 1
        else:
            T += 1

        # stop condition for safety (max 8 flips)
        if flips >= 8:
            break

    # profit/loss rule
    if abs(H - T) == 3 and flips <= 8:
        profit = 8 - flips   # win money but pay per flip
        success += 1
    else:
        profit = -8          # lose if not achieved in 8 flips

    total_profit += profit

# results
print("Success Probability:", success / N)
print("Expected Profit per Game:", total_profit / N)