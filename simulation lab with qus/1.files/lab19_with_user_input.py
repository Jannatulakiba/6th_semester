import random
import heapq
import matplotlib.pyplot as plt

# ── INPUT ──────────────────────────────────────────
print("=== Emergency Room (ER) Patient Flow Simulation ===\n")

mean_interarrival   = float(input("Mean inter-arrival time (min): "))
num_nurses          = int(input("Number of triage nurses: "))
mean_triage_time    = float(input("Mean triage time (min): "))
num_doctors         = int(input("Number of doctors: "))
mean_treatment_time = float(input("Mean treatment time (min): "))
mean_discharge_time = float(input("Mean discharge time (min): "))
num_patients        = int(input("Number of patients: "))

random.seed(27)

# ── SIMULATION ──────────────────────────────────────
nurse_free_times  = [0.0] * num_nurses
doctor_free_times = [0.0] * num_doctors
heapq.heapify(nurse_free_times)
heapq.heapify(doctor_free_times)

discharge_free   = 0.0
arrival_time     = 0.0
records          = []
triage_wait_total   = 0.0
treatment_wait_total = 0.0

for i in range(1, num_patients + 1):
    ia           = random.expovariate(1.0 / mean_interarrival)
    t_triage     = random.expovariate(1.0 / mean_triage_time)
    t_treat      = random.expovariate(1.0 / mean_treatment_time)
    t_discharge  = random.expovariate(1.0 / mean_discharge_time)
    arrival_time += ia

    # TRIAGE
    triage_start  = max(arrival_time, nurse_free_times[0])
    triage_wait   = triage_start - arrival_time
    triage_end    = triage_start + t_triage
    heapq.heapreplace(nurse_free_times, triage_end)
    triage_wait_total += triage_wait

    # TREATMENT
    treat_start   = max(triage_end, doctor_free_times[0])
    treat_wait    = treat_start - triage_end
    treat_end     = treat_start + t_treat
    heapq.heapreplace(doctor_free_times, treat_end)
    treatment_wait_total += treat_wait

    # DISCHARGE
    discharge_start = max(treat_end, discharge_free)
    discharge_end   = discharge_start + t_discharge
    discharge_free  = discharge_end

    total_time = discharge_end - arrival_time
    records.append((i, round(arrival_time,2), round(triage_wait,2),
                    round(treat_wait,2), round(discharge_end,2), round(total_time,2)))

# ── OUTPUT ─────────────────────────────────────────
print(f"\n{'Pt#':<5} {'Arrival':<10} {'TriageWait':<12} {'TreatWait':<11} {'Discharged':<12} {'TotalTime'}")
print("-" * 60)
for r in records:
    print(f"{r[0]:<5} {r[1]:<10} {r[2]:<12} {r[3]:<11} {r[4]:<12} {r[5]}")

avg_triage_wait = triage_wait_total   / num_patients
avg_treat_wait  = treatment_wait_total / num_patients
avg_total_time  = sum(r[5] for r in records) / num_patients

print(f"\n=== RESULTS ===")
print(f"Avg wait for Triage    : {avg_triage_wait:.4f} min")
print(f"Avg wait for Treatment : {avg_treat_wait:.4f} min")
print(f"Avg total time in ER   : {avg_total_time:.4f} min")

if avg_triage_wait > avg_treat_wait:
    print(f"\nBOTTLENECK: TRIAGE — consider adding more nurses (currently {num_nurses})")
else:
    print(f"\nBOTTLENECK: TREATMENT — consider adding more doctors (currently {num_doctors})")

# ── GRAPHS ──────────────────────────────────────────
triage_waits = [r[2] for r in records]
treat_waits  = [r[3] for r in records]
total_times  = [r[5] for r in records]

fig, axes = plt.subplots(1, 2, figsize=(12, 5))
fig.suptitle("Emergency Room Patient Flow Simulation", fontsize=13, fontweight='bold')

# 1. Triage wait vs Treatment wait per patient
ax = axes[0]
x = range(1, num_patients + 1)
ax.bar(x, triage_waits, color='tomato',    label='Triage Wait')
ax.bar(x, treat_waits,  color='steelblue', label='Treatment Wait', bottom=triage_waits)
ax.axhline(avg_triage_wait, color='darkred',  linestyle='--', linewidth=1.5,
           label=f'Avg Triage Wait ({avg_triage_wait:.2f})')
ax.axhline(avg_treat_wait,  color='darkblue', linestyle=':',  linewidth=1.5,
           label=f'Avg Treat Wait ({avg_treat_wait:.2f})')
ax.set_title('Wait Time per Patient')
ax.set_xlabel('Patient #'); ax.set_ylabel('Wait (min)')
ax.legend(fontsize=7); ax.grid(alpha=0.3, axis='y')

# 2. Total time per patient
ax = axes[1]
ax.bar(x, total_times, color='steelblue', edgecolor='white')
ax.axhline(avg_total_time, color='red', linestyle='--', linewidth=1.5,
           label=f'Avg Total ({avg_total_time:.2f} min)')
ax.set_title('Total Time in ER per Patient')
ax.set_xlabel('Patient #'); ax.set_ylabel('Total Time (min)')
ax.legend(fontsize=8); ax.grid(alpha=0.3, axis='y')

plt.tight_layout()
plt.show()