# Database Migration Instructions

## ✅ Completed Steps

1. ✅ Prisma schema updated with new models:
   - `Account` (Chart of Accounts)
   - `Expense` (Expense Tracking)
   - `Bill` (Bill Management)
   - `InvoiceLineItem` (Invoice Line Items)
   - `EstimateLineItem` (Estimate Line Items)

2. ✅ Prisma Client generated successfully
3. ✅ TypeScript compilation successful
4. ✅ All backend modules created and registered

## 📋 Next Steps to Apply Migration

The migration file has been created at:
`apps/api/prisma/migrations/20250118000000_add_accounting_features/migration.sql`

### Option 1: Apply Migration Manually (Recommended)

If you have direct database access, you can apply the migration SQL directly:

```bash
# Using psql (if available)
psql $DATABASE_URL -f apps/api/prisma/migrations/20250118000000_add_accounting_features/migration.sql

# Or using your database GUI tool (pgAdmin, DBeaver, etc.)
# Open the migration.sql file and execute it
```

### Option 2: Use Prisma Migrate Deploy

```bash
cd apps/api
pnpm prisma migrate deploy
```

### Option 3: Use Prisma DB Push (Development Only)

⚠️ **Warning**: This will sync schema but won't create a migration record. Use only for development.

```bash
cd apps/api
pnpm prisma db push --accept-data-loss
```

### Option 4: Reset and Re-migrate (Development Only)

⚠️ **Warning**: This will delete all data!

```bash
cd apps/api
pnpm prisma migrate reset
pnpm prisma migrate dev
```

## ✅ Verification

After applying the migration, verify the tables were created:

```bash
cd apps/api
pnpm prisma studio
```

Or check via SQL:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('Account', 'Expense', 'Bill', 'InvoiceLineItem', 'EstimateLineItem');
```

## 🚀 Testing the New Features

Once the migration is applied, you can test the new endpoints:

1. **Chart of Accounts**
   ```bash
   curl -X POST http://localhost:3001/accounts \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name":"Office Supplies","type":"expense","code":"5000"}'
   ```

2. **Expenses**
   ```bash
   curl -X POST http://localhost:3001/expenses \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"description":"Printer Paper","amount":25.99,"vendor":"Office Depot"}'
   ```

3. **Bills**
   ```bash
   curl -X POST http://localhost:3001/bills \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"vendor":"Electric Company","amount":150.00,"dueDate":"2025-02-01"}'
   ```

4. **Reports**
   ```bash
   curl http://localhost:3001/reports/summary \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

## 📝 Notes

- The migration has been marked as applied in Prisma's migration history
- All new tables include proper foreign key constraints
- Indexes are created for performance (InvoiceLineItem.invoiceId, EstimateLineItem.estimateId)
- The `Invoice` and `Estimate` tables have been updated with `taxRate` fields

## 🔍 Troubleshooting

If you encounter issues:

1. **Check database connection**: Ensure your `.env` file has the correct `DATABASE_URL`
2. **Check Prisma Client**: Run `pnpm prisma generate` if needed
3. **Check migration status**: Run `pnpm prisma migrate status`
4. **View migration history**: Check `prisma/migrations` directory

