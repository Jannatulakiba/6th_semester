import math
import matplotlib.pyplot as plt

# -----------------------------
# Initial Positions
# -----------------------------
Ax, Ay = 0.0, 0.0
Bx, By = 0.0, 10.0
Cx, Cy = 0.0, 20.0
Dx, Dy = 0.0, 30.0

# Target of D
Tx, Ty = 30.0, 50.0

# -----------------------------
# Velocities (km/hr)
# -----------------------------
VA = 30.0
VB = 25.0
VC = 20.0
VD = 15.0

dt = 0.01
time = 0.0

# -----------------------------
# Store paths
# -----------------------------
Ax_list = [Ax]
Ay_list = [Ay]

Bx_list = [Bx]
By_list = [By]

Cx_list = [Cx]
Cy_list = [Cy]

Dx_list = [Dx]
Dy_list = [Dy]

# -----------------------------
# Simulation
# -----------------------------
while True:

    # ---------- D moves toward Target ----------
    dx = Tx - Dx
    dy = Ty - Dy
    dist = math.sqrt(dx**2 + dy**2)

    if dist != 0:
        Dx += VD * dx / dist * dt
        Dy += VD * dy / dist * dt

    # ---------- C chases D ----------
    dx = Dx - Cx
    dy = Dy - Cy
    distCD = math.sqrt(dx**2 + dy**2)

    if distCD != 0:
        Cx += VC * dx / distCD * dt
        Cy += VC * dy / distCD * dt

    # ---------- B chases C ----------
    dx = Cx - Bx
    dy = Cy - By
    distBC = math.sqrt(dx**2 + dy**2)

    if distBC != 0:
        Bx += VB * dx / distBC * dt
        By += VB * dy / distBC * dt

    # ---------- A chases B ----------
    dx = Bx - Ax
    dy = By - Ay
    distAB = math.sqrt(dx**2 + dy**2)

    if distAB != 0:
        Ax += VA * dx / distAB * dt
        Ay += VA * dy / distAB * dt

    time += dt

    Ax_list.append(Ax)
    Ay_list.append(Ay)

    Bx_list.append(Bx)
    By_list.append(By)

    Cx_list.append(Cx)
    Cy_list.append(Cy)

    Dx_list.append(Dx)
    Dy_list.append(Dy)

    # -----------------------------
    # Stop Condition
    # -----------------------------
    if distAB < 0.005:
        print(f"\nA hits B first!")
        print(f"Elapsed Time = {time:.4f} hr")
        break

    if distBC < 0.005:
        print(f"\nB hits C first!")
        print(f"Elapsed Time = {time:.4f} hr")
        break

    if distCD < 0.005:
        print(f"\nC hits D first!")
        print(f"Elapsed Time = {time:.4f} hr")
        break

    if math.sqrt((Tx-Dx)**2 + (Ty-Dy)**2) < 0.005:
        print(f"\nD reached Target first!")
        print(f"Elapsed Time = {time:.4f} hr")
        break

# -----------------------------
# Plot
# -----------------------------
plt.figure(figsize=(8,6))

plt.plot(Ax_list, Ay_list, label='A')
plt.plot(Bx_list, By_list, label='B')
plt.plot(Cx_list, Cy_list, label='C')
plt.plot(Dx_list, Dy_list, label='D')

plt.scatter(Tx, Ty, color='black', marker='*', s=150, label='Target')

plt.xlabel("X")
plt.ylabel("Y")
plt.title("Serial Chase Simulation")
plt.legend()
plt.grid(True)

plt.show()