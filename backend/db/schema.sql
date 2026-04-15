-- ─── Perfume Store — PostgreSQL Schema ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS products (
  id          VARCHAR(120)   PRIMARY KEY,
  name        VARCHAR(255)   NOT NULL,
  brand       VARCHAR(255)   NOT NULL,
  price       NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  description TEXT           NOT NULL DEFAULT '',
  image_url   VARCHAR(512)   NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS orders (
  id            VARCHAR(120)   PRIMARY KEY,
  customer_name VARCHAR(255)   NOT NULL,
  phone         VARCHAR(50)    NOT NULL,
  address       TEXT           NOT NULL,
  items         JSONB          NOT NULL DEFAULT '[]',
  total_price   NUMERIC(10, 2) NOT NULL,
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_brand ON products (brand);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders (created_at DESC);
