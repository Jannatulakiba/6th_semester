import random
import matplotlib.pyplot as plt

# ── INPUT ──────────────────────────────────────────
print("=== Continuous-Review (s,S) Inventory Simulation ===\n")

s             = int(input("Reorder point (s): "))
S             = int(input("Order-up-to level (S): "))
mean_demand   = float(input("Mean daily demand: "))
std_demand    = float(input("Std dev daily demand: "))
lead_time     = int(input("Lead time (days): "))
initial_stock = int(input("Initial stock: "))
hold_cost     = float(input("Holding cost/unit/day: "))
short_cost       = float(input("Shortage cost/unit: "))
fiscal_year_days = int(input("Fiscal year days: "))

random.seed(11)

# ── SIMULATION ──────────────────────────────────────
stock         = initial_stock
pending       = {}
outstanding   = False
total_hold    = 0.0
total_short   = 0.0
orders_placed = 0
total_short_units = 0

days_list     = []
stock_end     = []
demands       = []
shortages     = []

print(f"\n{'Day':<6} {'Start':<7} {'Demand':<8} {'Sold':<6} {'Short':<7} {'End':<6} {'Order'}")
print("-" * 58)

for day in range(1, fiscal_year_days + 1):
    if day in pending:
        stock += pending[day]
        outstanding = False

    start  = stock
    demand = max(0, round(random.gauss(mean_demand, std_demand)))
    sold   = min(stock, demand)
    short  = demand - sold
    stock -= sold

    total_hold        += stock * hold_cost
    total_short       += short * short_cost
    total_short_units += short

    order_note = ""
    if stock <= s and not outstanding:
        qty         = S - stock
        arrive      = day + lead_time
        pending[arrive] = qty
        outstanding = True
        orders_placed += 1
        order_note  = f"+{qty} on day {arrive}"

    # print first 15 and last 5 days only
    if day <= 15 or day > fiscal_year_days - 5:
        print(f"{day:<6} {start:<7} {demand:<8} {sold:<6} {short:<7} {stock:<6} {order_note}")
    elif day == 16:
        print(f"...  (days 16 - {fiscal_year_days-5} omitted)")

    days_list.append(day)
    stock_end.append(stock)
    demands.append(demand)
    shortages.append(short)

total_cost = total_hold + total_short

# ── RESULTS ─────────────────────────────────────────
print("\n=== RESULTS ===")
print(f"Orders placed       : {orders_placed}")
print(f"Total units short   : {total_short_units}")
print(f"Holding cost        : {total_hold:,.2f}")
print(f"Shortage cost       : {total_short:,.2f}")
print(f"TOTAL ANNUAL COST   : {total_cost:,.2f}")

# ── GRAPHS ──────────────────────────────────────────
avg_stock  = sum(stock_end) / len(stock_end)
avg_demand = sum(demands)   / len(demands)

fig, axes = plt.subplots(2, 2, figsize=(12, 7))
fig.suptitle("(s,S) Inventory Simulation Results — 365 Days", fontsize=13, fontweight='bold')

# 1. Stock level over time
ax = axes[0][0]
ax.plot(days_list, stock_end, color='steelblue', linewidth=0.8)
ax.axhline(s,         color='red',   linestyle='--', linewidth=1.2, label=f'Reorder Point s={s}')
ax.axhline(S,         color='green', linestyle='--', linewidth=1.2, label=f'Order-up-to S={S}')
ax.axhline(avg_stock, color='gray',  linestyle=':',  linewidth=1.2, label=f'Avg Stock ({avg_stock:.1f})')
ax.set_title('Stock Level Over 365 Days')
ax.set_xlabel('Day'); ax.set_ylabel('Units')
ax.legend(fontsize=8); ax.grid(alpha=0.3)

# 2. Daily demand distribution (histogram)
ax = axes[0][1]
ax.hist(demands, bins=15, color='orange', edgecolor='white')
ax.axvline(avg_demand, color='red', linestyle='--', linewidth=1.5, label=f'Avg ({avg_demand:.1f})')
ax.set_title('Daily Demand Distribution')
ax.set_xlabel('Demand (units)'); ax.set_ylabel('Frequency')
ax.legend(fontsize=8); ax.grid(alpha=0.3, axis='y')

# 3. Shortage per day
ax = axes[1][0]
ax.plot(days_list, shortages, color='tomato', linewidth=0.7)
ax.axhline(sum(shortages)/len(shortages), color='darkred', linestyle='--',
           linewidth=1.2, label=f'Avg ({sum(shortages)/len(shortages):.2f})')
ax.set_title('Shortage Per Day')
ax.set_xlabel('Day'); ax.set_ylabel('Units Short')
ax.legend(fontsize=8); ax.grid(alpha=0.3)

# 4. Cost breakdown pie
ax = axes[1][1]
vals   = [v for v in [total_hold, total_short] if v > 0]
labels = [l for l, v in zip(['Holding', 'Shortage'], [total_hold, total_short]) if v > 0]
if vals:
    ax.pie(vals, labels=labels, autopct='%1.1f%%',
           colors=['steelblue', 'tomato'], startangle=90)
ax.set_title(f'Cost Breakdown\nTotal = {total_cost:,.2f}')

plt.tight_layout()
plt.show()