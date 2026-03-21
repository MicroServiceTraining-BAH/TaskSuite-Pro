FROM node:20-alpine AS base

RUN apk add --no-cache openssl && \
    corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/

RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY . .

# Generate Prisma Client
WORKDIR /app/apps/api
RUN pnpm prisma:generate

# Build the app
RUN pnpm build

# Create standalone deployment with flat node_modules
WORKDIR /app
RUN pnpm deploy --filter @tasksuite/api --prod /app/standalone

# Copy built dist and prisma into standalone
RUN cp -r apps/api/dist /app/standalone/dist && \
    cp -r apps/api/prisma /app/standalone/prisma

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install prisma CLI for migrations and client generation
RUN npm install -g prisma@5.22.0 --ignore-scripts

COPY --from=builder /app/standalone ./

# Regenerate Prisma Client in the runner environment
RUN prisma generate

EXPOSE 3001

CMD ["sh", "-c", "prisma migrate deploy && node dist/main.js"]
