import express from 'express';
import { pool } from "./db.js";

const app = express();
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

app.listen(PORT, () => {
  console.log(`API server listening at http://localhost:${PORT}`);
});