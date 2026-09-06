# E-Commerce Project Roadmap: Pragmatic High-Signal Portfolio Edition

**Core Philosophy:** 
> *"If a feature doesn't significantly improve the user's experience, demonstrate an important engineering concept, or give you something valuable to discuss in an interview — don't build it yet."*

---

## 1. Project Overview & Scope Classification

### 1.1 Goal
Build a clean, high-performance full-stack e-commerce web application that demonstrates enterprise-grade software engineering fundamentals: atomic database transactions, secure payment lifecycles, role-based authorization, and clean component architecture—without getting bogged down in infrastructure rabbit holes.

### 1.2 Scope Tiers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           🟢 CORE MVP (Definite)                           │
│  - React (Vite) Responsive UI (Catalog, Product Details, Cart, Orders)     │
│  - Laravel REST API on MySQL with Sanctum Auth & Policies                   │
│  - Atomic Checkout (DB::transaction + lockForUpdate) with Mock Payment first│
│  - Layered Stripe Integration (PaymentIntent, Elements, Webhooks)          │
│  - Server-side Price Authority & Stock Decrementing                         │
│  - Basic Admin Panel (Product CRUD, Order Status Management)                │
│  - Deployment: React on Vercel, Laravel on Cloud (Render/Railway), Cloud DB │
├─────────────────────────────────────────────────────────────────────────────┤
│                    🟡 SECONDARY (Add Only If Time Permits)                  │
│  - Guest Checkout                                                           │
│  - Automated Email Notifications (Mailpit/Postmark)                         │
│  - 15-minute Reservation Expiry Cron                                        │
│  - Admin Analytics Charts                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                    🔴 DEFERRED / OUT OF SCOPE FOR MVP                       │
│  - Custom .test subdomains & Windows hosts hacks                            │
│  - Complex multi-queue workers / delayed jobs                               │
│  - Inventory movements audit table (document as future design only)         │
│  - Microservices, Redis caching clusters, or complex telemetry              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. System Architecture

A decoupled, straightforward setup built for zero-friction local development and effortless deployment:

```
┌───────────────────────────────────────┐
│     Frontend: React SPA (Vite)        │
│        http://localhost:5173          │
│  - Tailwind CSS v4 (responsive design)│
│  - Axios (Authorization: Bearer token)│
└──────────────────┬────────────────────┘
                   │ RESTful JSON API
┌──────────────────▼────────────────────┐
│      Backend: Laravel REST API        │
│        http://localhost:8000          │
│  - Sanctum Bearer Token Auth          │
│  - FormRequest Validation & Policies  │
│  - Atomic DB Transactions             │
└──────────┬─────────────────┬──────────┘
           │                 │
┌──────────▼────────┐ ┌──────▼──────────┐
│   MySQL Database  │ │ Stripe Gateway  │
│  (Herd / Cloud)   │ │ (Webhooks & PK) │
└───────────────────┘ └─────────────────┘
```

### 2.1 Engineering Decisions & Interview Talking Points:
1. **Stateless Bearer Token Auth via Laravel Sanctum**:
   - *Talking point*: "I use Sanctum's personal access tokens (`createToken()`) passed via the `Authorization: Bearer` header. This avoids third-party cross-site cookie blocking and domain mismatches across decoupled hosts (e.g. Vercel frontend communicating with a Render backend), while eliminating CSRF surface area on stateless API routes."
2. **Atomic Checkout (`DB::transaction` + `lockForUpdate`)**:
   - *Talking point*: "I use database transactions and row-level locking during checkout so that two simultaneous checkouts cannot oversell the same inventory."
3. **Server-Side Price Authority**:
   - *Talking point*: "The client only sends `product_id` and `quantity`. The backend fetches active prices from the database, preventing client-side price tampering."
4. **Separation of Order Status from Payment Status**:
   - Logistics (`orders.status`): `pending`, `processing`, `shipped`, `delivered`, `cancelled`, `returned`.
   - Financial (`orders.payment_status`): `pending`, `paid`, `failed`, `refunded`.
5. **Stripe Webhook Security**:
   - Verifies the `Stripe-Signature` header against the webhook signing secret to block spoofed events.
   - Webhook idempotency check (`stripe_event_id` or status check) prevents duplicate fulfillment on network retries.
6. **Authorization Policies**:
   - Customer can only view their own orders (`OrderPolicy`).
   - Admin routes guarded by `role === 'admin'` and granular resource policies.

---

## 3. Data Model (Core Entities)

### Core Tables & Fields
1. **`users`**: `id`, `name`, `email`, `password`, `role` (`customer`, `admin`), timestamps.
2. **`categories`**: `id`, `name`, `slug` (unique), `description`, `image_url`, `is_active`.
3. **`products`**: `id`, `category_id` (FK), `name`, `slug` (unique), `description`, `price` (decimal 10,2, USD), `stock_quantity`, `sku` (unique), `image_url`, `is_active`, `is_featured`, timestamps.
4. **`cart_items`**: `id`, `user_id` (FK), `product_id` (FK), `quantity` (int).
5. **`orders`**: 
   - `id`, `order_number` (unique `ORD-YYYY-XXXX`), `user_id` (FK), `subtotal`, `shipping_cost`, `total_amount`.
   - `status`: enum(`pending`, `processing`, `shipped`, `delivered`, `cancelled`, `returned`).
   - `payment_status`: enum(`pending`, `paid`, `failed`, `refunded`).
   - `shipping_address_json`: json payload (name, address, city, state, postal, country, phone).
   - `timestamps`.
6. **`order_items`**: `id`, `order_id` (FK), `product_id` (FK), `product_name`, `unit_price`, `quantity`, `subtotal`.
7. **`payments`**: `id`, `order_id` (FK), `gateway` (`stripe`, `mock`), `transaction_id`, `stripe_event_id` (nullable), `amount`, `status`, timestamps.

---

## 4. API Specification (`/api/v1/...`)

### 4.1 Authentication & Profile
* `POST /api/v1/auth/register` — Create account, return user + auth token/session.
* `POST /api/v1/auth/login` — Authenticate credentials.
* `POST /api/v1/auth/logout` — Invalidate session/token.
* `GET  /api/v1/auth/profile` — Fetch current user info.

### 4.2 Public Storefront & Catalog
* `GET /api/v1/categories` — List active categories.
* `GET /api/v1/products` — Paginated products with filters (`?category=`, `?search=`, `?sort=`).
* `GET /api/v1/products/{slug}` — Single product details with related items.
* `GET /api/v1/featured-products` — Curated items for homepage.

### 4.3 Shopping Cart
* `GET    /api/v1/cart` — List user's cart items and computed subtotal.
* `POST   /api/v1/cart/items` — Add product to cart (verifies `requested_qty <= stock_quantity`).
* `PATCH  /api/v1/cart/items/{id}` — Update quantity.
* `DELETE /api/v1/cart/items/{id}` — Remove item.

### 4.4 Checkout & Orders
* `POST /api/v1/orders` — **Phase 1**: Creates order with mock payment. **Phase 2**: Creates Stripe PaymentIntent.
* `GET  /api/v1/orders` — Customer's own order history.
* `GET  /api/v1/orders/{order_number}` — Order detail & receipt breakdown (enforced by `OrderPolicy`).

### 4.5 Stripe Webhook
* `POST /api/v1/webhooks/stripe` — Signature verification + idempotent status update to `processing` / `paid`.

### 4.6 Admin Portal (Role: Admin)
* `GET    /api/v1/admin/dashboard/stats` — Revenue, order counts, low-stock warnings.
* `GET    /api/v1/admin/products` — Manage catalog.
* `POST   /api/v1/admin/products` — Create product.
* `PUT    /api/v1/admin/products/{id}` — Update product & stock.
* `DELETE /api/v1/admin/products/{id}` — Archive product.
* `GET    /api/v1/admin/orders` — Fulfillment queue.
* `PATCH  /api/v1/admin/orders/{id}/status` — Advance status (`processing` -> `shipped` -> `delivered`).

---

## 5. UI/UX & Storefront Architecture

### 5.1 Pages / Views
* **Storefront**:
  - `/` (Home): Hero banner, categories, featured grid.
  - `/shop`: Catalog with sidebar category filters, search input, price sorting.
  - `/product/:slug`: Product image, title, price, description, stock indicator, quantity picker, Add to Cart button.
  - `/cart`: Cart review, item quantity adjusters, subtotal summary, Checkout CTA.
  - `/checkout`: Shipping address form, payment method, order summary.
  - `/order-success/:orderNumber`: Clean receipt view with order status tracking.
* **Customer**:
  - `/login` & `/register`
  - `/account/orders`: Past order list and detailed modal view.
* **Admin**:
  - `/admin/dashboard`: Metrics cards.
  - `/admin/products`: Product table with create/edit modal.
  - `/admin/orders`: Order fulfillment status manager.

---

## 6. The Pragmatic 10-Step Development Order

To avoid getting stuck, development follows this precise sequence—**checkout is proven with mock payment before Stripe is introduced**:

```
Step 1: Project Setup (Vite React + Laravel on standard localhost)
   ↓
Step 2: Database, Migrations & Realistic Seeders
   ↓
Step 3: Authentication & Sanctum
   ↓
Step 4: Product Catalog & Filtering (Backend API + React Views)
   ↓
Step 5: Shopping Cart (Backend API + React Cart Drawer/Page)
   ↓
Step 6: Orders & Atomic Checkout (WITH MOCK PAYMENT FIRST)
   ↓
Step 7: Admin Panel (Product CRUD & Order Fulfillment)
   ↓
Step 8: Layer in Stripe (PaymentIntent + Elements + Webhooks)
   ↓
Step 9: Feature Tests & Quality Audit (Transactions, Policies, Webhooks)
   ↓
Step 10: Free Cloud Deployment (Vercel + Render/Railway + Neon/Aiven DB)
```

### Step 6 vs Step 8 Rationale:
* Building Checkout with a **mock payment flow first** guarantees that:
  - Cart resolution works.
  - `DB::transaction()` works.
  - Stock decrementing and `lockForUpdate()` work.
  - Order numbers and receipt views work.
* Once that is 100% verified, adding Stripe in Step 8 is simply replacing the mock trigger with Stripe Elements and listening to the webhook. If anything breaks in Step 8, you know with certainty it's Stripe-specific, not your order pipeline.

---

## 7. Local Development Setup

### 7.1 Backend (Laravel Herd / PHP Native)
1. Run in `/backend`:
   ```bash
   composer install
   cp .env.example .env
   php artisan key:generate
   ```
2. In `.env`:
   ```env
   APP_NAME=Ecart
   APP_ENV=local
   APP_KEY=
   APP_DEBUG=true
   APP_URL=http://localhost:8000
   FRONTEND_URL=http://localhost:5173

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=ecart
   DB_USERNAME=root
   DB_PASSWORD=
   ```
   *(Note: No `SANCTUM_STATEFUL_DOMAINS` or `SESSION_DOMAIN` needed because we use stateless Bearer tokens via `createToken()`)*

3. Run migrations and seed sample products:
   ```bash
   php artisan migrate:fresh --seed
   ```
4. Start backend:
   ```bash
   php artisan serve
   ```
   (Runs at `http://localhost:8000`).

### 7.2 Frontend (Vite + React)
1. In `/frontend`:
   ```bash
   npm install
   ```
2. In `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```
3. Start frontend:
   ```bash
   npm run dev
   ```
   (Runs at `http://localhost:5173`).

### 7.3 CORS Configuration (`config/cors.php`)
Stateless Bearer token architecture makes CORS straightforward and immune to cross-domain cookie restrictions:
```php
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'),
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false, // false because auth is Bearer token header, not cookies!
];
```

---

## 8. Deployment Blueprint (Free Cloud Stack)

* **Frontend**: **Vercel** (`https://your-store.vercel.app`) — connected directly to GitHub repo with automated builds.
* **Backend**: **Render** or **Railway** (`https://your-api.onrender.com`) — web service running Laravel.
* **Database**: **Neon** (Postgres) or **Aiven / TiDB** (MySQL) — free cloud SQL database instance.
* **Storage**: Local public storage for dev, **Cloudinary** for free production image hosting.
