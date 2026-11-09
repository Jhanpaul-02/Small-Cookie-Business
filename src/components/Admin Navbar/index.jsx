import "./styles.css";

export default function AdminNavbar() {
  return (
    <aside className="admin-sidebar">
      <h2>Khaleb's Cookies</h2>
      <p>Owner dashboard</p>

      <nav aria-label="Admin navigation">
        <a href="/admin" aria-current="page">
          Overview
        </a>
        <a href="/admin#orders">Orders</a>
        <a href="/admin#products">Products</a>

        <a href="/">View cookie shop</a>
      </nav>
    </aside>
  );
}
