# TaskSuite Pro

A full-stack task and project management application built with Next.js 15, NestJS 11, and PostgreSQL.

## Architecture

This is a Turborepo monorepo containing:

- **apps/web**: Next.js 15 (App Router) frontend with TypeScript, Tailwind CSS, and shadcn/ui
- **apps/api**: NestJS 11 backend with Prisma and PostgreSQL
- **packages/ui**: Shared shadcn/ui components and utilities
- **packages/types**: Shared TypeScript types and Zod schemas

## Prerequisites

- Node.js 18+ 
- pnpm 8+
- PostgreSQL 16+
- Docker (optional, for containerized deployment)

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Database Setup

Create a PostgreSQL database and set up your connection string:

```bash
# Create .env file in apps/api
cd apps/api
cp .env.example .env

# Edit .env and set your DATABASE_URL
DATABASE_URL="postgresql://user:password@localhost:5432/tasksuite?schema=public"
```

### 3. Run Prisma Migrations

```bash
cd apps/api
pnpm prisma migrate dev
```

### 4. Seed the Database

```bash
cd apps/api
pnpm prisma:seed
```

This creates:
- 2 companies (CleaningCo, FlooringCo)
- 1 owner user per company
- Sample clients, estimates, jobs, appointments, and invoices

### 5. Environment Variables

#### API (.env in apps/api)
```
DATABASE_URL="postgresql://user:password@localhost:5432/tasksuite?schema=public"
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"
PORT=3001
```

#### Web (.env.local in apps/web)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 6. Start Development Servers

```bash
# From root directory
pnpm dev
```

This starts:
- API server at http://localhost:3001
- Web app at http://localhost:3000
- API documentation at http://localhost:3001/api

## Development

### Running Individual Apps

```bash
# API only
pnpm --filter @tasksuite/api dev

# Web only
pnpm --filter @tasksuite/web dev
```

### Database Commands

```bash
cd apps/api

# Generate Prisma Client
pnpm prisma:generate

# Create migration
pnpm prisma migrate dev

# Open Prisma Studio
pnpm prisma:studio
```

### Building

```bash
pnpm build
```

## API Endpoints

All endpoints require the `X-Company-Id` header (temporary until authentication is implemented in Phase 2).

**Important**: After seeding the database, you'll need to update the `TEMP_COMPANY_ID` in `apps/web/src/lib/api.ts` with an actual company ID from your database. You can find company IDs by:
1. Running `pnpm prisma:studio` in the `apps/api` directory
2. Checking the Company table for IDs
3. Or querying the companies endpoint (which doesn't require the header)

### Clients
- `GET /clients` - List all clients
- `POST /clients` - Create a client
- `GET /clients/:id` - Get a client
- `PATCH /clients/:id` - Update a client
- `DELETE /clients/:id` - Delete a client

### Estimates
- `GET /estimates` - List all estimates
- `POST /estimates` - Create an estimate
- `GET /estimates/:id` - Get an estimate
- `PATCH /estimates/:id` - Update an estimate
- `DELETE /estimates/:id` - Delete an estimate
- `POST /estimates/:id/convert-to-job` - Convert estimate to job

### Jobs
- `GET /jobs` - List all jobs
- `POST /jobs` - Create a job
- `GET /jobs/:id` - Get a job
- `PATCH /jobs/:id` - Update a job (with status transition validation)
- `DELETE /jobs/:id` - Delete a job

### Appointments
- `GET /appointments` - List all appointments
- `POST /appointments` - Create appointment(s) (supports weekly recurrence)
- `GET /appointments/:id` - Get an appointment
- `PATCH /appointments/:id` - Update an appointment
- `DELETE /appointments/:id` - Delete an appointment

### Invoices
- `GET /invoices` - List all invoices
- `POST /invoices` - Create an invoice
- `GET /invoices/:id` - Get an invoice
- `PATCH /invoices/:id` - Update an invoice
- `POST /invoices/:id/mark-paid` - Mark invoice as paid
- `DELETE /invoices/:id` - Delete an invoice

## Docker Deployment

### API with Docker Compose

```bash
cd apps/api
docker-compose up -d
```

This starts PostgreSQL and the API in containers.

### Building Docker Images

```bash
# Build API image
cd apps/api
docker build -t tasksuite-api -f Dockerfile ../../

# Run with docker-compose or manually with environment variables
```

## Deployment

### Vercel (Web App)

1. Connect your repository to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: Your API URL
3. Deploy

The web app will automatically build and deploy on push to main.

### Railway (API)

1. Create a new Railway project
2. Add PostgreSQL service
3. Add Node.js service and point to `apps/api`
4. Set environment variables:
   - `DATABASE_URL`: Provided by Railway PostgreSQL
   - `CORS_ORIGINS`: Your Vercel domain(s)
   - `PORT`: 3001 (or Railway's assigned port)
5. Add build command: `cd apps/api && pnpm install && pnpm prisma generate && pnpm build`
6. Add start command: `cd apps/api && pnpm prisma migrate deploy && pnpm start:prod`

### Database Migrations on Railway

Railway will run migrations automatically if you add this to your start command:
```bash
pnpm prisma migrate deploy && pnpm start:prod
```

## Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @tasksuite/api test
```

## Linting & Formatting

```bash
# Lint all packages
pnpm lint

# Format all code
pnpm format
```

## Project Structure

```
.
├── apps/
│   ├── api/              # NestJS API
│   │   ├── prisma/       # Prisma schema and migrations
│   │   └── src/
│   └── web/              # Next.js web app
│       └── src/
│           ├── app/      # App Router pages
│           └── lib/      # Utilities and API client
├── packages/
│   ├── types/            # Shared TypeScript types
│   └── ui/               # Shared UI components
├── .github/workflows/    # CI/CD pipelines
└── turbo.json           # Turborepo configuration
```

## Features

- ✅ Multi-tenant architecture (via X-Company-Id header)
- ✅ CRUD operations for all entities
- ✅ Estimate to Job conversion
- ✅ Job status transitions with validation
- ✅ Weekly appointment recurrence (pre-creates N occurrences)
- ✅ Invoice payment tracking
- ✅ OpenAPI/Swagger documentation
- ✅ Rate limiting and security headers
- ✅ CORS with environment allowlist
- ✅ Optimistic UI updates (client-side)
- ✅ Type-safe API client

## Coming in Phase 2

- Authentication and authorization
- Replace X-Company-Id header with proper tenant resolution
- Enhanced error handling
- More comprehensive testing
- Real-time updates

## License

MIT

