import math
import matplotlib.pyplot as plt

# -------------------------------------------------
# Given Bomber Coordinates
# -------------------------------------------------
xb = [100, 100, 120, 129, 140, 149, 158, 168, 179, 188, 198, 209, 219, 226, 234, 240]
yb = [0, 3, 6, 10, 15, 20, 26, 32, 37, 34, 30, 27, 23, 19, 16, 14]

# -------------------------------------------------
# Initial Fighter Position
# -------------------------------------------------
xf = 0.0
yf = 0.0

# Fighter Speed
Vf = 10.0
dt = 1.0

# Lists for plotting
fighter_x = [xf]
fighter_y = [yf]

# -------------------------------------------------
# Output Header
# -------------------------------------------------
print("=" * 105)
print(f"{'Step':<5}{'Distance':<12}{'Theta(deg)':<15}{'Fighter(x,y)':<30}{'Bomber(x,y)':<30}")
print("=" * 105)

# -------------------------------------------------
# Simulation
# -------------------------------------------------
for i in range(len(xb)):

    # Distance
    D = math.sqrt((xb[i] - xf) ** 2 + (yb[i] - yf) ** 2)

    # Heading Angle
    theta = math.atan2((yb[i] - yf), (xb[i] - xf))

    print(f"{i:<5}{D:<12.2f}{math.degrees(theta):<15.2f}"
          f"({xf:6.2f},{yf:6.2f})      "
          f"({xb[i]:6.2f},{yb[i]:6.2f})")

    # Fighter moves toward Bomber
    xf = xf + Vf * math.cos(theta) * dt
    yf = yf + Vf * math.sin(theta) * dt

    fighter_x.append(xf)
    fighter_y.append(yf)

# -------------------------------------------------
# Plot
# -------------------------------------------------
plt.figure(figsize=(8,6))

plt.plot(xb, yb, 'ro-', label='Bomber Path')
plt.plot(fighter_x, fighter_y, 'bo-', label='Fighter Path')

plt.xlabel("X Position")
plt.ylabel("Y Position")
plt.title("Pure Pursuit Simulation")
plt.grid(True)
plt.legend()

plt.show()