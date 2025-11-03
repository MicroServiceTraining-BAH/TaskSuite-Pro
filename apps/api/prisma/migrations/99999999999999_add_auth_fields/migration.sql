-- AlterTable - Add password to User if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'password') THEN
        ALTER TABLE "User" ADD COLUMN "password" TEXT;
    END IF;
END $$;

-- AlterTable - Add columns to Client if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Client' AND column_name = 'password') THEN
        ALTER TABLE "Client" ADD COLUMN "password" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Client' AND column_name = 'hasPortalAccess') THEN
        ALTER TABLE "Client" ADD COLUMN "hasPortalAccess" BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- CreateIndex if not exists
CREATE UNIQUE INDEX IF NOT EXISTS "Client_email_key" ON "Client"("email") WHERE "email" IS NOT NULL;

-- Update existing users with default password "password123"
UPDATE "User" SET "password" = '$2b$10$s4GQPYwoT40xW1.krYTnKuteleLV0uW0lT0/3jh6vbO9brbwy7fbu' WHERE "password" IS NULL;

-- Make password required
DO $$ 
BEGIN
    ALTER TABLE "User" ALTER COLUMN "password" SET NOT NULL;
EXCEPTION
    WHEN OTHERS THEN
        -- Column might already be NOT NULL
        NULL;
END $$;

