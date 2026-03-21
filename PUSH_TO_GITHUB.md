# Push to GitHub - Instructions

> **Note:** This repository has already been pushed to GitHub at `https://github.com/MicroServiceTraining-BAH/TaskSuite-Pro.git`

If you need to push updates or set up a new repository, follow these steps:

## Step 1: Create GitHub Repository (if you haven't already)

1. Go to https://github.com/new
2. Create a new repository (e.g., `TaskSuite-Pro`)
3. **Don't** initialize with README, .gitignore, or license (we already have these)
4. Copy the repository URL (e.g., `https://github.com/yourusername/TaskSuite-Pro.git`)

## Step 2: Add Remote and Push

Run these commands (replace with your GitHub repo URL):

```bash
cd /Users/gabrielcajigas/Documents/TaskSuite-Pro

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Rename main branch (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Environment Variables

**IMPORTANT:** Before deploying, create `.env.example` files:

### `apps/api/.env.example`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tasksuite?schema=public"
PORT=3001
CORS_ORIGINS=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
CLIENT_PORTAL_URL=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@tasksuite.com
```

### `apps/web/.env.example`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Step 4: GitHub Secrets (for CI/CD)

If using GitHub Actions, add these secrets in repo settings:
- `DATABASE_URL`
- `JWT_SECRET`
- `SMTP_*` variables (if using email)

## Commands Summary

```bash
# If you haven't run the commands yet:
git init
git add .
git commit -m "Initial commit: TaskSuite Pro"

# Then add your remote:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

