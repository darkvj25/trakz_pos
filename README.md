# TRAKZ THIRD-PARTY POS MANAGEMENT SYSTEM

Enterprise-quality standalone Third-Party POS Management System for the TRAKZ platform.

## Architecture & Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Recharts, Axios, React Router DOM, Dexie.js (IndexedDB).
- **Backend**: Node.js, Express.js, Prisma ORM, PostgreSQL, JWT Authentication, bcrypt, Socket.IO, Helmet, CORS.
- **Offline Support**: Offline-first design using Dexie (IndexedDB) and background synchronization handling network state transitions.
- **Integration Layer**: TRAKZ POS Integration Adapter supporting configurable REST / webhook adapters and idempotent transaction processing.

## Project Structure

```text
trackz_pos/
├── frontend/             # React + Vite + Tailwind CSS Application
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/  # Layout, Dashboard, Orders, Payments, Common UI
│   │   ├── database/    # Dexie IndexedDB client
│   │   ├── hooks/       # Network, Sync, Theme hooks
│   │   ├── pages/       # Route pages
│   │   ├── services/    # Axios API clients
│   │   ├── store/       # React Context state stores
│   │   └── utils/       # Formatters, Export utilities
│   └── package.json
├── backend/              # Node.js + Express API Backend
│   ├── prisma/          # Prisma schema and seeders
│   ├── src/
│   │   ├── config/      # DB, JWT, App Config
│   │   ├── controllers/ # API controllers
│   │   ├── integrations/# TRAKZ Integration Adapter
│   │   ├── middleware/  # Auth, Error, Logger middlewares
│   │   ├── routes/      # Express API routes
│   │   ├── services/    # Business logic & data services
│   │   └── server.js
│   └── package.json
└── documentation/        # Full technical documentation
    ├── API_DOCUMENTATION.md
    ├── DATABASE_SCHEMA.md
    └── INTEGRATION_GUIDE.md
```

## Setup & Running Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- npm

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure DATABASE_URL in .env (e.g. postgresql://postgres:postgres@localhost:5432/trackz_pos?schema=public)

# Run migrations and seed database
npx prisma migrate dev --name init
npm run seed

# Start development server
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Default Credentials
- **Admin Email**: `admin@trakz.com`
- **Password**: `admin123`

---
© TrakZ Software Dev Corp - SEC: 2026080265253-03 | BIR TIN: 011-019-610
