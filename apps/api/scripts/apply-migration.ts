import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function main() {
  const migrationPath = join(__dirname, '../prisma/migrations/20250118000000_add_accounting_features/migration.sql');
  const sql = readFileSync(migrationPath, 'utf-8');
  
  // Split by semicolons and execute each statement
  const statements = sql.split(';').filter(s => s.trim().length > 0);
  
  for (const statement of statements) {
    if (statement.trim()) {
      try {
        await prisma.$executeRawUnsafe(statement);
        console.log('✓ Executed statement');
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
          console.log('⚠ Skipped (already exists):', error.message.split('\n')[0]);
        } else {
          console.error('✗ Error:', error.message);
          throw error;
        }
      }
    }
  }
  
  console.log('Migration applied successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

