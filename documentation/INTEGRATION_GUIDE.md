# TRAKZ Third-Party POS Integration Guide

This guide describes how the TRAKZ Third-Party POS Management System integrates with the main TRAKZ ecosystem (Firebase Cloud Functions / Firestore / trakzApi).

## Integration Architecture

```text
React Frontend (Dexie IndexedDB Cache)
       |
       v (Axios REST API / Socket.IO)
Node.js + Express Backend
       |
       v (Prisma ORM)
PostgreSQL Database
       |
       v (TrakzAdapter Service Layer)
TRAKZ POS Integration Gateway (Production API / Mock Gateway)
       |
       v
TRAKZ Cloud Firestore / trakzApi
```

## Security Rules
1. **No Credentials in Frontend**: All API keys, tokens, and secret parameters are stored exclusively in backend environment variables (`TRAKZ_API_KEY`, `TRAKZ_API_BASE_URL`).
2. **Idempotency Protection**: Every payment or order record imported through the adapter includes `external_order_id` or `external_payment_id`. Unique constraints prevent duplicate creation.
3. **Read-Only / Sync Restrictions**: Third-party POS reads order histories and updates synchronization statuses without directly modifying protected customer/rider records in TRAKZ.

## Adapter Interface (`src/integrations/trakzAdapter.js`)
The backend provides a standardized adapter class with configurable fallback to mock engine when production endpoints are unreachable or not yet provisioned:
- `fetchOrders(sinceTimestamp)`
- `fetchPayments(sinceTimestamp)`
- `verifyTransaction(externalId)`
- `pushSyncStatus(logPayload)`

## Offline Caching Strategy
- The frontend maintains an IndexedDB instance (`Dexie`) in the browser.
- When network is offline, the user interface gracefully degrades to read from IndexedDB.
- When connectivity is restored, the `useSync` hook sends cached queue operations to `/api/sync/start`.
