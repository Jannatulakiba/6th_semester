import random
import matplotlib.pyplot as plt

# ── INPUT ──────────────────────────────────────────
print("=== Steady-State Analysis - Warm-Up Period (Welch's Method) ===\n")

num_replications  = int(input("Number of replications: "))
run_length        = int(input("Run length (customers per run): "))
warmup_window     = int(input("Moving average window: "))
mean_interarrival = float(input("Mean inter-arrival time: "))
mean_service      = float(input("Mean service time: "))

rho = mean_service / mean_interarrival

print(f"\nUtilization rho = {rho:.2f}")

# ── SIMULATION FUNCTION ─────────────────────────────
def simulate_delay_series(seed):
    rng          = random.Random(seed)
    arrival_time = 0.0
    server_free  = 0.0
    delays       = []
    for _ in range(run_length):
        ia            = rng.expovariate(1.0 / mean_interarrival)
        svc           = rng.expovariate(1.0 / mean_service)
        arrival_time += ia
        service_start = max(arrival_time, server_free)
        delays.append(service_start - arrival_time)
        server_free   = service_start + svc
    return delays

# ── RUN ALL REPLICATIONS ────────────────────────────
all_runs = [simulate_delay_series(seed=200 + r) for r in range(num_replications)]

# Welch's averaging — average across replications at each customer index
avg_across = [sum(run[i] for run in all_runs) / num_replications for i in range(run_length)]

# Moving average smoothing
smoothed = []
for i in range(run_length):
    lo = max(0, i - warmup_window)
    hi = min(run_length, i + warmup_window + 1)
    smoothed.append(sum(avg_across[lo:hi]) / (hi - lo))

# ── WARM-UP CUTOFF ──────────────────────────────────
steady_region     = smoothed[int(run_length * 0.75):]
steady_state_mean = sum(steady_region) / len(steady_region)
tolerance         = 0.10 * steady_state_mean

warmup_cutoff = 0
for i, v in enumerate(smoothed):
    if abs(v - steady_state_mean) <= tolerance:
        if all(abs(x - steady_state_mean) <= tolerance * 2 for x in smoothed[i:i+20]):
            warmup_cutoff = i
            break

post_warmup = [v for run in all_runs for v in run[warmup_cutoff:]]
final_mean  = sum(post_warmup) / len(post_warmup)

# ── OUTPUT ─────────────────────────────────────────
print(f"\n=== RESULTS ===")
print(f"Warm-up period ends around customer # : {warmup_cutoff}")
print(f"Steady-state mean (last 25% of data)  : {steady_state_mean:.4f}")
print(f"Final steady-state mean (post-warmup) : {final_mean:.4f}")

# ── GRAPH ───────────────────────────────────────────
plt.figure(figsize=(10, 5))
plt.plot(avg_across, color='lightgray', label='Avg across replications (raw)')
plt.plot(smoothed, color='darkblue', linewidth=2, label=f'Welch-smoothed (window={warmup_window})')
plt.axvline(warmup_cutoff, color='red', linestyle='--', linewidth=1.5,
            label=f'Warm-up cutoff (customer #{warmup_cutoff})')
plt.axhline(steady_state_mean, color='green', linestyle=':', linewidth=1.5,
            label=f'Steady-state mean ({steady_state_mean:.2f})')
plt.title("Welch's Method: Identifying the Warm-Up Period")
plt.xlabel('Customer index'); plt.ylabel('Average waiting time')
plt.legend(fontsize=9); plt.grid(alpha=0.3)
plt.tight_layout()
plt.show()