"""
Lab 10: Machine Breakdown and Maintenance
==============================================
A workshop has 5 identical machines. Time between breakdowns is
Exponentially distributed. Repair time follows a Weibull distribution.
Calculate machine downtime and overall system throughput.

INPUTS NEEDED (problem only gives the STRUCTURE, no numeric values):
  1. num_machines = 5            -> given directly in problem
  2. mean_time_between_failures   -> needed for Exponential breakdown model
  3. weibull_shape, weibull_scale -> needed for Weibull repair-time model
  4. simulation_time              -> total time horizon to simulate
  5. production_rate_per_machine  -> units/hour when machine is running
                                      (needed to compute "throughput")

Items 2-5 are not stated in the lab sheet, so realistic sample values
are assumed below.
"""

import random

# ---------------- INPUT PARAMETERS ----------------
num_machines = 5                  # given
mean_time_between_failures = 50    # hours (assumed)
weibull_shape = 1.5                 # assumed (k)
weibull_scale = 8.0                 # assumed (lambda), mean repair ~ scale*Gamma(1+1/k)
simulation_time = 500               # hours (assumed)
production_rate_per_machine = 10    # units/hour while running (assumed)

random.seed(13)

print("=" * 65)
print("        MACHINE BREAKDOWN AND MAINTENANCE SIMULATION")
print("=" * 65)
print(f"{'Number of Machines':<32}: {num_machines}")
print(f"{'Mean Time Between Failures':<32}: {mean_time_between_failures} hours")
print(f"{'Weibull Repair Shape (k)':<32}: {weibull_shape}")
print(f"{'Weibull Repair Scale (lambda)':<32}: {weibull_scale}")
print(f"{'Simulation Horizon':<32}: {simulation_time} hours")
print(f"{'Production Rate/Machine':<32}: {production_rate_per_machine} units/hour")
print("=" * 65)

machine_results = []

for m in range(1, num_machines + 1):
    clock = 0.0
    total_downtime = 0.0
    breakdown_count = 0

    while clock < simulation_time:
        time_to_failure = random.expovariate(1.0 / mean_time_between_failures)
        if clock + time_to_failure >= simulation_time:
            break  # next failure would occur after horizon ends
        clock += time_to_failure

        # machine breaks down -> repair time ~ Weibull(shape, scale)
        # Python's random.weibullvariate(alpha, beta) takes alpha=scale, beta=shape
        repair_time = random.weibullvariate(weibull_scale, weibull_shape)

        # repair cannot extend past the simulation horizon
        actual_repair = min(repair_time, simulation_time - clock)
        total_downtime += actual_repair
        clock += repair_time
        breakdown_count += 1

    uptime = simulation_time - total_downtime
    machine_results.append((m, breakdown_count, total_downtime, uptime))

print(f"{'Machine':<10}{'Breakdowns':<14}{'Downtime(hr)':<16}{'Uptime(hr)':<14}")
print("-" * 65)
total_uptime_all = 0
total_downtime_all = 0
for (m, bc, dt, ut) in machine_results:
    print(f"{m:<10}{bc:<14}{dt:<16.2f}{ut:<14.2f}")
    total_uptime_all += ut
    total_downtime_all += dt

avg_downtime = total_downtime_all / num_machines
avg_uptime = total_uptime_all / num_machines
availability = avg_uptime / simulation_time

# Throughput = total units produced by all machines while running
throughput = total_uptime_all * production_rate_per_machine

print("=" * 65)
print("                       RESULTS")
print("=" * 65)
print(f"Average Downtime per Machine : {avg_downtime:.2f} hours")
print(f"Average Uptime per Machine   : {avg_uptime:.2f} hours")
print(f"Machine Availability         : {availability:.4f} ({availability*100:.2f}%)")
print(f"  (Availability = avg uptime / simulation_time)")
print(f"System Throughput            : {throughput:.0f} units")
print(f"  (Throughput = total uptime (all machines) x production rate/hr)")
print("=" * 65)
