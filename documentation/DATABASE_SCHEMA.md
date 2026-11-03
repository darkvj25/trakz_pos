# PostgreSQL Database Schema Specification

The TRAKZ Third-Party POS Management System uses PostgreSQL as its primary persistent store via Prisma ORM.

## Models & Tables

### 1. `users`
- `id` (String / UUID, Primary Key)
- `name` (String)
- `email` (String, Unique)
- `password_hash` (String)
- `role` (Enum: ADMIN, OPERATOR)
- `is_active` (Boolean, default true)
- `created_at` (DateTime, default NOW)
- `updated_at` (DateTime, auto update)

### 2. `merchants`
- `id` (String / UUID, Primary Key)
- `external_merchant_id` (String, Unique)
- `merchant_name` (String)
- `status` (Enum: ACTIVE, INACTIVE)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### 3. `orders`
- `id` (String / UUID, Primary Key)
- `external_order_id` (String, Unique)
- `merchant_id` (String, Foreign Key -> merchants.id)
- `customer_name` (String)
- `order_date` (DateTime)
- `subtotal` (Decimal 12,2)
- `delivery_fee` (Decimal 12,2)
- `discount` (Decimal 12,2)
- `total_amount` (Decimal 12,2)
- `payment_status` (Enum: PAID, PENDING, FAILED, REFUNDED)
- `order_status` (Enum: PENDING, CONFIRMED, IN_TRANSIT, DELIVERED, CANCELLED)
- `source` (String, e.g. "TRAKZ_APP", "POS_MANUAL")
- `synced_at` (DateTime, Nullable)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### 4. `order_items`
- `id` (String / UUID, Primary Key)
- `order_id` (String, Foreign Key -> orders.id)
- `external_product_id` (String, Nullable)
- `product_name` (String)
- `quantity` (Integer)
- `unit_price` (Decimal 12,2)
- `subtotal` (Decimal 12,2)

### 5. `payments`
- `id` (String / UUID, Primary Key)
- `external_payment_id` (String, Unique)
- `order_id` (String, Foreign Key -> orders.id)
- `merchant_id` (String, Foreign Key -> merchants.id)
- `payment_method` (Enum: GCASH, CASH, CREDIT_CARD, DEBIT_CARD, ONLINE_PAYMENT)
- `reference_number` (String, Index)
- `amount` (Decimal 12,2)
- `payment_status` (Enum: SUCCESSFUL, PENDING, FAILED, REFUNDED)
- `payment_date` (DateTime)
- `synced_at` (DateTime, Nullable)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### 6. `sync_logs`
- `id` (String / UUID, Primary Key)
- `sync_type` (Enum: FULL, INCREMENTAL, MANUAL, DEMO_RESET)
- `started_at` (DateTime)
- `completed_at` (DateTime, Nullable)
- `status` (Enum: IN_PROGRESS, SUCCESS, FAILED, PARTIAL)
- `records_processed` (Integer, default 0)
- `records_failed` (Integer, default 0)
- `error_message` (Text, Nullable)

### 7. `sync_queue`
- `id` (String / UUID, Primary Key)
- `operation_id` (String, Unique)
- `operation_type` (String, e.g., "SYNC_ORDER", "SYNC_PAYMENT")
- `external_reference_id` (String)
- `payload` (JSONB)
- `status` (Enum: PENDING, PROCESSING, COMPLETED, FAILED)
- `retry_count` (Integer, default 0)
- `last_error` (Text, Nullable)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### 8. `audit_logs`
- `id` (String / UUID, Primary Key)
- `user_id` (String, Nullable)
- `action` (String)
- `description` (Text)
- `ip_address` (String, Nullable)
- `created_at` (DateTime)

### 9. `system_settings`
- `id` (String / UUID, Primary Key)
- `setting_key` (String, Unique)
- `setting_value` (Text)
- `updated_at` (DateTime)
