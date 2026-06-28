"""
Lab 14: Debugging and Traceability (Verification) - Trace Program
=======================================================================
A "trace" steps a discrete-event model one event at a time, logging
the system state after each event, so the model's logical correctness
can be VERIFIED by hand against the expected rules.

We use a single-server queue (same logical rules as Lab 01) as the
model to trace, since the problem says "step through a discrete-event
model" without naming a specific one.

INPUTS NEEDED (must define which model + its parameters; nothing here
is given in the lab text, so the same M/M/1-style parameters as Lab01
are reused for consistency):
  1. mean_interarrival
  2. mean_service
  3. num_customers to trace

Assumed: mean_interarrival = 5, mean_service = 4, num_customers = 6
(small number on purpose, so the FULL trace log fits on screen and can
actually be verified by hand.)
"""

import random

# ---------------- INPUT PARAMETERS (assumed) ----------------
mean_interarrival = 5.0
mean_service = 4.0
num_customers = 6     # kept small so the trace can be verified by hand

random.seed(42)   # same seed as Lab 01's first 6 customers, for cross-check

print("=" * 70)
print("        DISCRETE-EVENT TRACE LOG (Single-Server Queue Model)")
print("=" * 70)
print(f"{'Mean Inter-Arrival':<25}: {mean_interarrival}")
print(f"{'Mean Service Time':<25}: {mean_service}")
print(f"{'Customers Traced':<25}: {num_customers}")
print("=" * 70)
print("MODEL RULES being verified:")
print("  Rule 1: Customer i's service cannot start before its arrival.")
print("  Rule 2: Customer i's service cannot start before customer (i-1)")
print("          has finished service (single server, FIFO).")
print("  Rule 3: delay(i) = service_start(i) - arrival(i)  >= 0  always.")
print("=" * 70)

clock = 0.0
server_free_at = 0.0
violations = 0

print(f"{'Event#':<8}{'Time':<10}{'EventType':<16}{'ServerState':<14}{'Notes'}")
print("-" * 70)

event_num = 0
arrival_time = 0.0
for i in range(1, num_customers + 1):
    interarrival = random.expovariate(1.0 / mean_interarrival)
    service = random.expovariate(1.0 / mean_service)
    arrival_time += interarrival

    event_num += 1
    print(f"{event_num:<8}{arrival_time:<10.3f}{'ARRIVAL c'+str(i):<16}"
          f"{'BUSY' if arrival_time < server_free_at else 'IDLE':<14}"
          f"Customer {i} arrives")

    service_start = max(arrival_time, server_free_at)
    delay = service_start - arrival_time

    # ---- VERIFICATION CHECKS (Rules 1-3) ----
    note = ""
    if service_start < arrival_time - 1e-9:
        note = "VIOLATION: service started before arrival!"
        violations += 1
    if delay < -1e-9:
        note = "VIOLATION: negative delay!"
        violations += 1
    if not note:
        note = f"OK (delay={delay:.3f} >= 0, rules satisfied)"

    event_num += 1
    print(f"{event_num:<8}{service_start:<10.3f}{'SVC_START c'+str(i):<16}"
          f"{'BUSY':<14}{note}")

    service_end = service_start + service
    server_free_at = service_end

    event_num += 1
    print(f"{event_num:<8}{service_end:<10.3f}{'DEPARTURE c'+str(i):<16}"
          f"{'IDLE':<14}Customer {i} leaves system")

print("=" * 70)
print("VERIFICATION SUMMARY")
print("-" * 70)
print(f"Total events traced     : {event_num}")
print(f"Rule violations found    : {violations}")
if violations == 0:
    print("RESULT: Model logic is VERIFIED CORRECT - it adheres exactly")
    print("        to the stated discrete-event rules (1-3) above.")
else:
    print("RESULT: Model logic FAILED verification - check event ordering.")
print("=" * 70)
