import { useState } from "react";
import "./styles.css";

export default function AdminProducts({ products, onAdd, onRemove }) {
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [productError, setProductError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const name = newProductName.trim();
    const price = Number(newProductPrice);

    if (!name || !Number.isFinite(price) || price <= 0) {
      setProductError("Enter a product name and a price greater than zero.");
      return;
    }

    setProductError("");
    setIsSaving(true);

    try {
      await onAdd({ name, price });
      setNewProductName("");
      setNewProductPrice("");
    } catch (error) {
      console.error("Could not add product:", error);
      setProductError("Could not save product. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section id="products" className="admin-products">
      <h2>Products</h2>

      <form onSubmit={handleSubmit} className="admin-products__form">
        <label className="admin-products__field" htmlFor="product-name">
          Product name
          <input
            id="product-name"
            value={newProductName}
            onChange={(event) => setNewProductName(event.target.value)}
            required
          />
        </label>
        <label className="admin-products__field" htmlFor="product-price">
          Price per box
          <input
            id="product-price"
            type="number"
            min="1"
            step="1"
            value={newProductPrice}
            onChange={(event) => setNewProductPrice(event.target.value)}
            required
          />
        </label>

        {productError && (
          <p role="alert" className="admin-products__error">
            {productError}
          </p>
        )}
        <button
          type="submit"
          className="admin-products__add-button"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Add product"}
        </button>
      </form>

      <div className="admin-products__grid">
        {products.map((product) => (
          <article key={product.id} className="admin-products__card">
            <h3>{product.name}</h3>
            <p>Price per box: ₱{product.price}</p>
            <button
              type="button"
              className="admin-products__remove-button"
              onClick={() => onRemove(product.id)}
              aria-label={`Remove ${product.name}`}
            >
              Remove
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
