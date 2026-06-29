import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

num_bombs = 20
mu_x, mu_y = 0, 0
sigma_x = 500
sigma_y = 300

x_min, x_max = -500, 500
y_min, y_max = -300, 300

hits = 0

x_points = []
y_points = []

print(f"{'Bomb':<6} | {'RNN_x':<8} | {'x_pos':<8} | {'RNN_y':<8} | {'y_pos':<8} | {'Result'}")
print("-" * 65)

# 
for i in range(1, num_bombs + 1):
    rnn_x = round(np.random.normal(0, 1), 2)
    rnn_y = round(np.random.normal(0, 1), 2)

    x = mu_x + sigma_x * rnn_x
    y = mu_y + sigma_y * rnn_y

    x_points.append(x)
    y_points.append(y)

    if x_min <= x <= x_max and y_min <= y <= y_max:
        result = "Hit"
        hits += 1
    else:
        result = "Miss"

    print(f"{i:<6} | {rnn_x:<8} | {x:<8.0f} | {rnn_y:<8} | {y:<8.0f} | {result}")

hit_percentage = (hits / num_bombs) * 100
print("-" * 65)
print(f"Total Hits: {hits}")
print(f"Total Misses: {num_bombs - hits}")
print(f"Success Rate: {hit_percentage}%")

plt.figure()
plt.scatter(x_points, y_points)

rect = Rectangle(
    (x_min, y_min),
    x_max - x_min,
    y_max - y_min,
    fill=False
)
plt.gca().add_patch(rect)

plt.axhline(0)
plt.axvline(0)

plt.xlabel("X Position")
plt.ylabel("Y Position")
plt.title("Bomb Impact Simulation")

plt.show()
