# TaskSuite Pro

A full-stack **service management platform** built for cleaning services, flooring companies, and contractors. Built with Next.js 15, NestJS 11, and PostgreSQL. Covers the entire quote-to-payment workflow — estimates, jobs, scheduling, invoicing, expense tracking, and team management — with a dedicated client portal.

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
- 1 owner user per company (with password `password123`)
- Sample clients (some with portal access enabled)
- Sample estimates, jobs, appointments, and invoices

### 5. Environment Variables

#### API (.env in apps/api)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/tasksuite?schema=public"
PORT=3001
CORS_ORIGINS="http://localhost:3000"
JWT_SECRET="your-super-secret-jwt-key-change-in-production-min-32-chars"
CLIENT_PORTAL_URL="http://localhost:3000"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="noreply@tasksuite.com"
```

#### Web (.env.local in apps/web)
```env
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

## Docker

You can spin up the full stack (PostgreSQL, Nest API, and Next.js web) with a single command:

```bash
docker compose up --build
```

This uses the root `docker-compose.yml`, which wraps:

- `db`: PostgreSQL 16 with a persistent `db_data` volume
- `api`: Builds from `apps/api/Dockerfile`, runs Prisma migrations, and serves on http://localhost:3001
- `web`: Builds from `apps/web/Dockerfile` (Next.js standalone output) and serves on http://localhost:3000

Environment defaults (DB creds, JWT secret, SMTP, etc.) are defined inline in `docker-compose.yml`. Override them by creating a `.env` file and referencing it via `env_file`, or by passing `VARIABLE=value docker compose up`.

## Authentication

### Company User Login
- **Endpoint**: `POST /auth/login`
- **Body**: `{ "email": "string", "password": "string" }`
- **Returns**: JWT token and user info
- **Test Credentials** (after seeding):
  - `owner@cleaningco.com` / `password123`
  - `owner@flooringco.com` / `password123`

### Client Portal Login
- **Endpoint**: `POST /auth/client/login`
- **Body**: `{ "email": "string", "password": "string" }`
- **Returns**: JWT token and client info
- **Test Credentials** (after seeding):
  - `john.smith@example.com` / `password123`
  - `jane.doe@example.com` / `password123`

### User Registration
- **Endpoint**: `POST /auth/register`
- **Body**: `{ "email": "string", "password": "string", "name": "string", "companyId": "string" }`

All authenticated endpoints require a JWT token in the `Authorization: Bearer <token>` header.

## API Endpoints

### Clients
- `GET /clients` - List all clients (requires JWT)
- `POST /clients` - Create a client (requires JWT)
- `GET /clients/:id` - Get a client (requires JWT)
- `PATCH /clients/:id` - Update a client (requires JWT)
- `DELETE /clients/:id` - Delete a client (requires JWT)

### Client Portal (requires client JWT)
- `GET /client/estimates` - Get client's estimates
- `GET /client/jobs` - Get client's jobs
- `GET /client/invoices` - Get client's invoices
- `GET /client/appointments` - Get client's appointments

### Estimates
- `GET /estimates` - List all estimates (requires JWT)
- `POST /estimates` - Create an estimate (requires JWT)
- `GET /estimates/:id` - Get an estimate (requires JWT)
- `PATCH /estimates/:id` - Update an estimate (requires JWT)
- `DELETE /estimates/:id` - Delete an estimate (requires JWT)
- `POST /estimates/:id/convert-to-job` - Convert estimate to job (requires JWT)

### Jobs
- `GET /jobs` - List all jobs (requires JWT)
- `POST /jobs` - Create a job (requires JWT)
- `GET /jobs/:id` - Get a job (requires JWT)
- `PATCH /jobs/:id` - Update a job with status transition validation (requires JWT)
- `DELETE /jobs/:id` - Delete a job (requires JWT)

### Appointments
- `GET /appointments` - List all appointments (requires JWT)
- `POST /appointments` - Create appointment(s) with weekly recurrence support (requires JWT)
- `GET /appointments/:id` - Get an appointment (requires JWT)
- `PATCH /appointments/:id` - Update an appointment (requires JWT)
- `DELETE /appointments/:id` - Delete an appointment (requires JWT)

### Invoices
- `GET /invoices` - List all invoices (requires JWT)
- `POST /invoices` - Create an invoice (requires JWT)
- `GET /invoices/:id` - Get an invoice (requires JWT)
- `PATCH /invoices/:id` - Update an invoice (requires JWT)
- `POST /invoices/:id/mark-paid` - Mark invoice as paid (requires JWT)
- `DELETE /invoices/:id` - Delete an invoice (requires JWT)

### Users (Team Management)
- `GET /users` - List all users for company (requires JWT)
- `POST /users` - Create a user (requires JWT)
- `GET /users/:id` - Get a user (requires JWT)
- `PATCH /users/:id` - Update a user (requires JWT)
- `DELETE /users/:id` - Delete a user (requires JWT)

### Expenses
- `GET /expenses` - List expenses (filter by date range, account)
- `POST /expenses` - Create expense
- `GET /expenses/summary` - Expenses grouped by account
- `PATCH /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense

### Bills
- `GET /bills` - List bills (filter by status)
- `POST /bills` - Create bill
- `POST /bills/:id/mark-paid` - Mark bill as paid
- `POST /bills/update-overdue` - Update overdue status

### Accounts (Chart of Accounts)
- `GET /accounts` - List accounts (filter by type)
- `POST /accounts` - Create account
- `PATCH /accounts/:id` - Update account
- `DELETE /accounts/:id` - Delete account

### Tax Rates
- `GET /tax-rates` - List tax rates
- `POST /tax-rates` - Create tax rate
- `GET /tax-rates/default` - Get default tax rate
- `PATCH /tax-rates/:id` - Update tax rate

### Time Entries
- `GET /time-entries` - List time entries (filter by job, user, date)
- `POST /time-entries` - Create time entry
- `GET /time-entries/summary/job/:jobId` - Total hours for job
- `GET /time-entries/summary/billable` - Total billable hours

### Reports
- `GET /reports/profit-loss?startDate=&endDate=` - P&L statement
- `GET /reports/cash-flow?startDate=&endDate=` - Cash flow report
- `GET /reports/balance-sheet?asOfDate=` - Balance sheet
- `GET /reports/summary` - Dashboard summary

### Payments
- `POST /payments/create-intent/:invoiceId` - Create Stripe payment intent
- `POST /payments/confirm/:paymentIntentId` - Confirm payment
- `GET /payments/status/:paymentId` - Get payment status
- `GET /payments` - List payments

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
   - `JWT_SECRET`: A secure random string (min 32 chars)
   - `CLIENT_PORTAL_URL`: Your Vercel domain (e.g., `https://your-app.vercel.app`)
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: For email notifications
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

### Core Platform
- ✅ Multi-tenant architecture (JWT-based company isolation)
- ✅ JWT authentication for company users and clients
- ✅ Client portal with restricted data access
- ✅ Team member management with roles (owner, admin, user)
- ✅ Email & SMS notifications for estimates, jobs, and invoices
- ✅ CRUD operations for all entities
- ✅ OpenAPI/Swagger documentation at `/api`
- ✅ Rate limiting (100 req/min) and security headers via Helmet
- ✅ CORS with environment-based allowlist
- ✅ Type-safe API client with Zod validation
- ✅ Password hashing with bcrypt

### Service Workflow
- ✅ Estimate creation with line items and tax rates
- ✅ Public estimate approval (no login required, token-based)
- ✅ Estimate-to-job conversion (requires client approval)
- ✅ Job lifecycle management (pending → in_progress → completed → cancelled)
- ✅ Industry-specific: cleaning checklists & flooring material tracking
- ✅ Job photo uploads
- ✅ Appointment scheduling with RFC5545 weekly recurrence
- ✅ Invoice management with Stripe payment processing
- ✅ Invoice line items with per-item tax support

### Accounting & Finance
- ✅ Expense tracking with vendor management and categories
- ✅ Bill (accounts payable) management with overdue detection
- ✅ Chart of Accounts (income, expense, asset, liability, equity)
- ✅ Sales tax rates (multiple rates, default rate, per-invoice)
- ✅ Time tracking with billable hours per job
- ✅ Financial reports: Profit & Loss, Cash Flow, Balance Sheet
- ✅ Payment processing via Stripe

### Frontend
- ✅ Next.js 15 App Router with responsive sidebar navigation
- ✅ Dark mode with next-themes
- ✅ i18n language toggle
- ✅ Dashboard with analytics charts (revenue, job status, trends)
- ✅ Mobile-first responsive design
- ✅ Client portal pages (estimates, jobs, invoices, appointments)
- ✅ Onboarding flow for new companies

## Future Enhancements

- Role-based access control enforcement (RBAC) — roles are stored but not yet enforced at API level
- Password reset functionality
- Client self-registration
- Real-time updates via WebSockets
- More comprehensive test coverage

## License

MIT
