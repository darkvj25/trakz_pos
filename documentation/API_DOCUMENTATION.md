# TRAKZ Third-Party POS - REST API Documentation

Base URL: `http://localhost:5000/api`

## Authentication Header
All protected endpoints require a Bearer token in the `Authorization` header:
`Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication Endpoints

### POST `/auth/login`
Authenticates an administrator and returns a JWT token.
- **Request Body**:
  ```json
  {
    "email": "admin@trakz.com",
    "password": "admin123"
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "usr_123",
        "name": "Admin User",
        "email": "admin@trakz.com",
        "role": "ADMIN"
      },
      "token": "eyJhbGciOi..."
    }
  }
  ```

### POST `/auth/logout`
Invalidates session (client clears token).
- **Response** `200 OK`:
  ```json
  { "success": true, "message": "Logged out successfully" }
  ```

### GET `/auth/me`
Retrieves current user profile.
- **Headers**: Authorization required.
- **Response** `200 OK`:
  ```json
  {
    "success": true,
    "data": {
      "id": "usr_123",
      "name": "Admin User",
      "email": "admin@trakz.com",
      "role": "ADMIN"
    }
  }
  ```

---

## 2. Dashboard Endpoints

### GET `/dashboard/summary`
Retrieves high-level dashboard metrics (Total Revenue, Total Orders, Digital Payments breakdown, Previous day comparisons).

### GET `/dashboard/revenue`
Query parameters: `period` (`daily` | `weekly` | `monthly`), `startDate`, `endDate`.
Returns aggregated revenue data points formatted for chart rendering.

### GET `/dashboard/payment-statistics`
Returns breakdown by payment method (GCash, Cash, Credit/Debit, Online Payment).

### GET `/dashboard/order-statistics`
Returns breakdown by order status (COMPLETED, PENDING, IN_TRANSIT, CANCELLED).

---

## 3. Order Endpoints

### GET `/orders`
Query parameters: `search`, `status`, `paymentStatus`, `startDate`, `endDate`, `page`, `limit`, `sortBy`, `sortOrder`.
- **Response** `200 OK`:
  ```json
  {
    "success": true,
    "data": {
      "orders": [...],
      "pagination": {
        "total": 45,
        "page": 1,
        "limit": 10,
        "totalPages": 5
      }
    }
  }
  ```

### GET `/orders/:id`
Retrieves detailed order record including order items, merchant, customer, and associated payment details.

### GET `/orders/:id/items`
Retrieves items associated with a specific order.

### GET `/orders/export`
Exports orders in CSV format according to filter parameters.

---

## 4. Payment Endpoints

### GET `/payments`
Query parameters: `search`, `paymentMethod`, `paymentStatus`, `startDate`, `endDate`, `page`, `limit`.

### GET `/payments/:id`
Retrieves single payment transaction details.

### GET `/payments/statistics`
Retrieves payment counts and total collected amounts grouped by status (SUCCESSFUL, PENDING, FAILED).

### GET `/payments/export`
Exports payments in CSV format.

---

## 5. Synchronization Endpoints

### GET `/sync/status`
Returns current sync status, last sync timestamp, and count of records awaiting sync.

### POST `/sync/start`
Triggers synchronization run between local backend and TRAKZ Integration Adapter.

### GET `/sync/history`
Retrieves historical execution logs of past synchronizations.

---

## 6. System Endpoints

### GET `/system/status`
Returns API health, DB connection state, and system environment info.

### GET `/system/logs`
Retrieves audit logs and operation logs.

### POST `/system/reset-demo`
Resets local demo seed data. Requires confirmation body flag `{ "confirm": true }`.
