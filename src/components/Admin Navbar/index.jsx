import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "./styles.css";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const [signOutError, setSignOutError] = useState("");

  async function handleSignOut() {
    setSignOutError("");

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out failed:", error);
        setSignOutError("Could not sign out. Please try again.");
        return;
      }

      navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error("Sign out failed:", error);
      setSignOutError("Could not sign out. Please try again.");
    }
  }
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
      {signOutError && <p role="alert">{signOutError}</p>}
      <button type="button" onClick={handleSignOut}>
        Sign out
      </button>
    </aside>
  );
}
