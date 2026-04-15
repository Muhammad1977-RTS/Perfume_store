require('dotenv').config();
const express  = require('express');
const cors     = require('cors');

const productsRouter = require('./routes/products');
const ordersRouter   = require('./routes/orders');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/products', productsRouter);
app.use('/api/orders',   ordersRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Perfume Store API → http://localhost:${PORT}`);
});
