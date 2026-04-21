const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const router  = express.Router();
const db      = require('../db');

const SALT_ROUNDS = 10;

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, isAdmin: !!user.is_admin },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'password must be at least 6 characters' });
  }

  try {
    const exists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await db.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, is_admin',
      [email, hash, name || ''],
    );

    const { is_admin, ...rest } = result.rows[0];
    const user = { ...rest, isAdmin: !!is_admin };
    res.status(201).json({ token: signToken(result.rows[0]), user });
  } catch (err) {
    console.error('POST /auth/register:', err.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const result = await db.query(
      'SELECT id, email, name, is_admin, password_hash FROM users WHERE email = $1',
      [email],
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const { password_hash, is_admin, ...rest } = user;
    const safeUser = { ...rest, isAdmin: !!is_admin };
    res.json({ token: signToken(user), user: safeUser });
  } catch (err) {
    console.error('POST /auth/login:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me  — проверка токена
router.get('/me', require('../middleware/auth'), (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
