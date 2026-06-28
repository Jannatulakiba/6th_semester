import random
import matplotlib.pyplot as plt

# ── INPUT ──────────────────────────────────────────
print("=== Fast-Food Drive-Thru Simulation ===\n")

mean_interarrival = float(input("Mean inter-arrival time (min): "))
mean_order_time   = float(input("Mean order stage time (min): "))
mean_pay_time     = float(input("Mean pay stage time (min): "))
mean_pickup_time  = float(input("Mean pickup stage time (min): "))
num_cars          = int(input("Number of cars: "))

random.seed(31)

# ── SIMULATION ──────────────────────────────────────
stage_free     = {"order": 0.0, "pay": 0.0, "pickup": 0.0}
stage_busy     = {"order": 0.0, "pay": 0.0, "pickup": 0.0}
arrival_time   = 0.0
records        = []

for i in range(1, num_cars + 1):
    ia           = random.expovariate(1.0 / mean_interarrival)
    t_order      = random.expovariate(1.0 / mean_order_time)
    t_pay        = random.expovariate(1.0 / mean_pay_time)
    t_pickup     = random.expovariate(1.0 / mean_pickup_time)
    arrival_time += ia

    order_start  = max(arrival_time, stage_free["order"])
    order_end    = order_start + t_order
    stage_free["order"]  = order_end
    stage_busy["order"] += t_order

    pay_start    = max(order_end, stage_free["pay"])
    pay_end      = pay_start + t_pay
    stage_free["pay"]    = pay_end
    stage_busy["pay"]   += t_pay

    pickup_start = max(pay_end, stage_free["pickup"])
    pickup_end   = pickup_start + t_pickup
    stage_free["pickup"]  = pickup_end
    stage_busy["pickup"] += t_pickup

    total_time   = pickup_end - arrival_time
    records.append((i, round(arrival_time,2), round(order_end,2),
                    round(pay_end,2), round(pickup_end,2), round(total_time,2)))

# ── RESULTS ─────────────────────────────────────────
print(f"\n{'Car#':<6} {'Arrival':<10} {'OrderEnd':<11} {'PayEnd':<10} {'PickupEnd':<11} {'TotalTime'}")
print("-" * 55)
for r in records:
    print(f"{r[0]:<6} {r[1]:<10} {r[2]:<11} {r[3]:<10} {r[4]:<11} {r[5]}")

end_time    = max(stage_free.values())
utilization = {s: stage_busy[s] / end_time for s in stage_busy}
bottleneck  = max(utilization, key=utilization.get)
avg_total   = sum(r[5] for r in records) / num_cars

print(f"\n=== RESULTS ===")
print(f"{'Stage':<10} {'Utilization'}")
print("-" * 25)
for stage, u in utilization.items():
    marker = "  <- BOTTLENECK" if stage == bottleneck else ""
    print(f"{stage:<10} {u:.4f}{marker}")
print(f"\nAverage total time per car : {avg_total:.4f} min")
print(f"Bottleneck stage           : {bottleneck} ({utilization[bottleneck]*100:.2f}% busy)")

# ── GRAPHS ──────────────────────────────────────────
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
fig.suptitle("Fast-Food Drive-Thru Simulation", fontsize=13, fontweight='bold')

# 1. Total time per car
ax = axes[0]
total_times = [r[5] for r in records]
ax.bar(range(1, num_cars+1), total_times, color='steelblue', edgecolor='white')
ax.axhline(avg_total, color='red', linestyle='--', linewidth=1.5,
           label=f'Avg ({avg_total:.2f} min)')
ax.set_title('Total Time per Car')
ax.set_xlabel('Car #'); ax.set_ylabel('Time (min)')
ax.legend(fontsize=8); ax.grid(alpha=0.3, axis='y')

# 2. Stage utilization bar
ax = axes[1]
stages = list(utilization.keys())
utils  = list(utilization.values())
colors = ['tomato' if s == bottleneck else 'steelblue' for s in stages]
bars   = ax.bar(stages, utils, color=colors, edgecolor='white')
ax.axhline(1.0, color='black', linestyle='--', linewidth=1, label='100% busy')
for bar, val in zip(bars, utils):
    ax.text(bar.get_x() + bar.get_width()/2, val + 0.01,
            f'{val*100:.1f}%', ha='center', fontsize=10)
ax.set_title('Stage Utilization\n(red = bottleneck)')
ax.set_ylabel('Utilization'); ax.set_ylim(0, 1.1)
ax.legend(fontsize=8); ax.grid(alpha=0.3, axis='y')

plt.tight_layout()
plt.show()