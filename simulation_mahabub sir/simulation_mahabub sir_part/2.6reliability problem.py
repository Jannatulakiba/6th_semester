import random

COST_BEARING = 20
COST_DOWNTIME_MIN = 5
COST_REPAIR_HR = 25
LIMIT_HOURS = 30000

def get_bearing_life():
    rd = random.randint(0, 99)
    if rd <= 10: return 1000
    if rd <= 24: return 1100
    if rd <= 48: return 1200
    if rd <= 62: return 1300
    if rd <= 74: return 1400
    if rd <= 84: return 1500
    if rd <= 90: return 1600
    if rd <= 95: return 1700
    if rd <= 98: return 1800
    return 1900

def get_delay():
    rd = random.randint(1, 10)
    if rd <= 3: return 4
    if rd <= 9: return 6
    return 8

def run_policy_1():
    print("\n" + "="*80)
    print("SIMULATION TABLE: POLICY 1 (INDIVIDUAL REPLACEMENT)")
    print("="*80)
    print(f"{'Event':<6} | {'Clock':<8} | {'Bearing':<12} | {'Delay':<6} | {'Repair':<7} | {'Total Down'}")
    print("-" * 80)

    bearing_next_failure = [
        get_bearing_life(),
        get_bearing_life(),
        get_bearing_life()
    ]

    total_bearings = 3
    total_down_mins = 0
    total_repair_mins = 0
    event_count = 0

    while min(bearing_next_failure) <= LIMIT_HOURS:
        event_count += 1
        clock = min(bearing_next_failure)

        failed_indices = [i for i, t in enumerate(bearing_next_failure) if t == clock]
        num_failed = len(failed_indices)

        if num_failed == 1:
            repair = 20
        elif num_failed == 2:
            repair = 30
        else:
            repair = 40

        delay = get_delay()
        total_down_mins += (delay + repair)
        total_repair_mins += repair

        b_names = ", ".join([f"B{i+1}" for i in failed_indices])
        print(f"{event_count:<6} | {clock:<8} | {b_names:<12} | {delay:<6} | {repair:<7} | {delay+repair}")

        for i in failed_indices:
            bearing_next_failure[i] += get_bearing_life()
            total_bearings += 1

    cost = (
        total_bearings * COST_BEARING +
        total_down_mins * COST_DOWNTIME_MIN +
        (total_repair_mins / 60) * COST_REPAIR_HR
    )

    return cost, total_bearings, total_down_mins

def run_policy_2():
    print("\n" + "="*95)
    print("SIMULATION OF RELIABILITY PROBLEM — PROPOSED POLICY (GROUP REPLACEMENT)")
    print("="*95)
    print(f"{'B1 Life':<10} {'B2 Life':<10} {'B3 Life':<10} "
          f"{'First Fail':<12} {'Cum Life':<12} {'RD':<5} {'Delay':<6}")
    print("-" * 95)

    clock = 0
    total_bearings = 0
    total_down_mins = 0
    total_repair_mins = 0

    while clock <= LIMIT_HOURS:
        b1 = get_bearing_life()
        b2 = get_bearing_life()
        b3 = get_bearing_life()

        first_failure = min(b1, b2, b3)
        clock += first_failure

        if clock > LIMIT_HOURS:
            break

        delay = get_delay()
        repair = 40
        rd = random.randint(0, 9)

        total_bearings += 3
        total_down_mins += (delay + repair)
        total_repair_mins += repair

        print(f"{b1:<10} {b2:<10} {b3:<10} "
              f"{first_failure:<12} {clock:<12} {rd:<5} {delay:<6}")

    cost = (
        total_bearings * COST_BEARING +
        total_down_mins * COST_DOWNTIME_MIN +
        (total_repair_mins / 60) * COST_REPAIR_HR
    )

    print("-" * 95)
    print(f"{'Total Delay':>80} {total_down_mins}")
    return cost, total_bearings, total_down_mins

c1, b1, d1 = run_policy_1()
c2, b2, d2 = run_policy_2()

print("\n" + "SUMMARY REPORT".center(45, "="))
print(f"Policy 1 Bearings Used : {b1}")
print(f"Policy 2 Bearings Used : {b2}")
print(f"Policy 1 Total Down   : {d1} mins")
print(f"Policy 2 Total Down   : {d2} mins")
print("-" * 45)
print(f"Total Cost Policy 1   : Rs. {c1:.2f}")
print(f"Total Cost Policy 2   : Rs. {c2:.2f}")
print("-" * 45)
print(f"NET PROFIT / SAVINGS  : Rs. {c1 - c2:.2f}")
print("=" * 45)
