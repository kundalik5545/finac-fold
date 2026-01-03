-- Add order column to category table
ALTER TABLE "category" ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;

-- Create index for efficient ordering
CREATE INDEX IF NOT EXISTS "category_userId_order_idx" ON "category"("userId", "order");

-- Update existing categories to have sequential order based on creation time
UPDATE "category" 
SET "order" = sub.row_num - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt" DESC) as row_num
  FROM "category"
) sub
WHERE "category".id = sub.id;

