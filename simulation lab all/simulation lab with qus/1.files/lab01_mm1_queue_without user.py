"""
Lab 01: M/M/1 Queue Simulation
================================
Single-server queue, FIFO discipline.
Inter-arrival time ~ Exponential(mean = mean_interarrival)
Service time      ~ Exponential(mean = mean_service)

INPUTS NEEDED (must be given by user/problem):
  1. mean_interarrival  -> Mean Inter-Arrival time of customers
  2. mean_service        -> Mean Service time
  3. max_customers       -> Maximum number of customers to simulate

These 3 values are NOT computable from anything else in this lab -
they are external parameters that DEFINE the system, so they must be
supplied as input. The lab sheet gave no numeric values, so the
following realistic sample values are assumed:
    mean_interarrival = 5 minutes
    mean_service      = 4 minutes   (so utilization rho = 4/5 = 0.8 < 1,
                                      otherwise the queue grows forever)
    max_customers     = 20
"""

import random

# ---------------- INPUT PARAMETERS ----------------
mean_interarrival = 5.0   # minutes  (assumed input)
mean_service = 4.0        # minutes  (assumed input)
max_customers = 10       # assumed input

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
