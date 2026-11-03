-- AlterTable: Add Rider Fee and Distance metrics to orders table
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_distance" DECIMAL(6,2);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "rider_payout" DECIMAL(12,2) NOT NULL DEFAULT 0.00;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "trakz_margin" DECIMAL(12,2) NOT NULL DEFAULT 0.00;

-- CreateTable: rider_fee_matrices
CREATE TABLE IF NOT EXISTS "rider_fee_matrices" (
    "id" TEXT NOT NULL,
    "min_km" DECIMAL(5,2) NOT NULL,
    "max_km" DECIMAL(5,2) NOT NULL,
    "label" TEXT NOT NULL,
    "customer_fee" DECIMAL(12,2) NOT NULL,
    "rider_payout" DECIMAL(12,2) NOT NULL,
    "trakz_margin" DECIMAL(12,2) NOT NULL,
    "inclusive_max" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rider_fee_matrices_pkey" PRIMARY KEY ("id")
);
