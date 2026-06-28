import random
import heapq
import matplotlib.pyplot as plt

# ── INPUT ──────────────────────────────────────────
print("=== Bank ATM System Simulation ===\n")

num_atms          = int(input("Number of ATMs: "))
mean_interarrival = float(input("Mean inter-arrival time (min): "))
mean_service      = float(input("Mean service time (min): "))
num_customers     = int(input("Number of customers: "))

random.seed(23)

# ── SIMULATION ──────────────────────────────────────
atm_free_times = [0.0] * num_atms
heapq.heapify(atm_free_times)

arrival_time        = 0.0
queue_events        = []
results             = []

for i in range(1, num_customers + 1):
    ia           = random.expovariate(1.0 / mean_interarrival)
    svc          = random.expovariate(1.0 / mean_service)
    arrival_time += ia

    earliest_free = atm_free_times[0]

    if earliest_free <= arrival_time:
        delay         = 0.0
        service_start = arrival_time
    else:
        delay         = earliest_free - arrival_time
        service_start = earliest_free
        queue_events.append((arrival_time,  +1))
        queue_events.append((service_start, -1))

    service_end = service_start + svc
    heapq.heapreplace(atm_free_times, service_end)
    results.append((i, round(arrival_time, 2), round(delay, 2), round(service_end, 2)))

# ── MAX QUEUE ───────────────────────────────────────
queue_events.sort(key=lambda x: x[0])
current_q = 0
max_q     = 0
for (_, change) in queue_events:
    current_q += change
    max_q      = max(max_q, current_q)

# ── OUTPUT ─────────────────────────────────────────
print(f"\n{'Cust#':<8} {'Arrival':<10} {'Delay':<10} {'Departs'}")
print("-" * 42)
for row in results:
    print(f"{row[0]:<8} {row[1]:<10} {row[2]:<10} {row[3]}")

avg_delay  = sum(r[2] for r in results) / num_customers
num_waited = sum(1 for r in results if r[2] > 0)

print(f"\n=== RESULTS ===")
print(f"Average delay             : {avg_delay:.4f} min")
print(f"Customers waited          : {num_waited} out of {num_customers} ({num_waited/num_customers*100:.1f}%)")
print(f"Maximum queue length      : {max_q} customers")

# ── GRAPHS ──────────────────────────────────────────
arrivals  = [r[1] for r in results]
delays    = [r[2] for r in results]
departs   = [r[3] for r in results]

fig, axes = plt.subplots(1, 2, figsize=(12, 5))
fig.suptitle(f"Bank ATM Simulation  ({num_atms} ATMs, {num_customers} customers)", fontsize=13, fontweight='bold')

# 1. Delay per customer
ax = axes[0]
colors = ['tomato' if d > 0 else 'steelblue' for d in delays]
ax.bar(range(1, num_customers+1), delays, color=colors)
ax.axhline(avg_delay, color='green', linestyle='--', linewidth=1.5,
           label=f'Avg Delay ({avg_delay:.2f} min)')
ax.set_title('Delay per Customer')
ax.set_xlabel('Customer #'); ax.set_ylabel('Delay (min)')
ax.legend(fontsize=8); ax.grid(alpha=0.3, axis='y')

from matplotlib.patches import Patch
ax.legend(handles=[
    Patch(color='tomato',    label='Waited'),
    Patch(color='steelblue', label='No wait'),
    plt.Line2D([0], [0], color='green', linestyle='--', label=f'Avg ({avg_delay:.2f} min)')
], fontsize=8)

# 2. Queue length over time
ax = axes[1]
times   = [0]
qlengths = [0]
current_q = 0
for (t, change) in queue_events:
    times.append(t)
    qlengths.append(current_q)
    current_q += change
    times.append(t)
    qlengths.append(current_q)
ax.plot(times, qlengths, color='steelblue', linewidth=1.5)
ax.axhline(max_q, color='red', linestyle='--', linewidth=1.5, label=f'Max Queue ({max_q})')
ax.set_title('Queue Length Over Time')
ax.set_xlabel('Time (min)'); ax.set_ylabel('Queue Length')
ax.legend(fontsize=8); ax.grid(alpha=0.3)

plt.tight_layout()
plt.show()