# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Running the app

```bash
# Both frontend and backend together (from root)
npm start

# Backend only (port 3000)
cd backend && npm run dev

# Frontend only (port 4200)
cd frontend && npm start
```

### Database

```bash
cd backend
npm run db:init      # Create tables (users, products, orders)
npm run db:seed      # Seed 15 products
npm run db:migrate   # Run auth migration (adds users table + guest_email/user_id to orders)
npm run db:clear     # Clear all data
```

### E2E tests

```bash
# Requires frontend + backend running on :4200 and :3000
npm run test:e2e           # Headless Chromium
npm run test:e2e:headed    # With visible browser
npm run test:e2e:ui        # Playwright interactive UI

# Single spec file
npx playwright test e2e/auth.spec.ts
```

### Frontend build

```bash
cd frontend && npm run build
```

## Architecture

### Overview

Monorepo with two independent apps:

- `frontend/` — Angular 21 standalone SPA, served on port 4200
- `backend/` — Express.js REST API on port 3000
- `e2e/` — Playwright tests (Page Object pattern in `e2e/helpers/pages.ts`)

All `/api/*` requests from the frontend are proxied to the backend via `frontend/proxy.conf.json`.

### Backend

Plain Express + `pg` (no ORM). All DB queries are raw SQL through a single `Pool` instance in `src/db.js`.

Routes:
- `GET/POST/PUT/DELETE /api/products`
- `POST /api/orders` — accepts optional JWT (`Authorization: Bearer`) and `guestEmail`; writes `user_id` or `guest_email` to the orders table
- `GET /api/orders/my` — requires JWT, returns orders for the authenticated user
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`

Auth is JWT (7-day expiry, secret from `JWT_SECRET` env). Middleware lives in `src/middleware/auth.js`. Passwords hashed with bcrypt (10 rounds).

Telegram notifications fire non-blocking after every order (`sendOrderToTelegram` in `src/services/telegram.js`). Silently skips if `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` are unset.

### Frontend

All components are standalone (no NgModules). State is managed entirely with Angular signals — no NgRx or other state library.

Key services and their responsibilities:

- **`ProductsService`** — fetches products from API on construction, exposes `signal`-based `productsList`, `brandsList`. CRUD methods re-fetch after mutation.
- **`CartService`** — persists to `localStorage` under key `perfume-store-cart-v1`. Uses `validCartItems` computed signal to filter out products that no longer exist. Never mutate signals inside `computed()`.
- **`AuthService`** — stores JWT token and user object in `localStorage` (`auth_token`, `auth_user`). Exposes `isLoggedIn` and `user` as computed signals. Call `getAuthHeaders()` to get `Authorization` header for HTTP requests.
- **`OrdersService`** — passes JWT header automatically and includes `guestEmail` when provided.

### Auth flow

- Unauthenticated users see a guest email field on checkout; after placing an order they are shown a register prompt overlay.
- Authenticated users skip the email field and the post-order prompt.
- `AuthService.register()` and `AuthService.login()` both call the backend, save the token, and update signals atomically via `saveSession()`.

### Database schema

```
users   (id serial, email unique, password_hash, name, created_at)
products (id varchar, name, brand, price, description, image_url)
orders   (id varchar, customer_name, phone, address, items jsonb,
          total_price, created_at, guest_email, user_id → users.id)
```

### Environment variables (backend/.env)

| Variable | Purpose |
|---|---|
| `DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD` | PostgreSQL connection |
| `JWT_SECRET` | Signs auth tokens — change in production |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | Optional order notifications |
