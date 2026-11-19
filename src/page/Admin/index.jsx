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
  const manilaDateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [products, setProducts] = useState([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [orders, setOrders] = useState([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [orderStatusError, setOrderStatusError] = useState("");
  const [isUpdatingOrderStatus, setIsUpdatingOrderStatus] = useState(false);
  const [paymentStatusError, setPaymentStatusError] = useState("");
  const [isUpdatingPaymentStatus, setIsUpdatingPaymentStatus] = useState(false);

  const today = manilaDateFormatter.format(new Date());

  const ordersToday = orders.filter(
    (order) => manilaDateFormatter.format(new Date(order.createdAt)) === today,
  );

  const paidOrdersToday = ordersToday.filter(
    (order) => order.paymentStatus === "paid",
  );

  const salesToday = paidOrdersToday.reduce(
    (sum, order) => sum + order.totalAmount,
    0,
  );

  const dashboardStats = [
    {
      label: "Sales today",
      value: `₱${salesToday.toLocaleString("en-PH")}`,
    },
    { label: "Orders today", value: ordersToday.length },
    { label: "Products", value: products.length },
  ];

  async function handleRemoveProduct(productId) {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) throw sessionError;
    if (!session) throw new Error("Please sign in again.");

    const response = await fetch(`/api/products/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || "Could not remove product.");
    }

    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== productId),
    );
  }

  async function handleOrderStatusChange(orderId, newStatus) {
    setOrderStatusError("");
    setIsUpdatingOrderStatus(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!session) throw new Error("Please sign in again.");

      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not update order status.");
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === result.id ? { ...order, status: result.status } : order,
        ),
      );
    } catch (error) {
      console.error("Could not update order status:", error);
      setOrderStatusError("Could not save the order status. Please try again.");
    } finally {
      setIsUpdatingOrderStatus(false);
    }
  }

  async function handlePaymentStatusChange(orderId, newPaymentStatus) {
    setPaymentStatusError("");
    setIsUpdatingPaymentStatus(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!session) throw new Error("Please sign in again.");

      const response = await fetch(`/api/orders/${orderId}/payment-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not update payment status.");
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === result.id
            ? { ...order, paymentStatus: result.paymentStatus }
            : order,
        ),
      );
    } catch (error) {
      console.error("Could not update payment status:", error);
      setPaymentStatusError("Could not save payment status. Please try again.");
    } finally {
      setIsUpdatingPaymentStatus(false);
    }
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

  useEffect(() => {
    const controller = new AbortController();

    async function loadOrders() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        if (!session) throw new Error("Please sign in again.");

        const response = await fetch("/api/orders", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();

        setOrders(
          data.map((order) => ({
            ...order,
            totalAmount: Number(order.total),
            total: `₱${Number(order.total).toLocaleString("en-PH")}`,
          })),
        );
      } catch (error) {
        if (error.name === "AbortError") return;

        console.error("Could not load admin orders:", error);
        setOrdersError("Could not load orders from the server.");
      } finally {
        if (!controller.signal.aborted) {
          setIsOrdersLoading(false);
        }
      }
    }

    loadOrders();

    return () => controller.abort();
  }, []);
  return (
    <div className="admin-layout">
      <AdminNavbar />
      <main className="admin-content">
        <h1>Khaleb's Cookies Admin</h1>

        <AdminSummary stats={dashboardStats} />
        {isOrdersLoading ? (
          <p role="status">Loading orders...</p>
        ) : ordersError ? (
          <p role="alert">{ordersError}</p>
        ) : (
          <AdminOrderSnapshot orders={orders} />
        )}
        <div className="admin-analytics">
          <AdminRevenueChart />
          <AdminPopularProducts />
        </div>
        {!isOrdersLoading && !ordersError && (
          <AdminOrders
            orders={orders}
            onStatusChange={handleOrderStatusChange}
            statusError={orderStatusError}
            isUpdating={isUpdatingOrderStatus}
            onPaymentStatusChange={handlePaymentStatusChange}
            paymentStatusError={paymentStatusError}
            isUpdatingPaymentStatus={isUpdatingPaymentStatus}
          />
        )}
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
        <p>
          Revenue and popular-product analytics are demo values. Sales counts
          paid orders; Orders today counts all orders.
        </p>
      </main>
    </div>
  );
}
