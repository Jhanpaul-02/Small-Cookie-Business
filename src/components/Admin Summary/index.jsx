import "./styles.css";

export default function AdminSummary({ stats }) {
  return (
    <section className="admin-summary" aria-label="Business summary">
      {stats.map((stat) => (
        <article className="admin-summary__card" key={stat.label}>
          <h2>{stat.label}</h2>
          <p>{stat.value}</p>
        </article>
      ))}
    </section>
  );
}