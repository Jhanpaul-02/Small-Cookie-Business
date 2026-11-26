import express from "express";
import { pool } from "./db.js";
import { requireAdmin } from "./middleware/requireAdmin.js";

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Khaleb’s Cookies API is running." });
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
      `SELECT id, name, description, price, style,
      image_path AS "imagePath"
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
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const price = Number(req.body?.price);
  const imagePath =
    typeof req.body?.imagePath === "string" ? req.body.imagePath.trim() : "";

  if (!name || !Number.isFinite(price) || price <= 0 || !imagePath) {
    return res.status(400).json({
      message: "Enter a product name, a valid price, and a product photo.",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO public.products (name, price, image_path)
        VALUES ($1, $2, $3)
        RETURNING id, name, description, price, style, image_path AS "imagePath"`,
      [name, price, imagePath],
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

app.patch("/api/products/:id/image", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const imagePath =
    typeof req.body?.imagePath === "string" ? req.body.imagePath.trim() : "";

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(id)) {
    return res.status(400).json({ message: "Invalid product ID." });
  }

  const ownedImagePattern = new RegExp(
    `^${req.user.id}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(jpg|png|webp)$`,
    "i",
  );

  if (!ownedImagePattern.test(imagePath)) {
    return res.status(400).json({ message: "Invalid product image path." });
  }

  try {
    const result = await pool.query(
      `UPDATE public.products
       SET image_path = $2
       WHERE id = $1 AND is_active = TRUE
       RETURNING id, name, description, price, style,
                 image_path AS "imagePath"`,
      [id, imagePath],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Active product not found." });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Product image update failed:", error.message);
    return res
      .status(500)
      .json({ message: "Could not update the product image." });
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
    productId: typeof item?.productId === "string" ? item.productId : "",
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

app.get("/api/orders", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         o.id,
         o.customer_name AS customer,
         o.customer_phone AS "customerPhone",
         o.fulfillment,
         o.delivery_address AS "deliveryAddress",
         o.total,
         o.status,
         o.payment_status AS "paymentStatus",
         o.created_at AS "createdAt",
         o.paid_at AS "paidAt",
         COALESCE(SUM(oi.quantity), 0)::integer AS boxes,
         COALESCE(
           json_agg(
             json_build_object(
               'productName', oi.product_name,
               'quantity', oi.quantity,
               'unitPrice', oi.unit_price,
               'lineTotal', oi.line_total
             )
           ) FILTER (WHERE oi.order_id IS NOT NULL),
           '[]'::json
         ) AS items
       FROM public.orders o
       LEFT JOIN public.order_items oi ON oi.order_id = o.id
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Orders fetch failed:", error.message);
    return res.status(500).json({ message: "Could not load orders." });
  }
});

app.patch("/api/orders/:id/status", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body ?? {};
  const allowedStatuses = ["Pending", "Baking", "Ready", "Completed"];

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  ) {
    return res.status(400).json({ message: "Invalid order ID." });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid order status." });
  }

  try {
    const result = await pool.query(
      `UPDATE public.orders
       SET status = $2
       WHERE id = $1
       RETURNING id, status`,
      [id, status],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Order not found." });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Order status update failed:", error.message);
    return res.status(500).json({ message: "Could not update order status." });
  }
});

app.patch("/api/orders/:id/payment-status", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { paymentStatus } = req.body ?? {};
  const allowedPaymentStatuses = ["unpaid", "paid"];

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  ) {
    return res.status(400).json({ message: "Invalid order ID." });
  }

  if (!allowedPaymentStatuses.includes(paymentStatus)) {
    return res.status(400).json({ message: "Invalid payment status." });
  }

  try {
    const result = await pool.query(
      `UPDATE public.orders
 SET payment_status = $2,
     paid_at = CASE
       WHEN $2 = 'paid' THEN COALESCE(paid_at, NOW())
       ELSE NULL
     END
 WHERE id = $1
 RETURNING id,
           payment_status AS "paymentStatus",
           paid_at AS "paidAt"`,
      [id, paymentStatus],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Order not found." });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Payment status update failed:", error.message);
    return res
      .status(500)
      .json({ message: "Could not update payment status." });
  }
});

app.get("/api/admin/check", requireAdmin, (req, res) => {
  res.json({ status: "ok", message: "Admin authorization verified." });
});

app.listen(PORT, () => {
  console.log(`API server listening at http://localhost:${PORT}`);
});
