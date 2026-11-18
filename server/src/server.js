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

app.delete("/api/products/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  ) {
    return res.status(400).json({ message: "Invalid product ID." });
  }

  try {
    const result = await pool.query(
      `UPDATE public.products
       SET is_active = FALSE
       WHERE id = $1 AND is_active = TRUE
       RETURNING id`,
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Active product not found." });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Product removal failed:", error.message);
    return res.status(500).json({ message: "Could not remove the product." });
  }
});

app.post("/api/orders", async (req, res) => {
  const customerName =
    typeof req.body?.customerName === "string"
      ? req.body.customerName.trim()
      : "";
  const customerPhone =
    typeof req.body?.customerPhone === "string"
      ? req.body.customerPhone.trim()
      : "";
  const fulfillment = req.body?.fulfillment;
  const deliveryAddress =
    typeof req.body?.deliveryAddress === "string"
      ? req.body.deliveryAddress.trim()
      : "";
  const rawItems = req.body?.items;

  if (
    !customerName ||
    !customerPhone ||
    !["pickup", "delivery"].includes(fulfillment) ||
    (fulfillment === "delivery" && !deliveryAddress) ||
    !Array.isArray(rawItems) ||
    rawItems.length === 0
  ) {
    return res.status(400).json({ message: "Invalid order details." });
  }

  const items = rawItems.map((item) => ({
    productId:
      typeof item?.productId === "string" ? item.productId : "",
    quantity: item?.quantity,
  }));

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (
    items.some(
      (item) =>
        !uuidPattern.test(item.productId) ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity <= 0,
    ) ||
    new Set(items.map((item) => item.productId)).size !== items.length
  ) {
    return res.status(400).json({ message: "Invalid order items." });
  }

  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const productIds = items.map((item) => item.productId);
    const quantities = items.map((item) => item.quantity);

    const availableProducts = await client.query(
      `SELECT id
       FROM public.products
       WHERE id = ANY($1::uuid[]) AND is_active = TRUE
       FOR SHARE`,
      [productIds],
    );

    if (availableProducts.rowCount !== items.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "One or more selected products are unavailable.",
      });
    }

    const totalResult = await client.query(
      `SELECT SUM(p.price * item.quantity)::numeric(10, 2) AS total
       FROM public.products p
       JOIN unnest($1::uuid[], $2::integer[])
         AS item(product_id, quantity)
         ON p.id = item.product_id`,
      [productIds, quantities],
    );

    const orderResult = await client.query(
      `INSERT INTO public.orders
         (customer_name, customer_phone, fulfillment, delivery_address, total)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, total, status,
                 payment_status AS "paymentStatus",
                 created_at AS "createdAt"`,
      [
        customerName,
        customerPhone,
        fulfillment,
        fulfillment === "delivery" ? deliveryAddress : null,
        totalResult.rows[0].total,
      ],
    );

    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      await client.query(
        `INSERT INTO public.order_items
           (order_id, product_id, product_name, quantity, unit_price, line_total)
         SELECT $1, id, name, $3::integer, price, price * ($3::integer)
         FROM public.products
         WHERE id = $2 AND is_active = TRUE`,
        [orderId, item.productId, item.quantity],
      );
    }

    await client.query("COMMIT");
    return res.status(201).json(orderResult.rows[0]);
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Order rollback failed:", rollbackError.message);
      }
    }

    console.error("Order creation failed:", error.message);
    return res.status(500).json({ message: "Could not save the order." });
  } finally {
    if (client) client.release();
  }
});

app.get("/api/admin/check", requireAdmin, (req, res) => {
  res.json({ status: "ok", message: "Admin authorization verified." });
});

app.listen(PORT, () => {
  console.log(`API server listening at http://localhost:${PORT}`);
});