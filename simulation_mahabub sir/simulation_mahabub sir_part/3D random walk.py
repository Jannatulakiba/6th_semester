import random
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# Take input
n = int(input("Enter number of steps: "))

# Starting position
x, y, z = 0, 0, 0

# Store path
x_positions = [x]
y_positions = [y]
z_positions = [z]

# Simulation
for _ in range(n):
    r = random.randint(0, 5)  # 6 possible directions

    if r == 0:        # Forward
        y += 1
    elif r == 1:      # Backward
        y -= 1
    elif r == 2:      # Left
        x -= 1
    elif r == 3:      # Right
        x += 1
    elif r == 4:      # Up
        z += 1
    else:             # Down
        z -= 1

    # Store new position
    x_positions.append(x)
    y_positions.append(y)
    z_positions.append(z)

# Final position
print(f"Final Position: ({x}, {y}, {z})")

# Plot 3D path
fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')

ax.plot(x_positions, y_positions, z_positions, marker='o')

# Mark start and end
ax.scatter(0, 0, 0, s=100, label="Start")
ax.scatter(x, y, z, s=100, label="End")

ax.set_xlabel("X-axis")
ax.set_ylabel("Y-axis")
ax.set_zlabel("Z-axis")
ax.set_title("3D Random Walk Simulation")

ax.legend()

plt.show()