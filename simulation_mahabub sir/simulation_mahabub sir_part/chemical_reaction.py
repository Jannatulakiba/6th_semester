import numpy as np
import matplotlib.pyplot as plt

# -----------------------------
# Constants
# -----------------------------
k1 = 0.025      # Forward reaction rate
k2 = 0.01       # Reverse reaction rate

dt = 0.1        # Time step
t_max = 15      # Total simulation time

# -----------------------------
# Initial Concentrations
# -----------------------------
A = 50.0
B = 25.0
C = 0.0

# -----------------------------
# Arrays to Store Results
# -----------------------------
time = np.arange(0, t_max + dt, dt)

A_values = []
B_values = []
C_values = []

# -----------------------------
# Euler Simulation
# -----------------------------
for t in time:
    A_values.append(A)
    B_values.append(B)
    C_values.append(C)

    dA = -k1 * A * B + k2 * C
    dB = -k1 * A * B + k2 * C
    dC = 2 * (k1 * A * B - k2 * C)

    A = A + dA * dt
    B = B + dB * dt
    C = C + dC * dt

# -----------------------------
# Display Final Values
# -----------------------------
print("Final Concentrations")
print(f"A = {A:.4f}")
print(f"B = {B:.4f}")
print(f"C = {C:.4f}")

# -----------------------------
# Plot Results
# -----------------------------
plt.figure(figsize=(8,5))
plt.plot(time, A_values, label='A')
plt.plot(time, B_values, label='B')
plt.plot(time, C_values, label='C')

plt.title("Chemical Reaction Simulation (Euler Method)")
plt.xlabel("Time")
plt.ylabel("Concentration")
plt.legend()
plt.grid(True)
plt.show()