import AdminNavbar from "../../components/Admin Navbar";
import AdminSummary from "../../components/Admin Summary";
import AdminOrders from "../../components/Admin Orders";
import AdminProducts from "../../components/Admin Products";
import AdminOrderSnapshot from "../../components/Admin Order Snapshot";
import AdminRevenueChart from "../../components/Admin Revenue Chart";
import AdminPopularProducts from "../../components/Admin Popular Products";
import "./styles.css";
import { useState } from "react";

export default function Admin() {
  const [products, setProducts] = useState([
    { id: "cookies", name: "Cookies", price: 200 },
    { id: "crinkles", name: "Crinkles", price: 200 },
    { id: "smores", name: "S'mores Cookies", price: 270 },
  ]);

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

  function handleAddProduct(newProduct) {
    setProducts((currentProducts) => [...currentProducts, newProduct]);
  }

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
        <AdminProducts
          products={products}
          onAdd={handleAddProduct}
          onRemove={handleRemoveProduct}
        />

        <p>These are demo values. Real orders and sales aren't saved yet.</p>
      </main>
    </div>
  );
}
