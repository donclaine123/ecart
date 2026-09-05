# E-Commerce System Documentation

## 1. System Overview

### 1.1 Purpose
The purpose of this project is to build a robust, high-signal full-stack e-commerce application demonstrating modern software engineering best practices for a fresh-graduate portfolio. It showcases production-grade architecture—such as atomic database transactions, server-side pricing authority, role-based access control, and secure webhook lifecycles—while maintaining a clean, deployable codebase free of unnecessary infrastructure complexity.

### 1.2 Scope
- **In Scope (Core MVP)**:
  - Customer authentication & profile management via stateless Bearer tokens.
  - Public catalog browsing with real-time category filtering, search, and sorting.
  - Persistent shopping cart backed by server-side validation.
  - Atomic two-phase order checkout with stock reservation and row-level locking (`DB::transaction` + `lockForUpdate`).
  - Phased payment processing: Initial mock payment pipeline followed by Stripe Elements & Webhook integration.
  - Separation of logistics status (`orders.status`) and financial status (`orders.payment_status`).
  - Admin management for product catalog and order fulfillment.
  - Deployment configuration for free-tier cloud platforms (Vercel + Render/Railway + Cloud MySQL).
- **Secondary / Post-MVP**:
  - Guest checkout with guest session tokens.
  - Automated transactional emails.
  - Scheduled inventory reservation expiry cron.
  - Historical inventory movements audit table (`inventory_movements`).

### 1.3 Target Users
1. **Store Customers**:
   - Register, log in, browse products, manage shopping cart, place orders, and review past order history with real-time statuses.
2. **Store Administrators**:
   - Manage categories and products (create, update pricing, restock, archive), view sales metrics, and update order fulfillment statuses.

### 1.4 Key Features
* **Stateless Token Authentication**: Secure token issuance using Laravel Sanctum, eliminating third-party cookie restrictions across decoupled deployment domains.
* **Server-Side Price Authority**: Clients submit only item IDs and quantities; prices and totals are strictly calculated server-side from database records.
* **Atomic Checkout & Overselling Protection**: Checkout operations run inside strict database transactions using row-level locking (`lockForUpdate()`) to eliminate race conditions.
* **Decoupled Order & Payment Lifecycles**: Distinct order fulfillment states (`pending`, `processing`, `shipped`, `delivered`, `cancelled`, `returned`) and financial states (`pending`, `paid`, `failed`, `refunded`).
* **Stripe Webhook Security & Idempotency**: Cryptographic signature validation (`Stripe-Signature`) paired with unique event logging to prevent double fulfillment on network retries.
* **Granular Policy Authorization**: Laravel Policies (`OrderPolicy`, `ProductPolicy`) controlling access down to individual database records.

### 1.5 Technology Overview
* **Frontend**: React 18, Vite, React Router 6, Axios, Vanilla CSS design tokens.
* **Backend**: Laravel 11 (PHP 8.3+), Laravel Sanctum (Personal Access Tokens).
* **Database**: MySQL 8.0+ / TiDB / Aiven Cloud MySQL.
* **Payment Gateway**: Stripe API (PaymentIntents + Stripe Elements + Webhooks).
* **Hosting**: Frontend on Vercel, Backend on Render/Railway, Media on Cloudinary.

---

## 2. System Architecture

### 2.1 Overall Architecture
The application uses a completely decoupled client-server architecture. The frontend React Single Page Application (SPA) communicates with the Laravel REST API strictly via JSON over HTTPS.

```
┌─────────────────────────────────────────────────────────┐
│                      Client Tier                        │
│             React SPA (Vite) on Vercel                  │
│       (Local: http://localhost:5173)                   │
│   - Design Tokens & Responsive UI                       │
│   - Axios with 'Authorization: Bearer <token>'          │
└───────────────────────────┬─────────────────────────────┘
                            │ JSON / REST API (HTTPS)
┌───────────────────────────▼─────────────────────────────┐
│                    Application Tier                     │
│               Laravel 11 REST API on Render             │
│        (Local: http://localhost:8000)                   │
│   - FormRequest Validation                              │
│   - Sanctum Token Middleware                            │
│   - Policy-Based Authorization                          │
│   - Service & Transaction Layer                         │
└───────────────────┬─────────────────┬───────────────────┘
                    │                 │
┌───────────────────▼─────────┐ ┌─────▼───────────────────┐
│        Data Tier            │ │     External Tier       │
│    Cloud MySQL Database     │ │   Stripe Payments API   │
│   - InnoDB Engine           │ │ - PaymentIntents        │
│   - Row Locking & Acid Tx   │ │ - Signed Webhooks       │
└─────────────────────────────┘ └─────────────────────────┘
```

### 2.2 Frontend Architecture
* **State Management**: React Context / Custom Hooks for Auth State and Cart State.
* **API Client**: Axios instance configured with base URL, timeout, and request interceptor injecting `Authorization: Bearer <token>`.
* **Routing**: React Router with public routes, protected customer routes (`RequireAuth`), and role-guarded admin routes (`RequireAdmin`).
* **Design System**: Vanilla CSS organized by typography, spacing, glassmorphism surfaces, and responsive grids.

### 2.3 Backend / API Architecture
* **Controllers**: Lean controllers delegating business logic to service classes.
* **Form Requests**: Strict input validation and sanitization prior to controller execution.
* **API Resources**: Dedicated JsonResource transformers guaranteeing uniform API response contracts.
* **Transactions**: `DB::transaction()` wrapping state mutations spanning multiple tables.
* **Policies**: Laravel Authorization Policies safeguarding individual model instances.

### 2.4 Database Architecture
* Relational schema structured around third normal form (3NF).
* InnoDB storage engine providing ACID compliance and pessimistic row locking (`SELECT ... FOR UPDATE`).
* Foreign key constraints ensuring referential integrity with cascading updates and restricted deletions.

### 2.5 External Services
* **Stripe API**: Handles credit card tokenization via Stripe Elements and triggers server-to-server webhook events upon payment success or failure.
* **Cloudinary / Public S3**: Stores static product images and catalog media.

---

## 3. Functional Requirements

### 3.1 Authentication & Profile
* **Registration**: User can register with `name`, `email`, and `password` (email/password only — no third-party OAuth).
* **Role Assignment**: Public registration always assigns `role: customer`. Administrator accounts are seeded or created manually in the database, not self-registered.
* **Token Issuance**: User logs in and receives a stateless personal access token (`Bearer <token>`) via Laravel Sanctum.
* **Token Revocation**: User can log out, which revokes the active token in the database.
* **User Profile**: Authenticated user can view and retrieve their own profile information (`GET /api/v1/auth/profile`).
* **Cart & Order Access Guard**: No guest checkout — authentication is strictly required before adding items to the cart or initiating an order.

### 3.2 Catalog & Browsing
* **Category Listing**: Public view of all active categories (`GET /api/v1/categories`).
* **Product Catalog**: Paginated product catalog supporting filtering (by category slug or ID, search keywords) and sorting (price ascending/descending, newest) (`GET /api/v1/products`).
* **Product Details**: Dedicated single product detail view including active price, real-time stock availability, SKU, description, and related category products (`GET /api/v1/products/{slug}`).
* **Featured Items**: Curated featured products feed for homepage storefront showcase (`GET /api/v1/featured-products`).

### 3.3 Shopping Cart
* **Server-Side Validation**: Adding a product validates that the requested quantity does not exceed current database stock.
* **Cart Persistence**: Authenticated customer cart items persist in the database across user sessions.
* **Quantity Updates**: Customer can increment or decrement quantity of an item in their cart (re-validated against available inventory).
* **Item Removal**: Customer can delete specific line items or clear their cart.
* **Computed Subtotal**: Fetching the cart returns current items along with dynamically calculated line subtotals and order subtotal based on active database pricing.

### 3.4 Checkout & Orders
* **Server-Resolved Order Creation**: Customer places an order from their current cart. The server resolves all items, prices, and quantities directly from the user's database cart—the client never submits prices or line-item lists directly.
* **Atomic Stock Validation & Row-Level Locking**: Checkout atomically verifies that all cart item quantities are available using pessimistic locking (`lockForUpdate()`), failing cleanly if stock changed since adding to cart.
* **Server-Side Price Authority**: Order totals and item subtotals are computed strictly from live database prices, preventing client-side price tampering.
* **Immutable Order Snapshots**: Purchased items snapshot their `product_name` and `unit_price` permanently in `order_items` at checkout time, ensuring future product edits or price changes do not alter historical invoices.
* **Phased Order Implementation**:
  - **Phase 1 (Core Order Baseline)**: Order creation and checkout completes via a mock payment pipeline, proving cart resolution, transactions, stock decrementing, and receipt views without third-party dependencies.
  - **Phase 2 (Stripe Layer)**: Order creation initializes a Stripe `PaymentIntent`. Financial status only transitions to `paid` once verified via Stripe webhook.
* **Customer Order History**: Authenticated customers can view a paginated list of their past orders.
* **Receipt & Order Details**: Customer can view full breakdown of a specific order (`ORD-YYYY-XXXX`). Access is strictly enforced via Laravel `OrderPolicy` to prevent customers from viewing another user's order.

### 3.5 Payment Processing
* **Stripe Test Mode**: Real payment integration runs strictly in Stripe test mode (no real currency, no cash-on-delivery).
* **Webhook Signature Verification**: The Stripe webhook endpoint cryptographically verifies the `Stripe-Signature` header against the endpoint signing secret before trusting any payload.
* **Webhook Idempotency**: Webhook handling tracks event IDs / payment statuses so that duplicate deliveries from Stripe's at-least-once delivery guarantee cannot cause duplicate fulfillment or state changes.

### 3.6 Admin Portal
* **Dashboard Analytics**: Administrators can view core operational metrics: total revenue, total order volume, and low-stock alerts.
* **Product Catalog CRUD**: Administrators can create new products, update pricing and inventory levels, and archive/delete products.
* **Order Fulfillment Queue**: Administrators can inspect all customer orders and filter by status.
* **Fulfillment State Machine**: Administrators can advance order logistics status: `processing` $\rightarrow$ `shipped` $\rightarrow$ `delivered`.
* **Policy & Role Protection**: All admin endpoints are guarded at the route and policy layer (`role: admin`); unauthorized requests receive an immediate `403 Forbidden`.

---

## 4. Non-Functional Requirements

### 4.1 Security
* **Password Hashing**: Passwords must be hashed using bcrypt (cost factor 12) before persistence; plain text passwords are never stored, logged, or compared directly.
* **Stateless Token Authentication**: Authentication is completely stateless using Sanctum Personal Access Tokens (`Authorization: Bearer <token>`). This eliminates cross-domain third-party cookie blocking and domain mismatches between decoupled frontend (Vercel) and backend (Render/Railway) hosts.
* **Server-Side Financial Authority**: The client is never trusted for financial math, discounts, or stock adjustments; all calculations occur within server-side transactions from database records.
* **Cryptographic Webhook Verification**: The webhook receiver rejects any payload failing HMAC SHA256 signature verification via the `Stripe-Signature` header.
* **Granular Authorization**: Admin actions are enforced by both middleware and Laravel Policies (`OrderPolicy`, `ProductPolicy`), ensuring authorization is verified at the model instance level, not merely by UI hiding.
* **Brute-Force Rate Limiting**: The authentication login endpoint is throttled (e.g., `throttle:5,1` — 5 attempts per minute per IP/email) to prevent credential stuffing and brute-force attacks.

### 4.2 Data Integrity & Reliability
* **Atomic Checkout Transactions**: Stock deduction, order generation, line item snapshotting, and cart clearing execute within a single database transaction (`DB::transaction`) with row-level locking (`lockForUpdate()`) to prevent race conditions and overselling.
* **Historical Immutability**: `order_items` stores historical snapshots of unit prices and product names at the moment of purchase, preserving data integrity even if products are renamed, re-priced, or deleted later.
* **Idempotent Webhooks**: Payment webhook handlers verify existing transaction status and event identifiers to guarantee that repeated incoming webhooks produce no side effects.

### 4.3 Architecture & Maintainability
* **Fully Decoupled Design**: Laravel operates purely as a stateless JSON REST API, and React operates as an independent client SPA—no server-side Blade views or shared session states.
* **Domain State Separation**: Strict domain separation between order fulfillment status (`orders.status`: `pending`, `processing`, `shipped`, `delivered`, `cancelled`, `returned`) and financial payment status (`orders.payment_status`: `pending`, `paid`, `failed`, `refunded`).
* **Code Standards & Modularity**: Backend follows strict Laravel conventions (FormRequests for validation, API Resources for JSON serialization, Policies for permissions). Frontend organizes code by modular reusable UI components and specialized API service files.

### 4.4 Deployment & Infrastructure
* **Environment-Driven Parity**: The application must run identically on local development (`localhost:5173` and `localhost:8000`) and cloud production without code changes, configured entirely via standard `.env` variables with no hardcoded domain names.
* **Free-Tier Cloud Architecture**: Designed to deploy on free cloud tiers:
  - Frontend: Vercel (Global Edge CDN).
  - Backend: Render or Railway (Containerized Web Service).
  - Database: Aiven / TiDB / Neon (Cloud Managed SQL).
  - Media: Cloudinary (Cloud media storage for product catalog assets).

---

## 5. Data Requirements

### 5.1 Data Entities
1. **User**: Represents customers and administrators.
2. **Category**: Grouping for catalog products.
3. **Product**: Individual items offered for sale with pricing and stock levels.
4. **CartItem**: Junction entity connecting a user with a product and requested quantity.
5. **Order**: Master record of a purchase transaction.
6. **OrderItem**: Snapshot of individual products purchased within an order.
7. **Payment**: Financial transaction record linked to an order.

### 5.2 Database Schema

```sql
-- Users
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Categories
CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NULL,
    image_url VARCHAR(500) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Products
CREATE TABLE products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    sku VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT UNSIGNED NOT NULL DEFAULT 0,
    image_url VARCHAR(500) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_products_category (category_id),
    INDEX idx_products_price (price)
);

-- Cart Items
CREATE TABLE cart_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Orders
CREATE TABLE orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(64) NOT NULL UNIQUE,
    user_id BIGINT UNSIGNED NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    shipping_address_json JSON NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_orders_user (user_id),
    INDEX idx_orders_status (status)
);

-- Order Items (Snapshot)
CREATE TABLE order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- Payments
CREATE TABLE payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    gateway ENUM('mock', 'stripe') NOT NULL,
    transaction_id VARCHAR(255) NULL,
    stripe_event_id VARCHAR(255) NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_payments_order (order_id),
    INDEX idx_payments_stripe_event (stripe_event_id)
);
```

### 5.3 Data Validation
* **User Registration**:
  - `name`: string, max:255, required.
  - `email`: string, email, max:255, required, unique:users.
  - `password`: string, min:8, required, confirmed.
* **Product Management**:
  - `name`: string, max:255, required.
  - `sku`: string, max:100, required, unique:products.
  - `price`: numeric, min:0.01, required.
  - `stock_quantity`: integer, min:0, required.
  - `category_id`: exists:categories,id, required.
* **Order Creation**:
  - `shipping_address.name`: string, required.
  - `shipping_address.address`: string, required.
  - `shipping_address.city`: string, required.
  - `shipping_address.postal_code`: string, required.
  - `shipping_address.phone`: string, required.

### 5.4 Data Integrity
* **Pessimistic Locking**: Prevents concurrent race conditions when two customers attempt to check out the last remaining stock item simultaneously.
* **Foreign Key Constraints**: Restricts deleting categories or products that have existing order records, preserving historical order receipts.
* **Historical Order Line Snapshots**: `order_items` stores copies of `product_name` and `unit_price` at the moment of checkout, ensuring future catalog price changes do not distort historical invoices.

### 5.5 Data Retention & Storage
* **Transactions & Orders**: Retained indefinitely for reporting and customer order history.
* **Abandoned Carts**: User cart items persist until modified or cleared upon order placement.
* **Media Assets**: Images stored on external cloud CDN or local public storage directory, with URL paths persisted in database records.
