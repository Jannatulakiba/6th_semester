"""
Lab 03: Inventory System Simulation (Continuous Review, (s, S) Policy)
=========================================================================
Demand is NORMALLY distributed (continuous review - checked every day).
Whenever stock falls to/below reorder point s, an order is placed that
brings the stock up to S (order quantity = S - current_stock).
Tracks total holding cost and shortage (stock-out) cost over a fiscal
year (assumed 365 days).

INPUTS NEEDED (must be supplied - lab text gives no numbers):
  1. s  (reorder point)
  2. S  (order-up-to level)
  3. mean_demand, std_demand  -> parameters of the Normal demand per day
  4. lead_time                -> days to receive an order
  5. initial_stock
  6. holding_cost_per_unit_per_day
  7. shortage_cost_per_unit
  8. fiscal_year_days (=365, standard assumption, this one IS a safe
     default since a fiscal year is conventionally 365 days)

Items 1-7 cannot be derived - they depend on the specific business
context (demand pattern, cost structure), so realistic sample values
are assumed below.
"""

import random

# ---------------- INPUT PARAMETERS (assumed) ----------------
s = 30                      # reorder point
S = 100                     # order-up-to level
mean_demand = 8.0           # units/day
std_demand = 3.0            # units/day (Normal distribution)
lead_time = 3                # days
initial_stock = 80
holding_cost_per_unit_per_day = 0.5
shortage_cost_per_unit = 4.0
fiscal_year_days = 365       # standard assumption

random.seed(11)

print("=" * 65)
print("     CONTINUOUS-REVIEW (s, S) INVENTORY SIMULATION")
print("=" * 65)
print(f"{'Reorder point (s)':<30}: {s}")
print(f"{'Order-up-to level (S)':<30}: {S}")
print(f"{'Mean Daily Demand':<30}: {mean_demand}")
print(f"{'Std Dev Daily Demand':<30}: {std_demand}")
print(f"{'Lead Time':<30}: {lead_time} days")
print(f"{'Initial Stock':<30}: {initial_stock}")
print(f"{'Holding Cost/unit/day':<30}: {holding_cost_per_unit_per_day}")
print(f"{'Shortage Cost/unit':<30}: {shortage_cost_per_unit}")
print(f"{'Simulation Length':<30}: {fiscal_year_days} days (1 fiscal year)")
print("=" * 65)

stock = initial_stock
pending_orders = {}     # arrival_day -> quantity
outstanding = False
total_holding_cost = 0.0
total_shortage_cost = 0.0
orders_placed = 0
total_shortage_units = 0

# print only first 15 and last 5 days in detail (365 rows is too long to dump fully)
print(f"{'Day':<6}{'Start':<8}{'Demand':<10}{'Sold':<8}{'Short':<8}{'End':<8}{'Order?':<14}")
print("-" * 65)

for day in range(1, fiscal_year_days + 1):
    if day in pending_orders:
        stock += pending_orders[day]
        outstanding = False

    start_stock = stock
    demand = max(0, round(random.gauss(mean_demand, std_demand)))
    sold = min(stock, demand)
    shortage = demand - sold
    stock -= sold

    total_holding_cost += stock * holding_cost_per_unit_per_day
    total_shortage_cost += shortage * shortage_cost_per_unit
    total_shortage_units += shortage

    order_note = ""
    if stock <= s and not outstanding:
        qty = S - stock
        arrival_day = day + lead_time
        pending_orders[arrival_day] = qty
        outstanding = True
        orders_placed += 1
        order_note = f"+{qty} on day {arrival_day}"

    if day <= 15 or day > fiscal_year_days - 5:
        print(f"{day:<6}{start_stock:<8}{demand:<10}{sold:<8}{shortage:<8}{stock:<8}{order_note:<14}")
    elif day == 16:
        print("...   (days 16 - {} omitted for brevity)...".format(fiscal_year_days - 5))

total_cost = total_holding_cost + total_shortage_cost

print("=" * 65)
print("                 RESULTS (FULL FISCAL YEAR)")
print("=" * 65)
print(f"Total Orders Placed         : {orders_placed}")
print(f"Total Units Short            : {total_shortage_units}")
print(f"Total Holding Cost           : {total_holding_cost:,.2f}")
print(f"Total Shortage Cost          : {total_shortage_cost:,.2f}")
print(f"TOTAL ANNUAL INVENTORY COST  : {total_cost:,.2f}")
print("=" * 65)
