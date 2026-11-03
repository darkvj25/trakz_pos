-- CreateEnum
CREATE TYPE "ItemCategoryType" AS ENUM ('FOOD', 'NON_FOOD_RETAIL', 'SERVICE', 'HARDWARE_GROCERY');

-- AlterEnum
ALTER TYPE "SyncType" ADD VALUE 'FIRESTORE_PUSH';

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "category" "ItemCategoryType" NOT NULL DEFAULT 'NON_FOOD_RETAIL',
ADD COLUMN     "category_name" TEXT NOT NULL DEFAULT 'General Retail',
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "unit" TEXT NOT NULL DEFAULT 'pcs';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "firestore_doc_id" TEXT,
ADD COLUMN     "firestore_synced" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "source" SET DEFAULT 'TRAKZ_ONPREM_POS';

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "firestore_synced" BOOLEAN NOT NULL DEFAULT false;
