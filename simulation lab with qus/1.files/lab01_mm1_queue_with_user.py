"""
Lab 01: M/M/1 Queue Simulation
================================
Single-server queue, FIFO discipline.
Inter-arrival time ~ Exponential(mean = mean_interarrival)
Service time      ~ Exponential(mean = mean_service)

INPUTS NEEDED (taken from the USER at runtime, via input()):
  1. mean_interarrival  -> Mean Inter-Arrival time of customers
  2. mean_service        -> Mean Service time
  3. max_customers       -> Maximum number of customers to simulate

These 3 values are NOT computable from anything else in this lab -
they are external parameters that DEFINE the system, so the program
asks the user to type them in when it runs.
NOTE: for a stable queue (one that doesn't grow forever), mean_service
should be LESS than mean_interarrival, i.e. utilization rho =
mean_service / mean_interarrival should be < 1.
"""

import random
# pyrefly: ignore [missing-import]
import matplotlib.pyplot as plt

# ---------------- INPUT PARAMETERS (from user) ----------------
mean_interarrival = float(input("Enter Mean Inter-Arrival Time (minutes): "))
mean_service = float(input("Enter Mean Service Time (minutes): "))
max_customers = int(input("Enter Number of Customers to simulate: "))

random.seed(42)  # fixed seed -> reproducible output

print("=" * 60)
print("              M/M/1 QUEUE SIMULATION")
print("=" * 60)
print(f"{'Mean Inter-Arrival Time':<30}: {mean_interarrival} min")
print(f"{'Mean Service Time':<30}: {mean_service} min")
print(f"{'Number of Customers':<30}: {max_customers}")
print("=" * 60)

# ---------------- EVENT-DRIVEN SIMULATION ----------------
interarrivals = [random.expovariate(1.0 / mean_interarrival) for _ in range(max_customers)]
services = [random.expovariate(1.0 / mean_service) for _ in range(max_customers)]

arrival_times = []
t = 0.0
for ia in interarrivals:
    t += ia
    arrival_times.append(t)

service_start = [0.0] * max_customers
service_end = [0.0] * max_customers
delay = [0.0] * max_customers

for i in range(max_customers):
    if i == 0:
        service_start[i] = arrival_times[i]
    else:
        service_start[i] = max(arrival_times[i], service_end[i - 1])
    delay[i] = service_start[i] - arrival_times[i]
    service_end[i] = service_start[i] + services[i]

simulation_end_time = service_end[-1]

# Number-in-queue (waiting, excluding the one being served) tracked via events
events = []
for i in range(max_customers):
    if delay[i] > 1e-9:
        events.append((arrival_times[i], +1))
        events.append((service_start[i], -1))

events.sort(key=lambda x: x[0])

area_num_in_queue = 0.0
num_in_queue = 0
prev_time = 0.0
for (etime, change) in events:
    area_num_in_queue += num_in_queue * (etime - prev_time)
    num_in_queue += change
    prev_time = etime
area_num_in_queue += num_in_queue * (simulation_end_time - prev_time)

avg_num_in_queue = area_num_in_queue / simulation_end_time

# ---------------- OUTPUT TABLE ----------------
print(f"{'Cust#':<6}{'Arrival':<10}{'InterArr':<10}{'Service':<10}{'Delay':<10}{'Departs':<10}")
print("-" * 60)
for i in range(max_customers):
    print(f"{i+1:<6}{arrival_times[i]:<10.2f}{interarrivals[i]:<10.2f}"
          f"{services[i]:<10.2f}{delay[i]:<10.2f}{service_end[i]:<10.2f}")

# ---------------- PERFORMANCE METRICS ----------------
avg_delay_in_queue = sum(delay) / max_customers
total_service_time = sum(services)
server_utilization = total_service_time / simulation_end_time

print("=" * 60)
print("                    RESULTS")
print("=" * 60)
print(f"Average delay in queue   : {avg_delay_in_queue:.4f} minutes")
print(f"Average number in queue  : {avg_num_in_queue:.4f} customers")
print(f"Server utilization      : {server_utilization:.4f}  ({server_utilization*100:.2f}%)")
print(f"Time simulation ended    : {simulation_end_time:.4f} minutes")
print("=" * 60)

# ---------------- GRAPH 1: Number in Queue Over Time ----------------
# Rebuild the running queue-length curve point by point from the same
# events list used to compute avg_num_in_queue, so the graph matches
# the printed "Average number in queue" result exactly.
times_for_plot = [0.0]
queue_for_plot = [0]
running_q = 0
prev_t = 0.0
for (etime, change) in events:
    times_for_plot.append(etime)
    queue_for_plot.append(running_q)   # value just BEFORE the change
    running_q += change
    times_for_plot.append(etime)
    queue_for_plot.append(running_q)   # value just AFTER the change
    prev_t = etime
times_for_plot.append(simulation_end_time)
queue_for_plot.append(running_q)

plt.figure(figsize=(9, 4))
plt.step(times_for_plot, queue_for_plot, where="post", color="steelblue")
plt.fill_between(times_for_plot, queue_for_plot, step="post", alpha=0.3, color="steelblue")
plt.axhline(avg_num_in_queue, color="red", linestyle="--",
            label=f"Average number in queue = {avg_num_in_queue:.4f}")
plt.title("M/M/1 Queue: Number of Customers Waiting Over Time")
plt.xlabel("Time (minutes)")
plt.ylabel("Number in queue")
plt.legend()
plt.tight_layout()

# ---------------- GRAPH 2: Delay per Customer ----------------
plt.figure(figsize=(9, 4))
customer_numbers = list(range(1, max_customers + 1))
plt.bar(customer_numbers, delay, color="darkorange", edgecolor="black")
plt.axhline(avg_delay_in_queue, color="red", linestyle="--",
            label=f"Average delay = {avg_delay_in_queue:.4f} min")
plt.title("M/M/1 Queue: Waiting Delay per Customer")
plt.xlabel("Customer number")
plt.ylabel("Delay in queue (minutes)")
plt.legend()
plt.tight_layout()


plt.show()