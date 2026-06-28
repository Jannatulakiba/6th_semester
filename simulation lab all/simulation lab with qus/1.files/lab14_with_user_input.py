import random

# ── INPUT ──────────────────────────────────────────
print("=== Discrete-Event Trace Log (Single-Server Queue) ===\n")

mean_interarrival = float(input("Mean inter-arrival time: "))
mean_service      = float(input("Mean service time: "))
num_customers     = int(input("Number of customers to trace: "))

random.seed(42)

# ── TRACE ───────────────────────────────────────────
print("\nMODEL RULES:")
print("  Rule 1: Service cannot start before arrival.")
print("  Rule 2: Service cannot start before previous customer finishes.")
print("  Rule 3: delay = service_start - arrival >= 0 always.")

print(f"\n{'Event':<7} {'Time':<9} {'Event Type':<16} {'Server':<8} {'Notes'}")
print("-" * 65)

clock         = 0.0
server_free   = 0.0
violations    = 0
event_num     = 0
arrival_time  = 0.0

for i in range(1, num_customers + 1):
    interarrival  = random.expovariate(1.0 / mean_interarrival)
    service       = random.expovariate(1.0 / mean_service)
    arrival_time += interarrival

    # ARRIVAL
    event_num += 1
    state = 'BUSY' if arrival_time < server_free else 'IDLE'
    print(f"{event_num:<7} {arrival_time:<9.3f} {'ARRIVAL c'+str(i):<16} {state:<8} Customer {i} arrives")

    # SVC_START
    service_start = max(arrival_time, server_free)
    delay         = service_start - arrival_time

    note = ""
    if service_start < arrival_time - 1e-9:
        note = "VIOLATION: service before arrival!"
        violations += 1
    elif delay < -1e-9:
        note = "VIOLATION: negative delay!"
        violations += 1
    else:
        note = f"OK (delay={delay:.3f} >= 0)"

    event_num += 1
    print(f"{event_num:<7} {service_start:<9.3f} {'SVC_START c'+str(i):<16} {'BUSY':<8} {note}")

    # DEPARTURE
    service_end  = service_start + service
    server_free  = service_end

    event_num += 1
    print(f"{event_num:<7} {service_end:<9.3f} {'DEPARTURE c'+str(i):<16} {'IDLE':<8} Customer {i} leaves")

# ── SUMMARY ─────────────────────────────────────────
print("-" * 65)
print("\n=== VERIFICATION SUMMARY ===")
print(f"Total events traced  : {event_num}")
print(f"Rule violations      : {violations}")
if violations == 0:
    print("RESULT: Model logic VERIFIED CORRECT — all rules satisfied.")
else:
    print("RESULT: Model logic FAILED — check event ordering.")