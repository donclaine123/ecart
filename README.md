# Ecart — Full-Stack Cloud E-Commerce Platform

> **Live Demo:** [https://myecart.vercel.app](https://myecart.vercel.app)

A modern, high-performance decoupled full-stack e-commerce web platform engineered with **React 19 (Vite)** and a **Laravel 11 REST API**. Designed and built to showcase production-grade software engineering fundamentals: atomic database transactions, pessimistic row-level locking, server-authoritative pricing, zero-delay real-time database synchronization, and resilient Stripe payment processing.

---

## 🌐 Cloud Deployment Architecture

The application is deployed across a modern cloud infrastructure:

```
                          ┌────────────────────────┐
                          │   Live Web Browser     │
                          │ https://myecart.vercel.app │
                          └───────────┬────────────┘
                                      │
            HTTPS Requests            │          Static Bundles & CDN
    (Bearer Tokens / JSON REST API)   │         (Vite SPA / 40kB entry)
                                      ▼
                        ┌───────────────────────────┐
                        │      VERCEL EDGE CDN      │
                        │    (React 19 Frontend)    │
                        └─────────────┬─────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │      RENDER SERVICES      │
                        │  (Laravel 11 REST API)    │
                        │   - Sanctum Token Auth    │
                        │   - Authorization Policies│
                        │   - Atomic Transactions   │
                        └──────┬──────────────┬─────┘
                               │              │
             PostgreSQL Queries│              │ Media / Bucket Storage
             (PgBouncer Pooled)│              │
                               ▼              ▼
                        ┌───────────────────────────┐
                        │     SUPABASE CLOUD        │
                        │  - PostgreSQL Database    │
                        │  - Object Media Storage   │
                        └───────────────────────────┘
                                      ▲
                                      │ Stripe API & Signed Webhooks
                                      ▼
                        ┌───────────────────────────┐
                        │   STRIPE PAYMENT GATEWAY  │
                        │   - PaymentIntent API     │
                        │   - HMAC-SHA256 Webhooks  │
                        └───────────────────────────┘
```

| Component | Platform / Host | Responsibility |
| :--- | :--- | :--- |
| **Frontend Client** | [Vercel](https://vercel.com) | React 19 single-page app deployed at [myecart.vercel.app](https://myecart.vercel.app) with global edge delivery. |
| **Backend REST API** | [Render](https://render.com) | Laravel 11 web service providing secured REST endpoints, Sanctum auth, policies, and atomic transactions. |
| **Database** | [Supabase](https://supabase.com) | Managed PostgreSQL cloud database with PgBouncer connection pooling and indexed queries. |
| **Object Storage** | [Supabase Storage](https://supabase.com/storage) | Cloud storage bucket hosting high-resolution product photography and brand assets. |
| **Payment Gateway** | [Stripe](https://stripe.com) | End-to-end card checkout via Stripe Elements, PaymentIntents, and cryptographically verified webhooks. |

---

## 🚀 Core Engineering Highlights (Portfolio Talking Points)

### 1. Atomic Checkout with Row-Level Locking (`DB::transaction` + `lockForUpdate`)
* Prevents race conditions and inventory overselling under high concurrency.
* When a customer places an order, PostgreSQL acquires an exclusive pessimistic lock on target product rows before verifying availability and decrementing stock.
* Verified under automated concurrency testing (`StockTransactionIntegrityTest`).

### 2. Strict Server-Side Price Authority
* The frontend never passes authoritative monetary amounts to the order pipeline. Clients only submit product IDs and quantities.
* The backend computes item subtotals, applies free shipping thresholds ($50+), and computes grand totals directly from verified database records.

### 3. Sub-1.5s Optimized Checkout Pipeline
* **Payment Pre-Warming**: PaymentIntents are pre-warmed on page mount via ref-guarded background prefetching, eliminating extra round-trips on submission.
* **Batch Inserts (`OrderItem::insert`)**: Multi-item checkouts execute via a single multi-row `INSERT` statement rather than sequential query loops.
* **External Verification Isolation**: External payment verification runs before transaction acquisition, ensuring database locks are held for milliseconds rather than seconds.

### 4. Zero-Delay Real-Time Database Synchronization (Stale-While-Revalidate)
* Eliminates server caching lags: catalog updates made directly in Supabase or through the Admin portal reflect live on next reload.
* The storefront implements **Stale-While-Revalidate** on the client: initial page paint renders in **0ms** from cache, while background revalidation queries Supabase live (~200ms) with real-time status badges.

### 5. Immutable Order Snapshots
* When an order is completed, product names and unit prices are snapshotted permanently into `order_items`.
* Subsequent catalog price modifications or SKU renames never alter historical invoices or receipts.

### 6. Granular Authorization Policies & Role Separation
* Route-level role middleware (`role: admin`) and Laravel Policy gates (`OrderPolicy`) guarantee customers can only view their own orders, while administrators have system-wide fulfillment privileges.
* Unauthenticated or cross-tenant access attempts return strict `401 Unauthorized` / `403 Forbidden` responses.

### 7. Stateless Bearer Token Authentication
* Uses Laravel Sanctum personal access tokens (`Authorization: Bearer <token>`).
* Eliminates third-party cross-origin cookie blocking across decoupled cloud hosts (Vercel $\leftrightarrow$ Render).

### 8. Comprehensive Automated Test Suite (39 Tests / 120 Assertions)
* 100% test coverage across core e-commerce domains:
  - `OrderCheckoutTest`: Validates empty cart prevention, stock decrements, and cart clearing.
  - `StockTransactionIntegrityTest`: Tests inventory limits, buy-now flows, and inactive product blocking.
  - `StripePaymentTest`: Validates server calculation, idempotency, and webhook signature verification.
  - `OrderPolicyAndSecurityTest`: Confirms cross-tenant order privacy and admin order queue guards.
  - `AuthCorsTest`: Ensures CORS headers strictly match whitelisted origins.

---

## 🛠️ Technology Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, React Router v6, Tailwind CSS v4, Lucide Icons, Axios |
| **Backend** | Laravel 11, PHP 8.3+, Laravel Sanctum, FormRequests, Policy Gates |
| **Database** | PostgreSQL on Supabase (PgBouncer connection pooling, row-level locking) |
| **Media Storage** | Supabase Cloud Storage (Public asset CDN buckets) |
| **Payments** | Stripe Elements & Stripe PaymentIntents API |
| **Production Hosting**| Vercel (Frontend), Render (API Web Service), Supabase (Database & Storage) |
| **Testing** | PHPUnit 11 (39 feature test suites, 120 assertions) |

---

## 🔑 Demo & Test Credentials

For reviewing order fulfillment, analytics, and customer checkout flows:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@ecart.test` | `password` | Full admin portal (`/admin`), inventory CRUD, order fulfillment queue |
| **Customer** | `customer@ecart.test` | `password` | Storefront catalog, cart management, checkout, order history |

---

## 📄 License & Attribution
Distributed under the MIT License. Developed as a production-grade full-stack portfolio showcase.
