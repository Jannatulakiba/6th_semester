import random
import matplotlib.pyplot as plt

# ── INPUT ──────────────────────────────────────────
print("=== Inventory Management Simulation ===\n")

initial_stock  = int(input("Initial stock: "))
reorder_point  = int(input("Reorder point: "))
order_quantity = int(input("Order quantity: "))
lead_time      = int(input("Lead time (days): "))
demand_min     = int(input("Demand min: "))
demand_max     = int(input("Demand max: "))
sim_days       = int(input("Simulation days: "))
hold_cost      = float(input("Holding cost/unit/day: "))
short_cost     = float(input("Shortage cost/unit: "))
order_cost     = float(input("Order cost/order: "))

random.seed(7)

# ── SIMULATION ──────────────────────────────────────
stock          = initial_stock
pending        = {}
has_order      = False
total_hold     = 0.0
total_short    = 0.0
total_order    = 0.0
orders_placed  = 0

days      = []
stock_end = []
demands   = []
shortages = []

print(f"\n{'Day':<5} {'Start':<7} {'Demand':<8} {'Sold':<6} {'Short':<7} {'End':<6} {'Order'}")
print("-" * 55)

for day in range(1, sim_days + 1):
    if day in pending:
        stock += pending[day]
        has_order = False

    start   = stock
    demand  = random.randint(demand_min, demand_max)
    sold    = min(stock, demand)
    short   = demand - sold
    stock  -= sold

    total_hold  += stock * hold_cost
    total_short += short * short_cost

    order_note = ""
    if stock <= reorder_point and not has_order:
        arrive = day + lead_time
        pending[arrive] = order_quantity
        total_order += order_cost
        orders_placed += 1
        has_order = True
        order_note = f"+{order_quantity} on day {arrive}"

    print(f"{day:<5} {start:<7} {demand:<8} {sold:<6} {short:<7} {stock:<6} {order_note}")

    days.append(day)
    stock_end.append(stock)
    demands.append(demand)
    shortages.append(short)

total_cost = total_hold + total_short + total_order

# ── RESULTS ─────────────────────────────────────────
print("\n=== RESULTS ===")
print(f"Orders placed    : {orders_placed}")
print(f"Holding cost     : {total_hold:.2f}")
print(f"Shortage cost    : {total_short:.2f}")
print(f"Ordering cost    : {total_order:.2f}")
print(f"TOTAL COST       : {total_cost:.2f}")

# ── GRAPHS ──────────────────────────────────────────
avg_stock = sum(stock_end) / len(stock_end)

fig, axes = plt.subplots(2, 2, figsize=(12, 7))
fig.suptitle("Inventory Simulation Results", fontsize=13, fontweight='bold')

# 1. Stock level
ax = axes[0][0]
ax.plot(days, stock_end, color='steelblue', marker='o', markersize=3)
ax.axhline(reorder_point, color='red',   linestyle='--', label=f'Reorder Point ({reorder_point})')
ax.axhline(avg_stock,     color='green', linestyle=':',  label=f'Avg Stock ({avg_stock:.1f})')
ax.set_title('Stock Level Over Time')
ax.set_xlabel('Day'); ax.set_ylabel('Units')
ax.legend(fontsize=8); ax.grid(alpha=0.3)

# 2. Demand vs Sold
ax = axes[0][1]
sold_list = [min(s, d) for s, d in zip([initial_stock] + stock_end[:-1], demands)]
ax.bar(days, demands,   color='orange',    alpha=0.7, label='Demand')
ax.bar(days, sold_list, color='steelblue', alpha=0.9, label='Sold')
ax.axhline(sum(demands)/len(demands), color='red', linestyle='--',
           label=f'Avg Demand ({sum(demands)/len(demands):.1f})')
ax.set_title('Demand vs Sold')
ax.set_xlabel('Day'); ax.set_ylabel('Units')
ax.legend(fontsize=8); ax.grid(alpha=0.3, axis='y')

# 3. Shortage per day
ax = axes[1][0]
colors = ['tomato' if s > 0 else 'lightgray' for s in shortages]
ax.bar(days, shortages, color=colors)
ax.axhline(sum(shortages)/len(shortages), color='darkred', linestyle='--',
           label=f'Avg ({sum(shortages)/len(shortages):.1f})')
ax.set_title('Shortage Per Day')
ax.set_xlabel('Day'); ax.set_ylabel('Units Short')
ax.legend(fontsize=8); ax.grid(alpha=0.3, axis='y')

# 4. Cost pie
ax = axes[1][1]
vals   = [v for v in [total_hold, total_short, total_order] if v > 0]
labels = [l for l, v in zip(['Holding','Shortage','Ordering'],
                             [total_hold, total_short, total_order]) if v > 0]
ax.pie(vals, labels=labels, autopct='%1.1f%%',
       colors=['steelblue','tomato','orange'], startangle=90)
ax.set_title(f'Cost Breakdown\nTotal = {total_cost:.2f}')

plt.tight_layout()
plt.show()