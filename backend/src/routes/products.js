const express         = require('express');
const router          = express.Router();
const db              = require('../db');
const adminMiddleware = require('../middleware/admin');

// Helpers ────────────────────────────────────────────────────────────────────

/** Map a DB row to the camelCase shape the frontend expects */
function toApi(row) {
  return {
    id:          row.id,
    name:        row.name,
    brand:       row.brand,
    price:       parseFloat(row.price),
    description: row.description || '',
    imageUrl:    row.image_url   || '',
  };
}

function generateId(brand, name) {
  const slug = `${brand}-${name}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return slug || `prod-${Date.now()}`;
}

// GET /api/products ───────────────────────────────────────────────────────────
router.get('/', async (_req, res) => {
  try {
    const result = await db.query('SELECT * FROM products ORDER BY brand, name');
    res.json(result.rows.map(toApi));
  } catch (err) {
    console.error('GET /products:', err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/products ──────────────────────────────────────────────────────────
router.post('/', adminMiddleware, async (req, res) => {
  const { id, name, brand, price, description, imageUrl } = req.body;

  if (!name || !brand || price == null) {
    return res.status(400).json({ error: 'name, brand and price are required' });
  }

  const productId = id || generateId(brand, name);

  try {
    const result = await db.query(
      `INSERT INTO products (id, name, brand, price, description, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [productId, name, brand, parseFloat(price), description || '', imageUrl || ''],
    );
    res.status(201).json(toApi(result.rows[0]));
  } catch (err) {
    console.error('POST /products:', err.message);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id ───────────────────────────────────────────────────────
router.put('/:id', adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, brand, price, description, imageUrl } = req.body;

  if (!name || !brand || price == null) {
    return res.status(400).json({ error: 'name, brand and price are required' });
  }

  try {
    const result = await db.query(
      `UPDATE products
       SET name=$1, brand=$2, price=$3, description=$4, image_url=$5
       WHERE id=$6
       RETURNING *`,
      [name, brand, parseFloat(price), description || '', imageUrl || '', id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(toApi(result.rows[0]));
  } catch (err) {
    console.error('PUT /products/:id:', err.message);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id ────────────────────────────────────────────────────
router.delete('/:id', adminMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM products WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /products/:id:', err.message);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
