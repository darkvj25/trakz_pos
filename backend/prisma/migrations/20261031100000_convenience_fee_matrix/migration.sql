-- AlterTable: Add Convenience Fee column to orders table
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "convenience_fee" DECIMAL(12,2) NOT NULL DEFAULT 0.00;

-- CreateTable: convenience_fee_matrices
CREATE TABLE IF NOT EXISTS "convenience_fee_matrices" (
    "id" TEXT NOT NULL,
    "min_subtotal" DECIMAL(12,2) NOT NULL,
    "max_subtotal" DECIMAL(12,2),
    "label" TEXT NOT NULL,
    "fee" DECIMAL(12,2) NOT NULL,
    "inclusive_max" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "convenience_fee_matrices_pkey" PRIMARY KEY ("id")
);
