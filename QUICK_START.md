# Quick Start Guide

## Prerequisites

Node.js 18+, pnpm 8+, PostgreSQL 16+ (or Docker Desktop).

## Option A: Start with Docker Desktop (Recommended)

1. **Open Docker Desktop** — download from https://www.docker.com/products/docker-desktop if not installed. Wait for the green icon in menu bar.

2. **Start the database and seed it:**
   ```bash
   docker-compose up -d postgres
   cd apps/api
   cp .env.example .env   # edit DATABASE_URL if needed
   pnpm prisma migrate dev
   pnpm prisma:seed
   ```

3. **Start both servers from the project root:**
   ```bash
   pnpm dev
   ```
   - API → http://localhost:3001
   - Web → http://localhost:3000
   - Swagger → http://localhost:3001/api

## Option B: Install PostgreSQL Locally

If you prefer not to use Docker:

1. **Install PostgreSQL:**
   ```bash
   brew install postgresql@16
   brew services start postgresql@16
   ```

2. **Create database:**
   ```bash
   createdb tasksuite
   ```

3. **Setup schema and seed:**
   ```bash
   cd apps/api
   cp .env.example .env   # set DATABASE_URL
   pnpm prisma migrate dev
   pnpm prisma:seed
   ```

4. **Start servers from the project root:**
   ```bash
   pnpm dev
   ```

## Verify Everything is Running

- ✅ Database: `docker ps` should show `tasksuite-postgres` running
- ✅ API: http://localhost:3001/api → Swagger docs
- ✅ Web: http://localhost:3000 → redirects to `/login`

## Test Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Company owner | owner@cleaningco.com | password123 |
| Company owner | owner@flooringco.com | password123 |
| Client | john.smith@example.com | password123 |


