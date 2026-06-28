from dataclasses import dataclass
from collections import defaultdict
from statistics import mean
import random
import simpy


@dataclass
class Shipment:
    shipment_id: int
    time_min: float
    product: str
    qty: int


@dataclass
class Order:
    order_id: int
    time_min: float
    product: str
    qty: int


class WarehouseSimulation:
    def __init__(
        self,
        sim_minutes=480,
        seed=42,
        products=None,
        initial_inventory=None,
        shipment_rate_per_hour=14,
        order_rate_per_hour=12,
        receiving_docks=2,
        pickers=3,
        forklifts=1,
        conveyor_threshold=20,
    ):
        self.sim_minutes = sim_minutes
        self.rng = random.Random(seed)

        self.product_weights = products or {"A": 0.5, "B": 0.3, "C": 0.2}
        self.initial_inventory = initial_inventory or {}
        self.shipment_rate_per_hour = shipment_rate_per_hour
        self.order_rate_per_hour = order_rate_per_hour

        self.receiving_docks_cap = receiving_docks
        self.pickers_cap = pickers
        self.forklifts_cap = forklifts
        self.conveyor_threshold = conveyor_threshold

        self.env = simpy.Environment()

        self.receiving_docks = simpy.Resource(self.env, capacity=receiving_docks)
        self.pickers = simpy.Resource(self.env, capacity=pickers)
        self.forklifts = simpy.Resource(self.env, capacity=forklifts)
        self.inventory_lock = simpy.Resource(self.env, capacity=1)
        self.order_queue = simpy.Store(self.env)

        self.inventory = defaultdict(int)
        for p, q in self.initial_inventory.items():
            self.inventory[p] = q

        self.known_products = set(self.product_weights.keys()) | set(self.inventory.keys())

        self.next_shipment_id = 1
        self.next_order_id = 1

        self.stats = {
            "shipments_created": 0,
            "shipments_processed": 0,
            "orders_created": 0,
            "orders_fulfilled": 0,
            "receiving_busy": 0.0,
            "receiving_wait": 0.0,
            "picker_busy": 0.0,
            "picker_wait": 0.0,
            "forklift_busy": 0.0,
            "forklift_wait": 0.0,
            "conveyor_busy": 0.0,
            "stockout_checks": 0,
            "lead_times": [],
            "inventory_wait_times": [],
        }

        self.inventory_history = defaultdict(list)
        self.fulfilled_history = []

    def _choose_product(self):
        names = list(self.product_weights.keys())
        weights = list(self.product_weights.values())
        return self.rng.choices(names, weights=weights, k=1)[0]

    def _generate_random_schedule(self, rate_per_hour, kind):
        events = []
        lam_per_min = rate_per_hour / 60.0
        t = 0.0

        while t < self.sim_minutes:
            t += self.rng.expovariate(lam_per_min)
            if t >= self.sim_minutes:
                break

            product = self._choose_product()
            self.known_products.add(product)

            if kind == "shipment":
                qty = self.rng.randint(20, 60)
                events.append(Shipment(self.next_shipment_id, t, product, qty))
                self.next_shipment_id += 1
            else:
                qty = self.rng.randint(1, 10)
                events.append(Order(self.next_order_id, t, product, qty))
                self.next_order_id += 1

        return sorted(events, key=lambda x: x.time_min)

    def _init_history(self):
        for product in sorted(self.known_products):
            self.inventory_history[product] = [(0, self.inventory[product])]

    def _record_inventory(self):
        for product in sorted(self.known_products):
            self.inventory_history[product].append((self.env.now, self.inventory[product]))

    def _transport(self, qty):
        if qty <= self.conveyor_threshold:
            travel_time = 0.5 + (qty / 40.0)
            self.stats["conveyor_busy"] += travel_time
            yield self.env.timeout(travel_time)
        else:
            start_wait = self.env.now
            with self.forklifts.request() as req:
                yield req
                self.stats["forklift_wait"] += self.env.now - start_wait
                travel_time = 1.0 + (qty / 25.0)
                self.stats["forklift_busy"] += travel_time
                yield self.env.timeout(travel_time)

    def _shipment_process(self, shipment):
        yield self.env.timeout(max(0, shipment.time_min - self.env.now))
        self.stats["shipments_created"] += 1

        start_wait = self.env.now
        with self.receiving_docks.request() as req:
            yield req
            self.stats["receiving_wait"] += self.env.now - start_wait
            unload_time = 2.0 + (shipment.qty / 25.0)
            self.stats["receiving_busy"] += unload_time
            yield self.env.timeout(unload_time)

        yield from self._transport(shipment.qty)

        with self.inventory_lock.request() as req:
            yield req
            self.inventory[shipment.product] += shipment.qty
            self._record_inventory()

        self.stats["shipments_processed"] += 1

    def _order_process(self, order):
        yield self.env.timeout(max(0, order.time_min - self.env.now))
        self.stats["orders_created"] += 1
        yield self.order_queue.put(order)

    def _picking_worker(self):
        while True:
            order = yield self.order_queue.get()

            inventory_wait_start = self.env.now
            reserved = False

            while not reserved:
                with self.inventory_lock.request() as req:
                    yield req
                    if self.inventory[order.product] >= order.qty:
                        self.inventory[order.product] -= order.qty
                        reserved = True
                        self._record_inventory()
                    else:
                        self.stats["stockout_checks"] += 1

                if not reserved:
                    yield self.env.timeout(1)

            self.stats["inventory_wait_times"].append(self.env.now - inventory_wait_start)

            start_wait = self.env.now
            with self.pickers.request() as req:
                yield req
                self.stats["picker_wait"] += self.env.now - start_wait
                pick_time = 1.5 + (order.qty / 20.0)
                self.stats["picker_busy"] += pick_time
                yield self.env.timeout(pick_time)

            yield from self._transport(order.qty)

            self.stats["orders_fulfilled"] += 1
            self.stats["lead_times"].append(self.env.now - order.time_min)
            self.fulfilled_history.append((self.env.now, self.stats["orders_fulfilled"]))

    def run(self):
        shipments = self._generate_random_schedule(self.shipment_rate_per_hour, "shipment")
        orders = self._generate_random_schedule(self.order_rate_per_hour, "order")

        for s in shipments:
            self.known_products.add(s.product)
        for o in orders:
            self.known_products.add(o.product)

        self._init_history()

        for _ in range(self.pickers_cap):
            self.env.process(self._picking_worker())

        for shipment in shipments:
            self.env.process(self._shipment_process(shipment))

        for order in orders:
            self.env.process(self._order_process(order))

        self.env.run(until=self.sim_minutes)

        return self._report_data()

    def _report_data(self):
        orders_created = self.stats["orders_created"]
        fulfilled = self.stats["orders_fulfilled"]

        fulfillment_rate = (fulfilled / orders_created * 100) if orders_created else 0
        avg_lead_time = mean(self.stats["lead_times"]) if self.stats["lead_times"] else 0
        avg_inv_wait = mean(self.stats["inventory_wait_times"]) if self.stats["inventory_wait_times"] else 0

        receiving_util = (self.stats["receiving_busy"] / (self.receiving_docks_cap * self.sim_minutes)) * 100 if self.receiving_docks_cap else 0
        picker_util = (self.stats["picker_busy"] / (self.pickers_cap * self.sim_minutes)) * 100 if self.pickers_cap else 0
        forklift_util = (self.stats["forklift_busy"] / (self.forklifts_cap * self.sim_minutes)) * 100 if self.forklifts_cap else 0

        return {
            "summary": {
                "simulation_time": self.sim_minutes,
                "shipments_created": self.stats["shipments_created"],
                "shipments_processed": self.stats["shipments_processed"],
                "orders_created": orders_created,
                "orders_fulfilled": fulfilled,
                "orders_pending": orders_created - fulfilled,
                "fulfillment_rate": fulfillment_rate,
                "avg_lead_time": avg_lead_time,
                "avg_inventory_wait": avg_inv_wait,
                "stockout_checks": self.stats["stockout_checks"],
                "receiving_util": receiving_util,
                "picker_util": picker_util,
                "forklift_util": forklift_util,
            },
            "inventory_history": dict(self.inventory_history),
            "fulfilled_history": self.fulfilled_history,
            "lead_times": self.stats["lead_times"],
            "final_inventory": dict(self.inventory),
        }