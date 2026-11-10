import "./styles.css";

const sampleRevenue = [
  { day: "Mon", amount: 135 },
  { day: "Tue", amount: 148 },
  { day: "Wed", amount: 152 },
  { day: "Thu", amount: 182 },
  { day: "Fri", amount: 205 },
  { day: "Sat", amount: 170 },
  { day: "Sun", amount: 144 },
];

export default function AdminRevenueChart() {
  const maxRevenue = Math.max(
    ...sampleRevenue.map((item) => item.amount),
  );

  return (
    <section
      className="admin-revenue-chart"
      aria-labelledby="admin-revenue-chart-title"
    >
      <h2 id="admin-revenue-chart-title">Weekly revenue</h2>
      <p>Sample data only—not actual sales.</p>

      <div className="admin-revenue-chart__bars">
        {sampleRevenue.map((item) => (
          <div className="admin-revenue-chart__day" key={item.day}>
            <span>₱{item.amount}</span>
            <div className="admin-revenue-chart__track" aria-hidden="true">
              <div
                className="admin-revenue-chart__bar"
                style={{ height: `${(item.amount / maxRevenue) * 100}%` }}
              />
            </div>
            <span>{item.day}</span>
          </div>
        ))}
      </div>
    </section>
  );
}