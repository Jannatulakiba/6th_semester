"""
Lab 17: Bank ATM System Simulation
=======================================
Customers arrive randomly at an ATM vestibule with several machines
(multi-server queue, M/M/c). Calculate maximum queue length.

INPUTS NEEDED (no numbers given in lab text):
  1. num_atms (c)             -> number of ATM machines
  2. mean_interarrival         -> mean time between customer arrivals
  3. mean_service               -> mean time a customer spends at an ATM
  4. num_customers              -> how many customers to simulate

Assumed: num_atms=2, mean_interarrival=3, mean_service=5,
         num_customers=40
"""

import random
import heapq

# ---------------- INPUT PARAMETERS (assumed) ----------------
num_atms = 2
mean_interarrival = 3.0     # minutes
mean_service = 5.0            # minutes
num_customers = 40

random.seed(23)

print("=" * 65)
print("              BANK ATM SYSTEM SIMULATION")
print("=" * 65)
print(f"{'Number of ATMs (servers)':<30}: {num_atms}")
print(f"{'Mean Inter-Arrival Time':<30}: {mean_interarrival} min")
print(f"{'Mean Service Time':<30}: {mean_service} min")
print(f"{'Number of Customers':<30}: {num_customers}")
print("=" * 65)

# atm_free_at[k] = time ATM k becomes free (min-heap of free times)
atm_free_times = [0.0] * num_atms
heapq.heapify(atm_free_times)

arrival_time = 0.0
queue_length_events = []   # (time, +1/-1) for number waiting in queue
results = []

for i in range(1, num_customers + 1):
    ia = random.expovariate(1.0 / mean_interarrival)
    svc = random.expovariate(1.0 / mean_service)
    arrival_time += ia

    earliest_free = atm_free_times[0]   # the ATM that frees up soonest

    if earliest_free <= arrival_time:
        # an ATM is already free -> no wait
        delay = 0.0
        service_start = arrival_time
    else:
        # all ATMs busy -> customer waits in queue
        delay = earliest_free - arrival_time
        service_start = earliest_free
        queue_length_events.append((arrival_time, +1))
        queue_length_events.append((service_start, -1))

    service_end = service_start + svc
    heapq.heapreplace(atm_free_times, service_end)

    results.append((i, round(arrival_time, 2), round(delay, 2), round(service_end, 2)))

# ---------------- COMPUTE MAX QUEUE LENGTH ----------------
queue_length_events.sort(key=lambda x: x[0])
current_q = 0
max_q = 0
for (_, change) in queue_length_events:
    current_q += change
    max_q = max(max_q, current_q)

print(f"{'Cust#':<8}{'Arrival':<10}{'Delay':<10}{'Departs':<10}")
print("-" * 65)
for row in results:
    print(f"{row[0]:<8}{row[1]:<10}{row[2]:<10}{row[3]:<10}")

avg_delay = sum(r[2] for r in results) / num_customers
num_waited = sum(1 for r in results if r[2] > 0)

print("=" * 65)
print("                      RESULTS")
print("=" * 65)
print(f"Average customer delay        : {avg_delay:.4f} minutes")
print(f"Customers who had to wait     : {num_waited} out of {num_customers} "
      f"({num_waited/num_customers*100:.1f}%)")
print(f"MAXIMUM QUEUE LENGTH           : {max_q} customers")
print("  (Computed by tracking +1 when a customer joins the queue and")
print("   -1 when they leave it to start service; max running total.)")
print("=" * 65)
