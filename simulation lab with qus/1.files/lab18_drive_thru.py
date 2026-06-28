"""
Lab 18: Fast-Food Drive-Thru Model
========================================
Three sequential stages: ORDER -> PAY -> PICK UP.
Single lane (cars go through stages in order, FIFO, single server per
stage - like a 3-stage tandem queue). Identify the system's bottleneck
(the stage with the longest average processing time / highest
utilization).

INPUTS NEEDED (no numbers given in lab text):
  1. mean_interarrival         -> mean time between car arrivals
  2. mean_order_time, mean_pay_time, mean_pickup_time -> per-stage service times
  3. num_cars                   -> how many cars to simulate

Assumed: mean_interarrival=2, mean_order_time=1.5, mean_pay_time=0.5,
         mean_pickup_time=2.5 (pick-up is the slowest -> likely bottleneck),
         num_cars=30
"""

import random

# ---------------- INPUT PARAMETERS (assumed) ----------------
mean_interarrival = 2.0     # minutes between car arrivals
mean_order_time = 1.5         # minutes
mean_pay_time = 0.5            # minutes
mean_pickup_time = 2.5         # minutes
num_cars = 30

random.seed(31)

print("=" * 70)
print("            FAST-FOOD DRIVE-THRU SIMULATION")
print("=" * 70)
print(f"{'Mean Inter-Arrival Time':<28}: {mean_interarrival} min")
print(f"{'Mean Order Stage Time':<28}: {mean_order_time} min")
print(f"{'Mean Pay Stage Time':<28}: {mean_pay_time} min")
print(f"{'Mean Pick-Up Stage Time':<28}: {mean_pickup_time} min")
print(f"{'Number of Cars':<28}: {num_cars}")
print("=" * 70)

stage_free_at = {"order": 0.0, "pay": 0.0, "pickup": 0.0}
stage_busy_time = {"order": 0.0, "pay": 0.0, "pickup": 0.0}

arrival_time = 0.0
records = []

for i in range(1, num_cars + 1):
    ia = random.expovariate(1.0 / mean_interarrival)
    arrival_time += ia

    t_order = random.expovariate(1.0 / mean_order_time)
    t_pay = random.expovariate(1.0 / mean_pay_time)
    t_pickup = random.expovariate(1.0 / mean_pickup_time)

    # ORDER stage
    order_start = max(arrival_time, stage_free_at["order"])
    order_end = order_start + t_order
    stage_free_at["order"] = order_end
    stage_busy_time["order"] += t_order

    # PAY stage (must wait for order stage to finish AND pay window free)
    pay_start = max(order_end, stage_free_at["pay"])
    pay_end = pay_start + t_pay
    stage_free_at["pay"] = pay_end
    stage_busy_time["pay"] += t_pay

    # PICKUP stage
    pickup_start = max(pay_end, stage_free_at["pickup"])
    pickup_end = pickup_start + t_pickup
    stage_free_at["pickup"] = pickup_end
    stage_busy_time["pickup"] += t_pickup

    total_time_in_system = pickup_end - arrival_time
    records.append((i, round(arrival_time, 2), round(order_end, 2),
                     round(pay_end, 2), round(pickup_end, 2), round(total_time_in_system, 2)))

print(f"{'Car#':<6}{'Arrival':<10}{'OrderEnd':<11}{'PayEnd':<10}{'PickupEnd':<11}{'TotalTime':<10}")
print("-" * 70)
for r in records:
    print(f"{r[0]:<6}{r[1]:<10}{r[2]:<11}{r[3]:<10}{r[4]:<11}{r[5]:<10}")

end_time = max(stage_free_at.values())
utilization = {stage: stage_busy_time[stage] / end_time for stage in stage_busy_time}
bottleneck = max(utilization, key=utilization.get)

avg_total_time = sum(r[5] for r in records) / num_cars

print("=" * 70)
print("                       RESULTS")
print("=" * 70)
print(f"{'Stage':<10}{'Utilization':<16}")
print("-" * 70)
for stage, u in utilization.items():
    marker = "  <-- BOTTLENECK" if stage == bottleneck else ""
    print(f"{stage:<10}{u:<16.4f}{marker}")
print("-" * 70)
print(f"Average total time per car (order->pickup) : {avg_total_time:.4f} minutes")
print(f"BOTTLENECK STAGE: '{bottleneck}' (highest utilization = {utilization[bottleneck]:.4f})")
print("  (Utilization = total busy time of that stage / simulation end time.")
print("   The stage closest to 1.0 (100%) is the bottleneck - it limits")
print("   how fast cars can move through the whole drive-thru system.)")
print("=" * 70)
