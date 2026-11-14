# Synapse — Intelligent Appointment Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green.svg)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org)
[![React](https://img.shields.io/badge/React-18.3-cyan.svg)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com)

**Synapse** is a full-stack, enterprise-grade appointment management platform designed for modern healthcare practices. Engineered in plain JavaScript (ES modules) with a layered architecture, zero-ORM PostgreSQL queries, row-level concurrency locking, scheduled email background workers, and a responsive mobile-first UI with dark mode.

---

## Architecture Diagram

```mermaid
flowchart TD
    subgraph Client["Frontend Client (React + Vite SPA)"]
        UI["Tailwind UI Components\n(Light & Dark Mode)"]
        Router["React Router v6\n(Role Protected Routes)"]
        State["TanStack Query v5\n(Server State & Cache)"]
        AxiosClient["Axios HTTP Client\n(JWT Interceptor & Auto-Refresh)"]
        UI --> Router
        Router --> State
        State --> AxiosClient
    end

    subgraph Gateway["HTTP Gateway & Security"]
        Helmet["Helmet Security Headers"]
        Cors["CORS Allowlist"]
        RateLimit["Express Rate Limit\n(Strict on Auth)"]
        Parser["Cookie & JSON Parser"]
    end

    subgraph Backend["Express Application (Strict Layering)"]
        Routes["src/routes/* (Resource Routers)"]
        Middleware["src/middleware/*\n(Auth, Roles, Zod Validation, ErrorHandler)"]
        Controllers["src/controllers/* (HTTP Envelopes)"]
        Services["src/services/* (Domain Business Logic)"]
        Cache["src/utils/cache.js (In-Memory Catalog Cache)"]
        Repos["src/repositories/* (Pure Parameterized SQL)"]
        Cron["src/jobs/reminderCron.js (node-cron Workers)"]
        Mailer["src/utils/email.js (Nodemailer / Ethereal)"]
        
        Routes --> Middleware --> Controllers --> Services
        Services <--> Cache
        Services --> Repos
        Services --> Mailer
        Cron --> Repos
        Cron --> Mailer
    end

    subgraph Database["PostgreSQL 16 (Relational Engine)"]
        direction TB
        Tables[("users, providers, services,\nprovider_services, availability_slots,\nappointments, notifications, refresh_tokens")]
        Locks["Row Locking: SELECT ... FOR UPDATE"]
        PartialIndex["Partial Unique Index:\nuq_active_slot_booking"]
    end

    AxiosClient --> Gateway --> Routes
    Repos --> Locks --> Tables
    Repos --> PartialIndex --> Tables
```

---

## Tech Stack

| Layer | Technology | Key Highlights |
|---|---|---|
| **Frontend** | React 18, Vite | ES modules, code chunking, mobile-first responsive (360px+) |
| **Styling** | Tailwind CSS | Full Light & Dark mode support, accessible loading skeletons |
| **Routing** | React Router v6 | Role-based protected routes (`patient`, `provider`, `admin`) |
| **Data Fetching** | TanStack Query v5 | Server state caching, optimistic updates, query invalidation |
| **Forms** | React Hook Form + Zod | Schema validation, inline error messaging |
| **HTTP Client** | Axios | Request token injection, 401 interceptor token rotation |
| **Backend** | Node.js, Express | ES modules, strict 4-layer architecture, centralized error handler |
| **Database** | PostgreSQL 16 (`pg`) | **NO ORM** — 100% hand-crafted SQL with joins, CTEs, aggregations |
| **Authentication** | JWT + Refresh Tokens | 15m access token, 7d rotated refresh token in `httpOnly` cookie |
| **Security** | Helmet, CORS, Rate Limit | Parameterized SQL queries, strict auth rate limiting |
| **Background Jobs**| `node-cron` | Automated 24h & 1h email reminder dispatch |
| **Email** | Nodemailer | Ethereal in dev, transactional confirmation & schedule emails |
| **Documentation** | Swagger / OpenAPI 3.0 | Served interactively at `/api/docs` |
| **Testing** | Jest + Supertest | Unit service tests and full integration API tests |

---

## Viva / Grading Evaluation Credentials

All demo accounts use the standard password: **`Password123!`**

| Role | Email | Purpose & Access |
|---|---|---|
| **Patient** | `alice@example.com` | Booking flow, My Appointments, reschedule/cancel modals |
| **Provider** | `dr.sarah@synapse.health` | Provider Hub, slot management, schedule review |
| **Admin** | `admin@synapse.health` | System KPI cards, provider volume stats, frequent patient CTEs |

> **Viva Tip:** The Login page includes **1-Click Demo Fill** buttons to instantly log in as any role without manual typing.

---

## Concurrency & Double-Booking Prevention

Synapse guarantees zero double-booking through a **defense-in-depth relational strategy**:

1. **Database Partial Unique Index**:
   ```sql
   CREATE UNIQUE INDEX uq_active_slot_booking 
   ON appointments(slot_id) 
   WHERE status = 'booked';
   ```
   Ensures at the storage engine level that two active bookings cannot share the same slot.

2. **Row-Level Transaction Locking (`SELECT ... FOR UPDATE`)**:
   During the booking transaction (`POST /api/v1/appointments`):
   ```sql
   BEGIN;
   SELECT id, provider_id, start_time, is_booked 
   FROM availability_slots 
   WHERE id = $1 FOR UPDATE;
   
   -- Slot validation & booking mark
   UPDATE availability_slots SET is_booked = true WHERE id = $1;
   INSERT INTO appointments (...) VALUES (...);
   COMMIT;
   ```
   Any concurrent transaction attempting to read or book the same slot is placed on wait until the lock releases, after which it immediately encounters `is_booked = true` and is rejected with `409 Conflict`.

3. **2-Hour Cutoff Enforcement**:
   Appointments starting within 2 hours (`CANCELLATION_WINDOW_HOURS=2`) cannot be cancelled or rescheduled online, protecting providers from last-minute calendar churn.

---

## Project Structure

```
Capstone-S3/
├── docker-compose.yml         # PostgreSQL 16 container definition
├── .env.example               # Root Docker environment variables
├── docs/
│   ├── er-diagram.md          # Complete Mermaid Crow's foot ER diagram
│   ├── data-dictionary.md     # Comprehensive schema dictionary
│   └── queries.md             # 11 hand-crafted real SQL queries mapped to features
├── db/
│   ├── migrations/            # Versioned SQL migrations (001 - 004)
│   └── seed.sql               # Realistic initial data (providers, slots, bookings)
├── backend/
│   ├── package.json
│   ├── Dockerfile
│   ├── src/
│   │   ├── config/            # DB pool, environment, logger, Swagger
│   │   ├── middleware/        # Authenticate, authorizeRoles, validate, errorHandler
│   │   ├── validators/        # Zod validation schemas
│   │   ├── repositories/      # ALL raw SQL lives here (no ORM)
│   │   ├── services/          # Pure business logic layer
│   │   ├── controllers/       # HTTP request/response envelope handlers
│   │   ├── routes/            # Express route definitions
│   │   ├── jobs/              # node-cron reminder scheduler
│   │   ├── utils/             # Tokens, password, in-memory cache, email
│   │   └── server.js          # HTTP server bootstrap & shutdown
│   └── tests/
│       ├── unit/              # Service unit tests
│       └── integration/       # Supertest API endpoint tests
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── api/               # Axios client with 401 refresh interceptor
        ├── context/           # AuthContext, ThemeContext, ToastContext
        ├── components/        # Skeletons, Modals, EmptyStates, Navbar, Cards
        ├── pages/             # Landing, Login, Register, Dashboard, Book, Admin...
        └── routes/            # Role-protected routing
```

---

## Getting Started (Local Setup)

### Prerequisites
- **Node.js**: v20 or higher (`node -v`)
- **Docker Desktop**: Running on your machine (`docker ps`)

---

### Step 1: Start PostgreSQL via Docker

From the root project directory:
```bash
# Start PostgreSQL 16 container (maps port 5433 -> 5432)
docker compose up -d
```
Verify container is healthy:
```bash
docker ps
```

---

### Step 2: Setup Database (Migrations + Seeding)

In the `backend/` directory, run the automated setup script:
```bash
cd backend
npm install
npm run setup
```
This runs all versioned migrations in `/db/migrations/` and populates the database with realistic seed data (6 providers, 12 services, 56 slots, 25 appointments).

---

### Step 3: Run Backend Tests

```bash
cd backend
npm test
```
Runs Jest & Supertest across all unit and integration test suites:
- Authentication & JWT token rotation
- Double-booking prevention with row locking
- Cancellation cutoff window validation
- Catalog caching & queries

---

### Step 4: Start Backend Server

```bash
cd backend
npm run dev   # Runs with nodemon on http://localhost:5001
```
- API Base: `http://localhost:5001/api/v1`
- Swagger Documentation: `http://localhost:5001/api/docs`
- Health check: `http://localhost:5001/health`

---

### Step 5: Start Frontend Application

In a separate terminal window:
```bash
cd frontend
npm install
npm run dev   # Runs Vite on http://localhost:5173
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## Environment Variables

### Root (`.env`)
```ini
POSTGRES_USER=postgres
POSTGRES_PASSWORD=synapse_password
POSTGRES_DB=synapse_db
POSTGRES_PORT=5433
```

### Backend (`backend/.env`)
```ini
PORT=5001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:synapse_password@localhost:5433/synapse_db
JWT_ACCESS_SECRET=synapse_super_secret_access_jwt_key_at_least_32_chars!
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_SECRET=synapse_super_secret_refresh_jwt_key_at_least_32_chars!
JWT_REFRESH_EXPIRATION_DAYS=7
CORS_ORIGIN=http://localhost:5173
CANCELLATION_WINDOW_HOURS=2
```

### Frontend (`frontend/.env`)
```ini
VITE_API_URL=/api/v1
```

---

## API Usage Examples

### 1. User Login
```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Password123!"}'
```

### 2. Browse Available Slots for a Provider
```bash
curl -X GET "http://localhost:5001/api/v1/providers/1/slots?available=true"
```

### 3. Book an Appointment (Requires Bearer Token)
```bash
curl -X POST http://localhost:5001/api/v1/appointments \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "provider_id": 1,
    "service_id": 2,
    "slot_id": 12,
    "notes": "Follow-up consultation on baseline tests"
  }'
```

---

## Deployment Guide

### Backend on Render / Railway
1. **Database**: Provision a managed PostgreSQL database instance on Render / Railway. Copy the provided connection string.
2. **Backend Service**:
   - Create a Web Service connected to your repository `/backend` directory.
   - Set environment variables: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `NODE_ENV=production`, `PORT=5001`.
   - Build Command: `npm install`
   - Start Command: `npm run setup && npm start`

### Frontend on Vercel / Netlify
1. Create a new project connected to the repository root with root directory set to `frontend`.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Set Environment Variable: `VITE_API_URL=https://your-backend.railway.app/api/v1`

---

## Documentation Links
- **[ER Diagram & Constraints Documentation](./docs/er-diagram.md)**
- **[Database Data Dictionary](./docs/data-dictionary.md)**
- **[11 Hand-Crafted SQL Queries & Features Map](./docs/queries.md)**
- **Interactive Swagger OpenAPI**: `http://localhost:5001/api/docs`
