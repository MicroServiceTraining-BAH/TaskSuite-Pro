# Deployment Checklist

This document contains step-by-step instructions for deploying TaskSuite Pro to production.

## Pre-Deployment Setup

### ✅ Step 1: Environment Variable Files

**Status:** ✅ Complete - `.env.example` files created

Reference files:
- `apps/api/.env.example` - All API environment variables
- `apps/web/.env.example` - Web app environment variables

Copy these to create your actual `.env` files:
```bash
cd apps/api && cp .env.example .env
cd ../web && cp .env.example .env.local
```

### Step 2: Generate Production Secrets

#### Generate JWT Secret
```bash
openssl rand -base64 32
```
Save this securely - you'll need it for:
- API `.env` file
- GitHub Secrets (for CI/CD)
- Railway environment variables

#### Database URL
You'll get this from:
- **Local**: PostgreSQL connection string
- **Railway**: Provided automatically when you add PostgreSQL service
- **Other providers**: Check their documentation

### Step 3: GitHub Secrets (For CI/CD)

If using GitHub Actions, add secrets at:
**https://github.com/MicroServiceTraining-BAH/TaskSuite-Pro/settings/secrets/actions**

Secrets to add:
- [ ] `DATABASE_URL` - Production database connection string
- [ ] `JWT_SECRET` - Generated secure random string (min 32 chars)
- [ ] `SMTP_HOST` - Email server hostname (e.g., `smtp.gmail.com`)
- [ ] `SMTP_PORT` - Email server port (e.g., `587`)
- [ ] `SMTP_USER` - Email account username
- [ ] `SMTP_PASS` - Email account password or app password
- [ ] `SMTP_FROM` - From address for emails (e.g., `noreply@tasksuite.com`)

**Note:** For Gmail, you'll need an [App Password](https://support.google.com/accounts/answer/185833).

---

## Deployment Steps

### Option A: Vercel (Web App) + Railway (API + Database)

#### Part 1: Railway (API + Database)

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up/login with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `MicroServiceTraining-BAH/TaskSuite-Pro`

3. **Add PostgreSQL Service**
   - Click "+ New" → "Database" → "PostgreSQL"
   - Railway will create the database automatically

4. **Add Node.js Service (API)**
   - Click "+ New" → "GitHub Repo"
   - Select `TaskSuite-Pro`
   - Set Root Directory: `apps/api`
   - Set Build Command: `pnpm install && pnpm prisma generate && pnpm build`
   - Set Start Command: `pnpm prisma migrate deploy && pnpm start:prod`

5. **Configure Environment Variables**
   In the Node.js service settings, add:
   ```
   DATABASE_URL=<provided by Railway PostgreSQL>
   PORT=${{PORT}}
   CORS_ORIGINS=<your-vercel-domain>
   JWT_SECRET=<your-generated-secret>
   CLIENT_PORTAL_URL=<your-vercel-domain>
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=<your-email>
   SMTP_PASS=<your-app-password>
   SMTP_FROM=noreply@tasksuite.com
   ```

6. **Deploy**
   - Railway will automatically deploy on push to main
   - Or click "Deploy" manually
   - Note the API URL (e.g., `https://tasksuite-api.up.railway.app`)

#### Part 2: Vercel (Web App)

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up/login with GitHub

2. **Import Repository**
   - Click "Add New..." → "Project"
   - Import `MicroServiceTraining-BAH/TaskSuite-Pro`
   - Set Root Directory: `apps/web`

3. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `pnpm build` (or leave default)
   - Install Command: `pnpm install`
   - Output Directory: `.next`

4. **Add Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=<your-railway-api-url>
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Note your domain (e.g., `tasksuite-pro.vercel.app`)

6. **Update CORS in Railway**
   - Go back to Railway API service
   - Update `CORS_ORIGINS` to include your Vercel domain
   - Redeploy if needed

---

## Post-Deployment Checklist

### Verification Steps

#### API Health Check
- [ ] Visit `https://your-api-url/health`
- [ ] Should return `{"status":"ok"}`

#### API Documentation
- [ ] Visit `https://your-api-url/api`
- [ ] Swagger UI should load

#### Database Migrations
- [ ] Check Railway logs for migration success
- [ ] Should see: "Applied migration: ..."

#### Seed Database (Production)
⚠️ **Only if you want test data in production**

```bash
# SSH into Railway or use Railway CLI
cd apps/api
pnpm prisma db seed
```

#### Web App
- [ ] Visit your Vercel domain
- [ ] Should redirect to `/login` if not authenticated
- [ ] Test login with production credentials
- [ ] Verify API calls work (check browser console)

#### Client Portal
- [ ] Visit `/client/login`
- [ ] Test client login
- [ ] Verify client can only see their own data

---

## Testing Checklist

### Authentication
- [ ] Company user can log in
- [ ] Company user can access dashboard
- [ ] Client can log in via portal
- [ ] Client can access client dashboard
- [ ] Unauthenticated users redirected to login
- [ ] JWT tokens expire correctly (7 days)

### Data Isolation
- [ ] Company users only see their company's data
- [ ] Clients only see their own data
- [ ] Users cannot access other companies
- [ ] Clients cannot access other clients' data

### CRUD Operations
- [ ] Create client
- [ ] Edit client
- [ ] Delete client
- [ ] Create estimate
- [ ] Convert estimate to job
- [ ] Update job status
- [ ] Create appointment
- [ ] Create invoice
- [ ] Mark invoice as paid

### Email Notifications
- [ ] Create estimate → client receives email
- [ ] Update job status → client receives email
- [ ] Create invoice → client receives email
- [ ] Check email service logs for errors

---

## Troubleshooting

### API Won't Start
- Check Railway logs
- Verify all environment variables are set
- Check database connection string
- Verify Prisma migrations ran

### Database Connection Errors
- Verify `DATABASE_URL` is correct
- Check if database service is running in Railway
- Verify database credentials

### CORS Errors
- Verify `CORS_ORIGINS` includes your Vercel domain
- Check for trailing slashes in URLs
- Verify API is accepting requests from web domain

### Email Not Sending
- Check SMTP credentials
- Verify `SMTP_FROM` is valid
- Check email service logs
- For Gmail: Use App Password, not regular password

### Build Failures
- Check Vercel build logs
- Verify all dependencies in `package.json`
- Check for TypeScript errors
- Verify Turborepo workspace is configured correctly

---

## Rollback Procedure

### Railway
1. Go to service settings
2. Click "Deployments" tab
3. Find previous successful deployment
4. Click "Redeploy"

### Vercel
1. Go to project dashboard
2. Click "Deployments" tab
3. Find previous successful deployment
4. Click "..." → "Promote to Production"

---

## Security Checklist

Before going to production:

- [ ] Change `JWT_SECRET` from default
- [ ] Use strong database passwords
- [ ] Enable HTTPS (automatic with Vercel/Railway)
- [ ] Set secure CORS origins (no wildcards)
- [ ] Review environment variables (no secrets in code)
- [ ] Enable rate limiting (already configured)
- [ ] Review authentication guards (already implemented)
- [ ] Set up monitoring/logging
- [ ] Configure backup strategy for database

---

## Maintenance

### Regular Tasks
- Monitor application logs
- Check database size
- Review error rates
- Update dependencies (security patches)
- Backup database regularly

### Database Backups
Railway PostgreSQL:
- Go to database service
- Click "Settings" → "Backups"
- Configure automatic backups

### Dependency Updates
```bash
# Check for updates
pnpm outdated

# Update dependencies
pnpm update

# Test locally before deploying
pnpm build
pnpm test
```

---

## Quick Reference

### Important URLs
- **GitHub Repo:** https://github.com/MicroServiceTraining-BAH/TaskSuite-Pro
- **Railway Dashboard:** https://railway.app
- **Vercel Dashboard:** https://vercel.com
- **GitHub Secrets:** https://github.com/MicroServiceTraining-BAH/TaskSuite-Pro/settings/secrets/actions

### Key Commands
```bash
# Generate JWT Secret
openssl rand -base64 32

# Run migrations locally
cd apps/api && pnpm prisma migrate deploy

# Seed database locally
cd apps/api && pnpm prisma db seed

# Build locally
pnpm build

# Test locally
pnpm dev
```

### Test Credentials (Development Only)
- Company: `owner@cleaningco.com` / `password123`
- Client: `john.smith@example.com` / `password123`

**⚠️ Change all default passwords in production!**

---

## Notes

- All `.env` files are gitignored (never commit secrets)
- `.env.example` files show what variables are needed
- GitHub Secrets are for CI/CD only
- Railway/Vercel environment variables are for runtime
- Database migrations run automatically on Railway deploy
- Prisma Studio: `cd apps/api && pnpm prisma studio` (local only)

