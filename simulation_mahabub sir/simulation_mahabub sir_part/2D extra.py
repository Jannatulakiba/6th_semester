import random
import matplotlib.pyplot as plt

# Take input
n = int(input("Enter number of steps: "))

# Starting position
x, y = 0, 0

# Store path
x_positions = [x]
y_positions = [y]

# Simulation
for _ in range(n):
    r = random.randint(0, 9)  # 10 possible values

    if r in [0, 1, 2, 3]:      # Forward (40%)
        y += 1
    elif r in [4, 5]:          # Backward (20%)
        y -= 1
    elif r in [6, 7]:          # Left (20%)
        x -= 1
    else:                      # Right (20%)
        x += 1

    # Store position
    x_positions.append(x)
    y_positions.append(y)

# Final position
print(f"Final Position: ({x}, {y})")

# Plot path
plt.figure(figsize=(6,6))
plt.plot(x_positions, y_positions, marker='o')

# Mark start and end
plt.scatter(0, 0, s=100, label="Start")
plt.scatter(x, y, s=100, label="End")

plt.xlabel("X-axis")
plt.ylabel("Y-axis")
plt.title("2D Random Walk with Forward & Backward")

plt.legend()
plt.grid()
plt.axis("equal")

plt.show()