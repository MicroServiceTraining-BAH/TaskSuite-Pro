#!/bin/bash

# TaskSuite Pro Development Startup Script

set -e

echo "🚀 Starting TaskSuite Pro Development Environment..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Start PostgreSQL with Docker
echo "📦 Starting PostgreSQL database..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Check database connection
until docker exec tasksuite-postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo "   Waiting for database..."
    sleep 2
done

echo "✅ Database is ready!"
echo ""

# Push database schema
echo "📊 Setting up database schema..."
cd apps/api
npx prisma db push --accept-data-loss || echo "⚠️  Schema push had issues, continuing..."
cd ../..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the API server: cd apps/api && pnpm dev"
echo "2. Start the web app: cd apps/web && pnpm dev"
echo ""
echo "Database connection string: postgresql://postgres:password@localhost:5432/tasksuite"

