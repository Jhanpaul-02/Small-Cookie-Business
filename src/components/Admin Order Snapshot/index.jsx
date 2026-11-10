import "./styles.css";

export default function AdminOrderSnapshot({ orders }) {
  const stages = ["Pending", "Baking", "Ready", "Completed"];

  return (
    <section className="admin-order-snapshot">
      <h2>Order snapshot</h2>
      <div className="admin-order-snapshot__counts">
        {stages.map((status) => {
          const count = orders.filter(
            (order) => order.status === status,
          ).length;

          return (
            <article key={status} className="admin-order-snapshot__card">
              <h3>{status}</h3>
              <p>{count}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}