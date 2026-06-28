# Simulation Modeling Labs (01-20) — README

Sob code run kora hoyese ar output verify kora hoyese. Niche proti lab e
KI INPUT lagse, KI INPUT DEYA JAY NA (ar keno), ar OUTPUT KON RULE/FORMULA
e ashlo - sob summary deya ache.

---

## Lab 01 - M/M/1 Queue Simulation (`lab01_mm1_queue.py`)
**Input dewa hoyese:** mean_interarrival=5, mean_service=4, max_customers=20
**Keno input lagse:** Lab sheet e kono numeric value deya nai - eta system
define korar jonno MUST input. Tai assume kora hoyese.
**Output:** Average delay, average number in queue, server utilization,
simulation end time.
**Rule:** Inter-arrival & service time -> Exponential distribution.
Single-server FIFO queue logic: service_start(i) = max(arrival(i),
service_end(i-1)). Utilization = total service time / total sim time.

## Lab 02 - Inventory Management (`lab02_inventory_management.py`)
**Input dewa hoyese:** initial_stock, reorder_point, order_quantity,
lead_time, demand range, simulation_days, costs - SOB assume kora (lab
text e kono number nai, just "simulate an inventory system" bola ache).
**Output:** Daily stock table, total holding/shortage/order cost.
**Rule:** (s,Q) reorder policy - stock <= reorder_point hole order place.

## Lab 03 - Continuous Review Inventory (s,S) (`lab03_continuous_review_inventory.py`)
**Input dewa hoyese:** s=30, S=100, demand~Normal(8,3), lead_time=3,
costs - sob assume (lab text e number nai). fiscal_year=365 days standard.
**Output:** 365-day simulation (first 15 + last 5 days shown), total cost.
**Rule:** Demand ~ Normal distribution. Order qty = S - current_stock.

## Lab 04 - Bernoulli Distribution (`lab04_bernoulli.py`)
**Input GIVEN:** p = 0.85 (problem e direct deya ache)
**Kono extra input lagena** - Bernoulli fully p diye describe hoy.
**Output:** P(X=0)=0.15, E[X]=0.85, Var(X)=0.1275
**Rule:** P(X=0)=1-p ; E[X]=p ; Var(X)=p(1-p)

## Lab 05 - Binomial Distribution (`lab05_binomial_packets.py`)
**Input GIVEN:** n=15, p=0.90, k=13, observed data [14,13,15,12,14]
**Kono assumption lagena** - sob problem e deya.
**Output:** P(X=13)=0.2669, mean=13.5, variance=1.35, observed avg=13.6
**Rule:** Binomial PMF P(X=k)=C(n,k)p^k*q^(n-k); mean=np; var=npq

## Lab 06 - Poisson Distribution (`lab06_poisson.py`)
**Input GIVEN:** lambda=5 calls/hour, k=0 to 10; lambda=10,15 for graphs
**Output:** PMF table for k=0..10, 2 bar-chart graphs (lambda=10,15)
**Rule:** Poisson PMF: P(X=k) = (lambda^k * e^-lambda)/k!

## Lab 07 - Normal Distribution (`lab07_normal_distribution.py`)
**Input GIVEN (part b,c):** n=200, mean=100,std=20 ; BP mean=80,std=20
**Input NOT given (part a):** "unimodal/multimodal" demo shapes - lab
text e kono number nai, eta just CONCEPT dekhanor jonno, tai illustrative
parameters use kora hoyese (bole deya hoyese eta illustrative).
**Output:** 3 graphs (unimodal vs multimodal, sample histogram, BP histogram)
**Rule:** Normal PDF formula; sample mean/std converge to true params (LLN)

## Lab 08 - Exponential Distribution (`lab08_exponential.py`)
**Input GIVEN:** mean_gap=100 days, threshold=120 days, rates=[0.5,1,2,4]
**Output:** P(X>120)=30.12%, 4 histogram+PDF overlay graphs
**Rule:** Exponential survival function P(X>x)=e^(-lambda*x); lambda=1/mean

## Lab 09 - Empirical Input Modeling (`lab09_empirical_input_modeling.py`)
**Input NOT given:** Lab text bole "given a raw dataset" kintu kono real
number deya nai - tai SYNTHETIC demo dataset generate kora hoyese
(replace kortte hobe real data diye jokhon pabe).
**Output:** MLE fitted params for Normal/Weibull/Lognormal, log-likelihood
comparison, 3 Q-Q plots
**Rule:** scipy.stats .fit() method = Maximum Likelihood Estimation

## Lab 10 - Machine Breakdown (`lab10_machine_breakdown.py`)
**Input GIVEN:** num_machines=5
**Input NOT given (assumed):** MTBF, Weibull shape/scale, sim_time,
production_rate - lab text e structure ache kintu number nai.
**Output:** Per-machine downtime/uptime table, availability, throughput
**Rule:** Breakdown~Exponential; Repair~Weibull; Availability=uptime/total

## Lab 11 - Linear Congruential Generator (`lab11_lcg.py`)
**Input NOT given:** seed, a, c, m - kono LCG number deya hoyni lab text e,
tai classic textbook example (X0=7,a=5,c=3,m=16) use kora hoyese.
**Output:** Full sequence table, period check
**Rule:** X(n+1) = (a*X(n)+c) mod m ; R(n) = X(n)/m

## Lab 12 - Inverse Transform Method (`lab12_inverse_transform.py`)
**Input NOT given:** lambda, N - lab text e number nai, "desired number"
bola ache kintu specify kora nai. lambda=2, N=10 assumed.
**Output:** U and x table, sample mean vs theoretical mean
**Rule:** x = -ln(1-U)/lambda (inverse of Exponential CDF)

## Lab 13 - 5000 Exponential Variates (`lab13_exponential_5000.py`)
**Input GIVEN:** N=5000
**Input NOT given:** lambda - assumed lambda=1.0 (standard)
**Output:** Sample stats table, histogram + theoretical PDF overlay graph
**Rule:** Same inverse transform formula; histogram should match e^-x curve

## Lab 14 - Trace/Verification (`lab14_trace_verification.py`)
**Input NOT given:** kono specific model parameters deya nai, lab01-er
moto M/M/1 queue reuse kora hoyese 6 customers niye (choto rakha hoyese
jate trace hand-e verify kora jay).
**Output:** Event-by-event trace log, rule-violation check (0 found)
**Rule:** 3 logical rules checked: no service before arrival, FIFO order,
delay >= 0 always

## Lab 15 - Confidence Interval Estimation (`lab15_confidence_interval.py`)
**Input GIVEN:** confidence_level=95%
**Input NOT given:** num_replications, queue params - assumed (10 reps,
M/M/1-style runs of 30 customers each)
**Output:** 10 replication results, sample mean/std, t-critical, 95% CI
**Rule:** CI = x_bar +/- t(alpha/2,n-1) * s/sqrt(n) [Student's t]

## Lab 16 - Steady-State Analysis (`lab16_steady_state.py`)
**Input NOT given:** replications, run_length, window, queue params - all
assumed (Welch's method demo with rho=0.70 for a clean visible transient)
**Output:** Warm-up cutoff point (~customer 35), steady-state mean, graph
**Rule:** Welch's method - average across reps, then moving-average smooth,
find where curve stabilizes near the tail-region mean

## Lab 17 - Bank ATM System (`lab17_bank_atm.py`)
**Input NOT given:** num_atms, arrival/service rates, customer count -
assumed (2 ATMs, high utilization to show queueing)
**Output:** Per-customer delay table, max queue length = 5
**Rule:** Multi-server (M/M/c) queue - customer goes to soonest-free server;
max queue length tracked via +1/-1 event list

## Lab 18 - Drive-Thru Model (`lab18_drive_thru.py`)
**Input NOT given:** arrival rate, 3 stage service times, car count -
assumed (pickup stage intentionally slowest to demonstrate bottleneck ID)
**Output:** Per-car timing table, utilization per stage, bottleneck=pickup
**Rule:** 3-stage tandem queue (order->pay->pickup); bottleneck = stage
with highest utilization (busy time / total time)

## Lab 19 - ER Patient Flow (`lab19_emergency_room.py`)
**Input NOT given:** arrival rate, triage/treatment/discharge times,
num_doctors - all assumed
**Output:** Per-patient wait times at each stage, bottleneck identified
**Rule:** Triage(1 server)->Treatment(multi-server)->Discharge(1 server);
bottleneck = stage with larger average wait

## Lab 20 - Pharmacy Output Analysis (`lab20_pharmacy_output_analysis.py`)
**Input GIVEN (sob given, kono assumption lagena):** data=[3.2,4.3,5.1,
4.2,4.6], confidence=95%, desired half-width=0.5
**Output:** Sample mean=4.28, variance=0.487, SE=0.3121, 95% CI=[3.41,5.15],
required replications=10 (5 more needed)
**Rule:** Point estimate=mean; CI=x_bar+/-t*SE; required n found by
iterating t(alpha/2,n'-1)*s/sqrt(n') <= desired_half_width

---

## General Note on Inputs
Jei lab gulo e **specific numbers deya chilo problem statement e**
(Lab 04, 05, 06 partial, 08 partial, 13 partial, 20), sheigulo **directly
use kora hoyese - kono assumption lage nai.**

Jei lab gulo e **kono number deya hoyni** (Lab 01, 02, 03, 09, 10, 11, 12,
14-19), sheigulo **fully procedural/structural description** chilo -
formula/algorithm bole disese kintu "kototuku", "koto din", "ki rate"
eishob business-specific value deyna karon segulo external/contextual
decision (instructor/real-world data theke ashe), code likhe estimate
kora jay na. Tai realistic sample values **assume kore comment e bole
deya hoyese keno.**

Run korte: `python3 labXX_filename.py`
Graph (.png) gulo same folder e save hoy.
