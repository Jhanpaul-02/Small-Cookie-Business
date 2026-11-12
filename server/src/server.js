import express from 'express';
import { pool } from "./db.js";
import { requireAdmin } from "./middleware/requireAdmin.js";

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Khaleb’s Cookies API is running.' });
});

app.get("/api/db-health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS database_time");
    res.json({ status: "ok", databaseTime: result.rows[0].database_time });
  } catch (error) {
    console.error("Database health check failed:", error.message);
    res.status(500).json({
      status: "error",
      message: "Database connection failed.",
    });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, price, style
       FROM public.products
       WHERE is_active = TRUE
       ORDER BY created_at ASC`,
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Products fetch failed:", error.message);
    res.status(500).json({ message: "Could not load products." });
  }
});

app.post("/api/products", requireAdmin, async (req, res) => {
  const name =
    typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const price = Number(req.body?.price);

  if (!name || !Number.isFinite(price) || price <= 0) {
    return res.status(400).json({
      message: "Enter a product name and a price greater than zero.",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO public.products (name, price)
       VALUES ($1, $2)
       RETURNING id, name, description, price, style`,
      [name, price],
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Product creation failed:", error.message);
    return res.status(500).json({ message: "Could not save the product." });
  }
});

app.get("/api/admin/check", requireAdmin, (req, res) => {
  res.json({ status: "ok", message: "Admin authorization verified." });
});

app.listen(PORT, () => {
  console.log(`API server listening at http://localhost:${PORT}`);
});