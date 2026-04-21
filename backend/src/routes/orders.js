const express             = require('express');
const router              = express.Router();
const db                  = require('../db');
const { sendOrderToTelegram } = require('../services/telegram');
const authMiddleware      = require('../middleware/auth');

// POST /api/orders ────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { id, customerName, phone, address, items, totalPrice, guestEmail } = req.body;

  if (!customerName || !phone || !address || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'customerName, phone, address and items are required' });
  }

  // Resolve user_id from JWT if token is present (optional auth)
  let userId = null;
  const header = req.headers['authorization'];
  if (header) {
    try {
      const jwt = require('jsonwebtoken');
      const token = header.startsWith('Bearer ') ? header.slice(7) : header;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch {
      // token invalid — treat as guest, don't block the request
    }
  }

  const orderId   = id || `order-${Date.now()}`;
  const createdAt = new Date();
  const total     = parseFloat(totalPrice) || 0;

  try {
    await db.query(
      `INSERT INTO orders (id, customer_name, phone, address, items, total_price, created_at, guest_email, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [orderId, customerName, phone, address, JSON.stringify(items), total, createdAt,
       guestEmail || null, userId],
    );

    const order = { id: orderId, customerName, phone, address, items, totalPrice: total, createdAt };

    sendOrderToTelegram(order).catch((err) =>
      console.error('Telegram notification failed:', err.message),
    );

    res.status(201).json({ ...order, status: 'sent' });
  } catch (err) {
    console.error('POST /orders:', err.message);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET /api/orders/my — история заказов авторизованного пользователя
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id],
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /orders/my:', err.message);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;
