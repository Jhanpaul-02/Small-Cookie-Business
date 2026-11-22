import { useState } from "react";
import { supabase } from "../../lib/supabase";
import "./styles.css";

export default function AdminProducts({ products, onAdd, onRemove }) {
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [productError, setProductError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [removingProductId, setRemovingProductId] = useState(null);
  const [newProductImage, setNewProductImage] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = newProductName.trim();
    const price = Number(newProductPrice);

    if (!name || !Number.isFinite(price) || price <= 0) {
      setProductError("Enter a product name and a price greater than zero.");
      return;
    }

    setProductError("");
    if (
      !newProductImage ||
      !["image/jpeg", "image/png", "image/webp"].includes(
        newProductImage.type,
      ) ||
      newProductImage.size > 5 * 1024 * 1024
    ) {
      setProductError("Choose a JPEG, PNG, or WebP photo no larger than 5 MB.");
      return;
    }
    setIsSaving(true);

    try {
      await onAdd({ name, price, imageFile: newProductImage });
      setNewProductName("");
      setNewProductPrice("");
      setNewProductImage(null);
      form.reset();
    } catch (error) {
      console.error("Could not add product:", error);
      setProductError("Could not save product. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }
  async function handleRemoveClick(productId) {
    setProductError("");
    setRemovingProductId(productId);

    try {
      await onRemove(productId);
    } catch (error) {
      console.error("Could not remove product:", error);
      setProductError("Could not remove product. Please try again.");
    } finally {
      setRemovingProductId(null);
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
        <label className="admin-products__field" htmlFor="product-image">
          Product photo
          <input
            id="product-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            onChange={(event) =>
              setNewProductImage(event.target.files?.[0] ?? null)
            }
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
        {products.map((product) => {
          const imageUrl = product.imagePath
            ? supabase.storage
                .from("product-images")
                .getPublicUrl(product.imagePath).data.publicUrl
            : null;

          return (
            <article key={product.id} className="admin-products__card">
              {imageUrl ? (
                <img
                  className="admin-products__image"
                  src={imageUrl}
                  alt={product.name}
                />
              ) : (
                <p>No photo uploaded yet.</p>
              )}
              <h3>{product.name}</h3>
              <p>Price per box: ₱{product.price}</p>
              <button
                type="button"
                className="admin-products__remove-button"
                onClick={() => handleRemoveClick(product.id)}
                disabled={removingProductId !== null}
                aria-label={`Remove ${product.name}`}
              >
                {removingProductId === product.id ? "Removing..." : "Remove"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
