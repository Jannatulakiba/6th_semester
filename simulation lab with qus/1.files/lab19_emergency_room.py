"""
Lab 19: Emergency Room (ER) Patient Flow Simulation
=========================================================
Stages: TRIAGE -> TREATMENT -> DISCHARGE.
Triage is a single nurse (1 server). Treatment has multiple doctors
(multi-server). Discharge is administrative (1 server, fast).
Goal: minimize waiting time / allocate resources by observing where
patients wait the most.

INPUTS NEEDED (no numbers given in lab text):
  1. mean_interarrival            -> mean time between patient arrivals
  2. num_triage_nurses (=1)        -> usually single triage point
  3. mean_triage_time
  4. num_doctors                   -> number of treatment servers
  5. mean_treatment_time
  6. mean_discharge_time
  7. num_patients

Assumed: mean_interarrival=8, mean_triage_time=5, num_doctors=3,
         mean_treatment_time=20, mean_discharge_time=4, num_patients=40
"""

import random
import heapq

# ---------------- INPUT PARAMETERS (assumed) ----------------
mean_interarrival = 8.0
mean_triage_time = 5.0
num_doctors = 3
mean_treatment_time = 20.0
mean_discharge_time = 4.0
num_patients = 40

random.seed(27)

print("=" * 70)
print("            EMERGENCY ROOM (ER) PATIENT FLOW SIMULATION")
print("=" * 70)
print(f"{'Mean Inter-Arrival Time':<28}: {mean_interarrival} min")
print(f"{'Mean Triage Time (1 nurse)':<28}: {mean_triage_time} min")
print(f"{'Number of Doctors':<28}: {num_doctors}")
print(f"{'Mean Treatment Time':<28}: {mean_treatment_time} min")
print(f"{'Mean Discharge Time':<28}: {mean_discharge_time} min")
print(f"{'Number of Patients':<28}: {num_patients}")
print("=" * 70)

triage_free_at = 0.0
discharge_free_at = 0.0
doctor_free_times = [0.0] * num_doctors
heapq.heapify(doctor_free_times)

arrival_time = 0.0
records = []
triage_wait_total = 0.0
treatment_wait_total = 0.0

for i in range(1, num_patients + 1):
    ia = random.expovariate(1.0 / mean_interarrival)
    arrival_time += ia

    t_triage = random.expovariate(1.0 / mean_triage_time)
    t_treat = random.expovariate(1.0 / mean_treatment_time)
    t_discharge = random.expovariate(1.0 / mean_discharge_time)

    # ---- TRIAGE (single server) ----
    triage_start = max(arrival_time, triage_free_at)
    triage_wait = triage_start - arrival_time
    triage_end = triage_start + t_triage
    triage_free_at = triage_end
    triage_wait_total += triage_wait

    # ---- TREATMENT (multi-server: earliest free doctor) ----
    earliest_doc_free = doctor_free_times[0]
    treat_start = max(triage_end, earliest_doc_free)
    treat_wait = treat_start - triage_end
    treat_end = treat_start + t_treat
    heapq.heapreplace(doctor_free_times, treat_end)
    treatment_wait_total += treat_wait

    # ---- DISCHARGE (single server) ----
    discharge_start = max(treat_end, discharge_free_at)
    discharge_end = discharge_start + t_discharge
    discharge_free_at = discharge_end

    total_time = discharge_end - arrival_time
    records.append((i, round(arrival_time, 2), round(triage_wait, 2),
                     round(treat_wait, 2), round(discharge_end, 2), round(total_time, 2)))

print(f"{'Pt#':<5}{'Arrival':<10}{'TriageWait':<12}{'TreatWait':<11}{'Discharged':<12}{'TotalTime':<10}")
print("-" * 70)
for r in records:
    print(f"{r[0]:<5}{r[1]:<10}{r[2]:<12}{r[3]:<11}{r[4]:<12}{r[5]:<10}")

avg_triage_wait = triage_wait_total / num_patients
avg_treat_wait = treatment_wait_total / num_patients
avg_total_time = sum(r[5] for r in records) / num_patients

end_time = max(discharge_free_at, max(doctor_free_times), triage_free_at)

print("=" * 70)
print("                          RESULTS")
print("=" * 70)
print(f"Average wait for TRIAGE      : {avg_triage_wait:.4f} minutes")
print(f"Average wait for TREATMENT   : {avg_treat_wait:.4f} minutes")
print(f"Average total time in ER     : {avg_total_time:.4f} minutes")
print("-" * 70)
if avg_triage_wait > avg_treat_wait:
    print("BOTTLENECK: TRIAGE stage has the larger wait -> consider adding")
    print("            a second triage nurse.")
else:
    print("BOTTLENECK: TREATMENT stage has the larger wait -> consider adding")
    print("            another doctor.")
print("=" * 70)
