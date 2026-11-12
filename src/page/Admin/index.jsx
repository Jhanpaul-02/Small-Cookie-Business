import AdminNavbar from "../../components/Admin Navbar";
import AdminSummary from "../../components/Admin Summary";
import AdminOrders from "../../components/Admin Orders";
import AdminProducts from "../../components/Admin Products";
import AdminOrderSnapshot from "../../components/Admin Order Snapshot";
import AdminRevenueChart from "../../components/Admin Revenue Chart";
import AdminPopularProducts from "../../components/Admin Popular Products";
import "./styles.css";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  const sampleStats = [
    { label: "Sales today", value: "₱0" },
    { label: "Orders today", value: "0" },
    { label: "Products", value: products.length },
  ];

  const [orders, setOrders] = useState([
    {
      id: "DEMO-001",
      customer: "Demo Customer",
      boxes: 2,
      total: "₱400",
      status: "Pending",
    },
    {
      id: "DEMO-002",
      customer: "Demo Customer",
      boxes: 1,
      total: "₱270",
      status: "Completed",
    },
  ]);

  function handleRemoveProduct(productId) {
    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== productId),
    );
  }

  function handleOrderStatusChange(orderId, newStatus) {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      ),
    );
  }

    async function handleAddProduct(newProduct) {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) throw sessionError;
    if (!session) throw new Error("Please sign in again.");

    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(newProduct),
    });

    const savedProduct = await response.json();

    if (!response.ok) {
      throw new Error(savedProduct.message || "Could not save product.");
    }

    setProducts((currentProducts) => [
      ...currentProducts,
      { ...savedProduct, price: Number(savedProduct.price) },
    ]);
  }

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch("/api/products", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        setProducts(
          data.map((product) => ({
            ...product,
            price: Number(product.price),
          })),
        );
      } catch (error) {
        if (error.name === "AbortError") return;

        console.error("Could not load admin products:", error);
        setProductsError("Could not load products from the server.");
      } finally {
        if (!controller.signal.aborted) {
          setIsProductsLoading(false);
        }
      }
    }

    loadProducts();
    return () => controller.abort();
  }, []);

  return (
    <div className="admin-layout">
      <AdminNavbar />
      <main className="admin-content">
        <h1>Khaleb's Cookies Admin</h1>
        <p>Dashboard overview — sample values only</p>

        <AdminSummary stats={sampleStats} />
        <AdminOrderSnapshot orders={orders} />
        <div className="admin-analytics">
          <AdminRevenueChart />
          <AdminPopularProducts />
        </div>
        <AdminOrders orders={orders} onStatusChange={handleOrderStatusChange} />
        {isProductsLoading ? (
          <p role="status">Loading products...</p>
        ) : productsError ? (
          <p role="alert">{productsError}</p>
        ) : (
          <AdminProducts
            products={products}
            onAdd={handleAddProduct}
            onRemove={handleRemoveProduct}
          />
        )}

        <p>These are demo values. Real orders and sales aren't saved yet.</p>
      </main>
    </div>
  );
}
