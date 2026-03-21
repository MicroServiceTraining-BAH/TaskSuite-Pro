-- AlterTable - Add metadata to Estimate if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Estimate' AND column_name = 'metadata') THEN
        ALTER TABLE "Estimate" ADD COLUMN "metadata" JSONB;
    END IF;
END $$;

