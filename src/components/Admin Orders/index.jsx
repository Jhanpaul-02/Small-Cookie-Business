import { useState } from "react";
import "./styles.css";

export default function AdminOrders({
  orders,
  onStatusChange,
  statusError,
  isUpdating,
  onPaymentStatusChange,
  paymentStatusError,
  isUpdatingPaymentStatus,
}) {
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredOrders =
    statusFilter === "All"
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  return (
    <section className="admin-orders" id="orders">
      <div className="admin-orders__toolbar">
        <h2>Recent orders</h2>

        <div className="admin-orders__filter">
          <label htmlFor="order-status-filter">Filter orders by status</label>
          <select
            className="admin-orders__select"
            id="order-status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Baking">Baking</option>
            <option value="Ready">Ready</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>
      <div className="admin-orders__table-wrap">
        {statusError && <p role="alert">{statusError}</p>}
        {paymentStatusError && <p role="alert">{paymentStatusError}</p>}
        <table className="admin-orders__table">
          <caption>Customer orders saved in the system.</caption>
          <thead>
            <tr>
              <th scope="col">Order</th>
              <th scope="col">Customer</th>
              <th scope="col">Order details</th>
              <th scope="col">Boxes</th>
              <th scope="col">Total</th>
              <th scope="col">Payment</th>
              <th scope="col">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>
                  <p>Phone: {order.customerPhone}</p>
                  <p>
                    {order.fulfillment === "pickup" ? "Pickup" : "Delivery"}
                  </p>

                  {order.fulfillment === "delivery" && (
                    <p>Address: {order.deliveryAddress}</p>
                  )}

                  <ul>
                    {order.items.map((item, index) => (
                      <li key={`${order.id}-${index}`}>
                        {item.productName} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>{order.boxes}</td>
                <td>{order.total}</td>
                <td>
                  <select
                    className="admin-orders__select"
                    value={order.paymentStatus}
                    aria-label={`Update payment status for order ${order.id}`}
                    disabled={isUpdatingPaymentStatus}
                    onChange={(event) =>
                      onPaymentStatusChange(order.id, event.target.value)
                    }
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid (verified)</option>
                  </select>
                </td>
                <td>
                  <select
                    className="admin-orders__select admin-orders__status"
                    value={order.status}
                    aria-label={`Update status for order ${order.id}`}
                    disabled={isUpdating}
                    onChange={(event) =>
                      onStatusChange(order.id, event.target.value)
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="Baking">Baking</option>
                    <option value="Ready">Ready</option>
                    <option value="Completed">Completed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
