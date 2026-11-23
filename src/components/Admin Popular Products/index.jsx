import "./styles.css";

export default function AdminPopularProducts({ orders, isLoading, error }) {
  const productCounts = new Map();

  for (const order of orders) {
    for (const item of order.items ?? []) {
      const currentCount = productCounts.get(item.productName) ?? 0;
      productCounts.set(
        item.productName,
        currentCount + Number(item.quantity),
      );
    }
  }

  const popularProducts = Array.from(
    productCounts,
    ([name, boxesOrdered]) => ({ name, boxesOrdered }),
  )
    .sort((a, b) => b.boxesOrdered - a.boxesOrdered)
    .slice(0, 3);

  return (
    <section
      className="admin-popular-products"
      aria-labelledby="admin-popular-products-title"
    >
      <h2 id="admin-popular-products-title">Popular products</h2>
      <p>Counts boxes ordered, including unpaid orders.</p>

      {isLoading ? (
        <p role="status">Loading product orders...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : popularProducts.length === 0 ? (
        <p>No order items yet.</p>
      ) : (
        <ol>
          {popularProducts.map((product) => (
            <li key={product.name}>
              <span>{product.name}</span>
              <span>{product.boxesOrdered} boxes ordered</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}