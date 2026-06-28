"""
Lab 02: Inventory Management Simulation
=========================================
Simulates a simple periodic-review inventory system over a number of
days/periods: daily demand is random, stock depletes, and is
replenished by a fixed order quantity whenever stock falls at/below a
reorder point.

INPUTS NEEDED (must be supplied because the problem text gives no
numbers - it is only a general description "simulate an inventory
system"):
  1. initial_stock      -> starting inventory level
  2. reorder_point       -> stock level at which a new order is placed
  3. order_quantity      -> fixed amount ordered each time
  4. lead_time           -> days between placing an order and receiving it
  5. demand_min/max      -> range of daily customer demand (assumed uniform)
  6. simulation_days     -> how many days to simulate
  7. holding_cost/unit    -> cost to hold one unit in stock per day
  8. shortage_cost/unit   -> cost per unit of unmet demand (stock-out)
  9. order_cost           -> fixed cost incurred each time an order is placed

None of these can be derived mathematically; they describe the
business itself, so all are taken as input parameters. The lab sheet
does not specify numeric values, so realistic sample values are used.
"""

import random

# ---------------- INPUT PARAMETERS (assumed, since not given) ----------------
initial_stock = 50
reorder_point = 20
order_quantity = 40
lead_time = 2            # days
demand_min, demand_max = 3, 10   # daily demand range (uniform random)
simulation_days = 20
holding_cost_per_unit = 1.0      # cost / unit / day
shortage_cost_per_unit = 5.0     # cost / unit short
order_cost = 15.0                 # fixed cost per order placed

random.seed(7)

print("=" * 65)
print("                 INVENTORY MANAGEMENT SIMULATION")
print("=" * 65)
print(f"{'Initial Stock':<28}: {initial_stock} units")
print(f"{'Reorder Point (s)':<28}: {reorder_point} units")
print(f"{'Order Quantity (Q)':<28}: {order_quantity} units")
print(f"{'Lead Time':<28}: {lead_time} days")
print(f"{'Daily Demand Range':<28}: {demand_min}-{demand_max} units")
print(f"{'Simulation Length':<28}: {simulation_days} days")
print(f"{'Holding Cost/unit/day':<28}: {holding_cost_per_unit}")
print(f"{'Shortage Cost/unit':<28}: {shortage_cost_per_unit}")
print(f"{'Fixed Order Cost':<28}: {order_cost}")
print("=" * 65)

stock = initial_stock
pending_orders = {}      # day_arrives -> quantity
outstanding_order = False  # True while an order has been placed but not yet arrived
total_holding_cost = 0.0
total_shortage_cost = 0.0
total_order_cost = 0.0
orders_placed = 0

print(f"{'Day':<5}{'Start':<8}{'Demand':<8}{'Sold':<8}{'Short':<8}{'End':<8}{'Order?':<10}")
print("-" * 65)

for day in range(1, simulation_days + 1):
    # receive any orders arriving today
    if day in pending_orders:
        stock += pending_orders[day]
        outstanding_order = False   # order has arrived, no longer outstanding

    start_stock = stock
    demand = random.randint(demand_min, demand_max)
    sold = min(stock, demand)
    shortage = demand - sold
    stock -= sold

    total_holding_cost += stock * holding_cost_per_unit
    total_shortage_cost += shortage * shortage_cost_per_unit

    order_placed = ""
    if stock <= reorder_point and not outstanding_order:
        arrival_day = day + lead_time
        pending_orders[arrival_day] = order_quantity
        total_order_cost += order_cost
        orders_placed += 1
        outstanding_order = True
        order_placed = f"Yes (+{order_quantity} on day {arrival_day})"

    print(f"{day:<5}{start_stock:<8}{demand:<8}{sold:<8}{shortage:<8}{stock:<8}{order_placed:<10}")

total_cost = total_holding_cost + total_shortage_cost + total_order_cost

print("=" * 65)
print("                         RESULTS")
print("=" * 65)
print(f"Total Orders Placed     : {orders_placed}")
print(f"Total Holding Cost      : {total_holding_cost:.2f}")
print(f"Total Shortage Cost     : {total_shortage_cost:.2f}")
print(f"Total Ordering Cost     : {total_order_cost:.2f}")
print(f"TOTAL INVENTORY COST    : {total_cost:.2f}")
print("=" * 65)
