# Starting TaskSuite Pro Servers

## Quick Start

### 1. Start PostgreSQL Database

**Option A: Using Homebrew (if installed)**
```bash
brew services start postgresql@16
```

**Option B: Using Postgres.app**
- Open Postgres.app from Applications
- Click "Start" if it's not running

**Option C: Using Docker**
```bash
docker run --name tasksuite-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=tasksuite \
  -p 5432:5432 \
  -d postgres:16
```

**Option D: Manual PostgreSQL start**
```bash
# On macOS with Homebrew
pg_ctl -D /usr/local/var/postgres start

# Or check your PostgreSQL installation path
```

### 2. Verify Database Connection
```bash
cd apps/api
npx prisma db push
```

### 3. Start Both Servers (Recommended)
```bash
# From project root — starts API + web in parallel
pnpm dev
```

- API → http://localhost:3001
- Web → http://localhost:3000
- Swagger docs → http://localhost:3001/api

### Alternatively: Start Individually
```bash
# API only
pnpm --filter @tasksuite/api dev

# Web only (in a separate terminal)
pnpm --filter @tasksuite/web dev
```

## Troubleshooting

### Database Connection Error
If you see "Can't reach database server at localhost:5432":
1. Check if PostgreSQL is running: `ps aux | grep postgres`
2. Verify port 5432 is available: `lsof -i :5432`
3. Check your database URL in `apps/api/.env` (if exists)

### API Server Won't Start
1. Check if port 3001 is in use: `lsof -i :3001`
2. Kill existing processes: `pkill -f "nest.js start"`
3. Check database connection first

### CORS Errors
The API is configured to allow `http://localhost:3000` by default.
If using a different port, set `CORS_ORIGINS` environment variable.

