import "./styles.css";

const samplePopularProducts = [
  { id: "cookies", name: "Cookies", boxesSold: 18 },
  { id: "crinkles", name: "Crinkles", boxesSold: 14 },
  { id: "smores", name: "S'mores Cookies", boxesSold: 9 },
];

export default function AdminPopularProducts() {
  return (
    <section
      className="admin-popular-products"
      aria-labelledby="admin-popular-products-title"
    >
      <h2 id="admin-popular-products-title">Popular products</h2>
      <p>Demo sales only—not actual orders.</p>

      <ol>
        {samplePopularProducts.map((product) => (
          <li key={product.id}>
            <span>{product.name}</span>
            <span>{product.boxesSold} boxes sold</span>
          </li>
        ))}
      </ol>
    </section>
  );
}