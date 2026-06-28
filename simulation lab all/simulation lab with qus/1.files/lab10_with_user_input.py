import random
import matplotlib.pyplot as plt

# ── INPUT ──────────────────────────────────────────
print("=== Machine Breakdown and Maintenance Simulation ===\n")

num_machines   = int(input("Number of machines: "))
mtbf           = float(input("Mean time between failures (hours): "))
weibull_shape  = float(input("Weibull repair shape (k): "))
weibull_scale  = float(input("Weibull repair scale: "))
sim_time       = float(input("Simulation horizon (hours): "))
prod_rate      = float(input("Production rate per machine (units/hour): "))

random.seed(13)

# ── SIMULATION ──────────────────────────────────────
print(f"\n{'Machine':<10} {'Breakdowns':<14} {'Downtime(hr)':<16} {'Uptime(hr)'}")
print("-" * 55)

results = []
for m in range(1, num_machines + 1):
    clock      = 0.0
    downtime   = 0.0
    breakdowns = 0

    while clock < sim_time:
        ttf = random.expovariate(1.0 / mtbf)
        if clock + ttf >= sim_time:
            break
        clock += ttf

        repair = random.weibullvariate(weibull_scale, weibull_shape)
        actual = min(repair, sim_time - clock)
        downtime += actual
        clock    += repair
        breakdowns += 1

    uptime = sim_time - downtime
    results.append((m, breakdowns, downtime, uptime))
    print(f"{m:<10} {breakdowns:<14} {downtime:<16.2f} {uptime:.2f}")

# ── RESULTS ─────────────────────────────────────────
total_uptime   = sum(r[3] for r in results)
total_downtime = sum(r[2] for r in results)
avg_uptime     = total_uptime   / num_machines
avg_downtime   = total_downtime / num_machines
availability   = avg_uptime / sim_time
throughput     = total_uptime * prod_rate

print("\n=== RESULTS ===")
print(f"Average Downtime per Machine : {avg_downtime:.2f} hours")
print(f"Average Uptime per Machine   : {avg_uptime:.2f} hours")
print(f"Machine Availability         : {availability:.4f} ({availability*100:.2f}%)")
print(f"  (avg uptime / simulation_time)")
print(f"System Throughput            : {throughput:.0f} units")
print(f"  (total uptime all machines x production rate)")

# ── GRAPHS ──────────────────────────────────────────
machines    = [r[0] for r in results]
downtimes   = [r[2] for r in results]
uptimes     = [r[3] for r in results]
breakdowns  = [r[1] for r in results]

fig, axes = plt.subplots(1, 2, figsize=(12, 5))
fig.suptitle("Machine Breakdown & Maintenance Simulation", fontsize=13, fontweight='bold')

# 1. Downtime vs Uptime stacked bar
ax = axes[0]
ax.bar(machines, uptimes,   color='steelblue', label='Uptime')
ax.bar(machines, downtimes, color='tomato',    label='Downtime', bottom=uptimes)
ax.axhline(sim_time, color='black', linestyle='--', linewidth=1, label=f'Sim Time ({sim_time:.0f}h)')
ax.set_title('Uptime vs Downtime per Machine')
ax.set_xlabel('Machine'); ax.set_ylabel('Hours')
ax.set_xticks(machines)
ax.legend(fontsize=8); ax.grid(alpha=0.3, axis='y')

# 2. Breakdown count
ax = axes[1]
ax.bar(machines, breakdowns, color='orange')
ax.axhline(sum(breakdowns)/len(breakdowns), color='red', linestyle='--',
           linewidth=1.5, label=f'Avg ({sum(breakdowns)/len(breakdowns):.1f})')
ax.set_title('Breakdown Count per Machine')
ax.set_xlabel('Machine'); ax.set_ylabel('Breakdowns')
ax.set_xticks(machines)
ax.legend(fontsize=8); ax.grid(alpha=0.3, axis='y')

plt.tight_layout()
plt.show()