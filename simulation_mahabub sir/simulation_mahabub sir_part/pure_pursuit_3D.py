import math
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# -------------------------------------------------
# Given Bomber Coordinates (3D)
# -------------------------------------------------
xb = [100, 100, 120, 129, 140, 149, 158, 168, 179, 188, 198, 209, 219, 226, 234, 240]
yb = [0, 3, 6, 10, 15, 20, 26, 32, 37, 34, 30, 27, 23, 19, 16, 14]
zb = [0, 5, 10, 15, 20, 25, 28, 30, 32, 30, 28, 25, 20, 15, 10, 5]

# -------------------------------------------------
# Initial Fighter Position
# -------------------------------------------------
xf = 0.0
yf = 0.0
zf = 0.0

# Fighter Speed
Vf = 10.0
dt = 1.0

# Store Fighter Path
fighter_x = [xf]
fighter_y = [yf]
fighter_z = [zf]

# -------------------------------------------------
# Output Header
# -------------------------------------------------
print("=" * 120)
print(f"{'Step':<5}{'Distance':<12}{'Fighter(x,y,z)':<40}{'Bomber(x,y,z)':<40}")
print("=" * 120)

# -------------------------------------------------
# Simulation
# -------------------------------------------------
for i in range(len(xb)):

    dx = xb[i] - xf
    dy = yb[i] - yf
    dz = zb[i] - zf

    # 3D Distance
    D = math.sqrt(dx**2 + dy**2 + dz**2)

    print(f"{i:<5}{D:<12.2f}"
          f"({xf:6.2f},{yf:6.2f},{zf:6.2f})      "
          f"({xb[i]:6.2f},{yb[i]:6.2f},{zb[i]:6.2f})")

    # Direction Cosines
    cosx = dx / D
    cosy = dy / D
    cosz = dz / D

    # Fighter Movement
    xf = xf + Vf * cosx * dt
    yf = yf + Vf * cosy * dt
    zf = zf + Vf * cosz * dt

    fighter_x.append(xf)
    fighter_y.append(yf)
    fighter_z.append(zf)

# -------------------------------------------------
# 3D Plot
# -------------------------------------------------
fig = plt.figure(figsize=(8,6))
ax = fig.add_subplot(111, projection='3d')

ax.plot(xb, yb, zb, 'ro-', label='Bomber Path')
ax.plot(fighter_x, fighter_y, fighter_z, 'bo-', label='Fighter Path')

ax.set_xlabel("X")
ax.set_ylabel("Y")
ax.set_zlabel("Z")
ax.set_title("3D Pure Pursuit Simulation")

ax.legend()

plt.show()