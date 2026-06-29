import matplotlib.pyplot as plt

# -----------------------------
# Constants
# -----------------------------
k1 = 0.025
k2 = 0.01

dt = 0.1
steps = 20

# -----------------------------
# Initial Concentrations
# -----------------------------
A = 50.0
B = 25.0
C = 0.0

# -----------------------------
# Lists for Graph
# -----------------------------
time = [0]
A_list = [A]
B_list = [B]
C_list = [C]

# -----------------------------
# Output Table Header
# -----------------------------
print("=" * 70)
print(f"{'Step':<5}{'Time':<8}{'A':<15}{'B':<15}{'C':<15}")
print("=" * 70)

print(f"{0:<5}{0.0:<8.1f}{A:<15.4f}{B:<15.4f}{C:<15.4f}")

# -----------------------------
# Euler Simulation
# -----------------------------
for step in range(1, steps + 1):

    dA = -k1 * A * B + k2 * C
    dB = -k1 * A * B + k2 * C
    dC = 2 * (k1 * A * B - k2 * C)

    A = A + dA * dt
    B = B + dB * dt
    C = C + dC * dt

    t = step * dt

    time.append(t)
    A_list.append(A)
    B_list.append(B)
    C_list.append(C)

    print(f"{step:<5}{t:<8.1f}{A:<15.4f}{B:<15.4f}{C:<15.4f}")

# -----------------------------
# Final Output
# -----------------------------
print("=" * 70)
print("\nFinal Concentrations")
print(f"A = {A:.4f}")
print(f"B = {B:.4f}")
print(f"C = {C:.4f}")

# -----------------------------
# Graph
# -----------------------------
plt.figure(figsize=(8,5))

plt.plot(time, A_list, marker='o', label='A')
plt.plot(time, B_list, marker='s', label='B')
plt.plot(time, C_list, marker='^', label='C')

plt.title("Chemical Reaction Simulation (20 Steps)")
plt.xlabel("Time")
plt.ylabel("Concentration")
plt.legend()
plt.grid(True)

plt.show()