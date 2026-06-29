import random
import matplotlib.pyplot as plt

N = 10000
M = 0

x_inside = []
y_inside = []
x_outside = []
y_outside = []

for i in range(N):
    x = random.uniform(2, 5)
    y = random.uniform(0, 140)

    if y <= x**3:
        M += 1
        x_inside.append(x)
        y_inside.append(y)
    else:
        x_outside.append(x)
        y_outside.append(y)


rectangle_area = (5 - 2) * 125
integral_value = (M / N) * rectangle_area

print("Total points (N):", N)
print("Points under curve (M):", M)
print("Estimated Integral:", integral_value)
print("Exact Value:", (5**4 - 2**4)/4)


plt.figure()
plt.scatter(x_inside, y_inside, s=5, color='blue', label='Inside curve')
plt.scatter(x_outside, y_outside, s=5, color='white', label='Outside curve')

xs = [2 + i*(5-2)/200 for i in range(201)]
ys = [x**3 for x in xs]
plt.plot(xs, ys, color='black', linewidth=2, label='y = x^3')

plt.xlabel("x")
plt.ylabel("y")
plt.title("Monte Carlo Simulation for ∫₂⁵ x³ dx")
plt.legend()
plt.show()
