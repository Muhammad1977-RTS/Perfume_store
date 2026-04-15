const express             = require('express');
const router              = express.Router();
const db                  = require('../db');
const { sendOrderToTelegram } = require('../services/telegram');

// POST /api/orders ────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { id, customerName, phone, address, items, totalPrice } = req.body;

  if (!customerName || !phone || !address || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'customerName, phone, address and items are required' });
  }

  const orderId    = id  || `order-${Date.now()}`;
  const createdAt  = new Date();
  const total      = parseFloat(totalPrice) || 0;

  try {
    await db.query(
      `INSERT INTO orders (id, customer_name, phone, address, items, total_price, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [orderId, customerName, phone, address, JSON.stringify(items), total, createdAt],
    );

    const order = { id: orderId, customerName, phone, address, items, totalPrice: total, createdAt };

    // Send Telegram notification (non-blocking — never fail the response)
    sendOrderToTelegram(order).catch((err) =>
      console.error('Telegram notification failed:', err.message),
    );

    res.status(201).json({ ...order, status: 'sent' });
  } catch (err) {
    console.error('POST /orders:', err.message);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

module.exports = router;
