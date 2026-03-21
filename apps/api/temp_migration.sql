-- Add publicToken column to Estimate table
ALTER TABLE "Estimate" ADD COLUMN IF NOT EXISTS "publicToken" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Estimate_publicToken_key" ON "Estimate"("publicToken");
