# Ecart — Full-Stack E-Commerce Platform

> **Status:** Under Active Construction — Initial Setup Phase

A decoupled full-stack e-commerce web application built with **React (Vite)** and **Laravel 11 REST API**, engineered to demonstrate high-signal software engineering fundamentals: atomic database transactions, server-side price authority, role-based authorization policies, and secure payment webhook processing.

---

## Core Engineering Highlights (Portfolio Talking Points)

1. **Atomic Checkout with Row-Level Locking (`DB::transaction` + `lockForUpdate`)**:
   - Prevents overselling under concurrent checkouts by acquiring pessimistic row locks on product inventory records before verifying quantities and decrementing stock.
2. **Strict Server-Side Price Authority**:
   - Clients only submit item identifiers and quantities. The backend resolves cart contents and computes all line item subtotals and order totals directly from database records, preventing client-side price manipulation.
3. **Immutable Order Snapshots**:
   - At checkout time, item prices and names are snapshotted permanently into `order_items`. Subsequent catalog price modifications or product renames never alter historical invoices.
4. **Clean Domain State Separation**:
   - Logistics fulfillment status (`pending`, `processing`, `shipped`, `delivered`, `cancelled`, `returned`) is cleanly separated from financial payment status (`pending`, `paid`, `failed`, `refunded`).
5. **Stateless Bearer Token Authentication**:
   - Uses Laravel Sanctum personal access tokens (`Authorization: Bearer <token>`). Eliminates third-party cross-origin cookie blocking across decoupled cloud hosts (e.g. Vercel frontend communicating with a Render/Railway backend).
6. **Secure Stripe Webhook Processing & Idempotency**:
   - Verifies the cryptographic `Stripe-Signature` header against the webhook signing secret to block spoofed payloads, and enforces event idempotency to prevent duplicate order fulfillment upon network retries.
7. **Granular Authorization Policies**:
   - Enforces record-level access control via Laravel Policies (`OrderPolicy`, `ProductPolicy`) and route-level role middleware (`role: admin`), guaranteeing customers cannot inspect other users' orders.

---

## Planned Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router 6, Axios, Vanilla CSS (Design Tokens) |
| **Backend** | Laravel 11, PHP 8.3+, Laravel Sanctum (Personal Access Tokens) |
| **Database** | MySQL 8.0+ / Cloud MySQL (InnoDB, Foreign Key Constraints, Row-Level Locking) |
| **Payments** | Stripe API (Stripe Elements, PaymentIntents, Signed Webhooks) |
| **Deployment** | Vercel (Frontend), Render / Railway (Backend API),Database Cloud Services |

---

## System Architecture

The application uses a fully decoupled client-server architecture communicating strictly via JSON REST APIs over HTTP/HTTPS:

```
┌───────────────────────────────────────┐
│     Frontend: React SPA (Vite)        │
│        http://localhost:5173          │
│  - Pure CSS design tokens (responsive)│
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

---

## Core Data Entities

* **`users`**: Customer accounts and admin users (`role: customer | admin`).
* **`categories`**: Product taxonomy with URL slugs and active status flags.
* **`products`**: Product catalog items with SKU, unit price, stock quantity, and featured flags.
* **`cart_items`**: Persistent shopping cart items per authenticated customer.
* **`orders`**: Master purchase orders with unique order numbers (`ORD-YYYY-XXXX`), shipping payload, fulfillment status, and payment status.
* **`order_items`**: Permanent historical snapshot of purchased products, unit prices, and quantities.
* **`payments`**: Payment transaction logs linking orders to payment gateways (Mock / Stripe) and webhook event IDs.

---

## Implementation Roadmap

- [ ] **Step 1: Project Setup** — Scaffold Vite React frontend & Laravel 11 backend with CORS configuration.
- [ ] **Step 2: Database & Seeders** — Database migrations, models, and realistic catalog seeders.
- [ ] **Step 3: Authentication & Sanctum** — Registration, login, logout, and token issuance.
- [ ] **Step 4: Product Catalog & Browsing** — Categories, paginated products, search, and details.
- [ ] **Step 5: Shopping Cart** — Persistent database cart API and React cart drawer/page.
- [ ] **Step 6: Orders & Atomic Checkout (Mock Payment)** — Checkout pipeline with `DB::transaction` and `lockForUpdate`.
- [ ] **Step 7: Admin Portal** — Metrics dashboard, catalog CRUD, and order fulfillment status transitions.
- [ ] **Step 8: Layer in Stripe** — PaymentIntents, Stripe Elements, and signed webhook processing.
- [ ] **Step 9: Feature Tests & Quality Audit** — Automated test suite for concurrency, policies, and webhooks.
- [ ] **Step 10: Free Cloud Deployment** — Deployment to Vercel and cloud backend/database.

---

## Documentation Links
* [PROJECT_ROADMAP.md](PROJECT_ROADMAP.md) — Detailed development blueprint and phased scope breakdown.
* [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md) — Comprehensive functional, non-functional, and database specifications.
