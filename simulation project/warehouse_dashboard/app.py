import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
from warehouse_simulation import WarehouseSimulation

st.set_page_config(page_title="Warehouse Simulation Dashboard", layout="wide")

st.title("Warehouse Operation Simulation Dashboard")
st.write("Run a warehouse simulation with adjustable parameters and view the results instantly.")

# Sidebar controls
st.sidebar.header("Simulation Controls")

sim_minutes = st.sidebar.slider("Simulation time (minutes)", 60, 1440, 480, 60)
seed = st.sidebar.number_input("Random seed", value=42, step=1)

shipment_rate = st.sidebar.slider("Shipment rate per hour", 0, 60, 14)
order_rate = st.sidebar.slider("Order rate per hour", 0, 60, 12)

receiving_docks = st.sidebar.slider("Receiving docks", 1, 10, 2)
pickers = st.sidebar.slider("Pickers", 1, 10, 3)
forklifts = st.sidebar.slider("Forklifts", 1, 5, 1)

conveyor_threshold = st.sidebar.slider("Conveyor threshold (units)", 1, 100, 20)

st.sidebar.subheader("Initial Inventory")
init_a = st.sidebar.number_input("Product A", min_value=0, value=50)
init_b = st.sidebar.number_input("Product B", min_value=0, value=40)
init_c = st.sidebar.number_input("Product C", min_value=0, value=30)

run_button = st.sidebar.button("Run Simulation")

if run_button:
    sim = WarehouseSimulation(
        sim_minutes=sim_minutes,
        seed=seed,
        shipment_rate_per_hour=shipment_rate,
        order_rate_per_hour=order_rate,
        receiving_docks=receiving_docks,
        pickers=pickers,
        forklifts=forklifts,
        conveyor_threshold=conveyor_threshold,
        initial_inventory={"A": init_a, "B": init_b, "C": init_c},
    )

    results = sim.run()
    summary = results["summary"]

    # Metrics row
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Orders Created", summary["orders_created"])
    col2.metric("Orders Fulfilled", summary["orders_fulfilled"])
    col3.metric("Fulfillment Rate", f"{summary['fulfillment_rate']:.2f}%")
    col4.metric("Avg Lead Time", f"{summary['avg_lead_time']:.2f} min")

    col5, col6, col7, col8 = st.columns(4)
    col5.metric("Shipments Created", summary["shipments_created"])
    col6.metric("Shipments Processed", summary["shipments_processed"])
    col7.metric("Receiving Utilization", f"{summary['receiving_util']:.2f}%")
    col8.metric("Picker Utilization", f"{summary['picker_util']:.2f}%")

    st.divider()

    left, right = st.columns(2)

    with left:
        st.subheader("Final Inventory")
        inventory_df = pd.DataFrame(
            list(results["final_inventory"].items()),
            columns=["Product", "Units"]
        ).sort_values("Product")
        st.dataframe(inventory_df, use_container_width=True)

        st.subheader("Lead Time Statistics")
        if results["lead_times"]:
            lead_df = pd.DataFrame(results["lead_times"], columns=["Lead Time"])
            st.dataframe(lead_df.describe(), use_container_width=True)
        else:
            st.info("No fulfilled orders to analyze.")

    with right:
        st.subheader("Fulfillment and Utilization")
        chart_df = pd.DataFrame({
            "Metric": ["Fulfillment Rate", "Receiving Utilization", "Picker Utilization", "Forklift Utilization"],
            "Value": [summary["fulfillment_rate"], summary["receiving_util"], summary["picker_util"], summary["forklift_util"]],
        })
        st.bar_chart(chart_df.set_index("Metric"))

    st.divider()

    # Inventory chart
    st.subheader("Inventory Levels Over Time")
    fig, ax = plt.subplots(figsize=(12, 5))

    for product, points in results["inventory_history"].items():
        times = [p[0] for p in points]
        values = [p[1] for p in points]
        ax.step(times, values, where="post", label=f"Product {product}")

    ax.set_xlabel("Time (minutes)")
    ax.set_ylabel("Units")
    ax.set_title("Inventory Levels Over Time")
    ax.legend()
    ax.grid(True, alpha=0.3)
    st.pyplot(fig)

    # Lead time histogram
    st.subheader("Order Lead Time Distribution")
    fig2, ax2 = plt.subplots(figsize=(12, 5))

    if results["lead_times"]:
        ax2.hist(results["lead_times"], bins=12, color="orange", edgecolor="black")
    ax2.set_xlabel("Lead Time (minutes)")
    ax2.set_ylabel("Frequency")
    ax2.set_title("Lead Time Histogram")
    ax2.grid(True, alpha=0.3)
    st.pyplot(fig2)

    # Fulfilled orders trend
    st.subheader("Cumulative Orders Fulfilled")
    fig3, ax3 = plt.subplots(figsize=(12, 5))

    if results["fulfilled_history"]:
        times = [0] + [p[0] for p in results["fulfilled_history"]]
        counts = [0] + [p[1] for p in results["fulfilled_history"]]
        ax3.step(times, counts, where="post", color="green")
    ax3.set_xlabel("Time (minutes)")
    ax3.set_ylabel("Orders")
    ax3.set_title("Cumulative Orders Fulfilled")
    ax3.grid(True, alpha=0.3)
    st.pyplot(fig3)

    st.divider()
    st.subheader("Simulation Notes")
    st.write(f"Stockout checks: **{summary['stockout_checks']}**")
    st.write(f"Average inventory wait time: **{summary['avg_inventory_wait']:.2f} minutes**")
    st.write(f"Orders still pending: **{summary['orders_pending']}**")
else:
    st.info("Adjust the settings in the sidebar and click **Run Simulation**.")