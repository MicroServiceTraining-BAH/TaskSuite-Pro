# Account Creation Guide

This document explains how owners and clients create their accounts in TaskSuite Pro.

## Owner Account Creation (Company Signup)

### How It Works

**New owners** can create their company account through the signup flow:

1. **Visit `/signup`** page
2. **Fill out the form:**
   - Company Name (required)
   - Your Name (optional)
   - Email (required)
   - Password (required, minimum 6 characters)
3. **Submit** - This creates:
   - A new Company record
   - An Owner user account (role: "owner")
   - Automatically logs them in
4. **Onboarding** - After signup, owners are redirected to `/onboarding` to:
   - Set company preferences (industry, team size, timezone)
   - Configure financial settings (accounting method, currency, invoice prefix)
   - Preview banking and automation features

### API Endpoint

- **POST** `/auth/signup`
- **Body:**
  ```json
  {
    "email": "owner@example.com",
    "password": "password123",
    "companyName": "Acme Services",
    "name": "John Doe" // optional
  }
  ```
- **Returns:** JWT token and user info (same format as login)

### What Happens Behind the Scenes

1. Checks if email already exists (throws 409 Conflict if it does)
2. Creates company and owner user in a database transaction
3. Hashes password with bcrypt
4. Returns JWT token for immediate login

---

## Adding Team Members (Admin/Owner Only)

**Existing owners/admins** can add team members to their company:

1. **Go to Settings → Users** (or `/settings` page)
2. **Click "Add User"**
3. **Fill out:**
   - Email (required)
   - Name (optional)
   - Password (required for new users)
   - Role (user, admin, or owner)
4. **Save** - The new user receives:
   - A welcome email with their credentials
   - Access to the company dashboard

### API Endpoint

- **POST** `/users` (requires JWT authentication)
- **Body:**
  ```json
  {
    "email": "staff@example.com",
    "name": "Jane Smith",
    "password": "password123",
    "role": "user"
  }
  ```
- **Note:** `companyId` is automatically set from the JWT token

---

## Client Account Creation

### How Clients Get Accounts

**Clients don't sign up themselves** - they are created by company admins/owners:

1. **Company admin/owner** goes to **Clients** page (`/clients`)
2. **Clicks "Add Client"**
3. **Fills out client information:**
   - Name (required)
   - Email (optional)
   - Phone (optional)
   - Address (optional)
4. **Saves** - Client is created

### Enabling Client Portal Access

**Currently**, client portal access is managed through:
- Setting `hasPortalAccess: true` on the client record
- Setting a `password` on the client record
- Client must have an `email` address

**Note:** The UI for enabling portal access and setting passwords is not yet implemented in the client dialog. This would need to be added to:
- `apps/web/src/components/clients/client-dialog.tsx` - Add fields for:
  - `hasPortalAccess` checkbox
  - `password` field (when enabling portal access)
- `apps/api/src/clients/dto/create-client.dto.ts` - Add optional fields:
  - `password?: string`
  - `hasPortalAccess?: boolean`

### Client Login

Once a client has portal access enabled:
1. **Visit** `/client/login`
2. **Login with:**
   - Email (the email set on their client record)
   - Password (the password set by the admin)
3. **Access** their client portal to view:
   - Their estimates
   - Their jobs
   - Their invoices
   - Their appointments

### API Endpoint

- **POST** `/auth/client/login`
- **Body:**
  ```json
  {
    "email": "client@example.com",
    "password": "password123"
  }
  ```
- **Returns:** JWT token with `type: "client"` and client info

---

## Summary

| User Type | How They Get Account | Who Creates It | Portal Access |
|-----------|---------------------|----------------|---------------|
| **Owner** | Self-signup via `/signup` | Themselves | Full company dashboard |
| **Admin/Staff** | Added by Owner/Admin | Owner/Admin via Settings | Full company dashboard |
| **Client** | Created by Admin/Owner | Admin/Owner via Clients page | Client portal (if enabled) |

---

## Future Enhancements

1. **Client Portal Access UI:**
   - Add checkbox to enable/disable portal access when creating/editing clients
   - Add password field (with generate random password option)
   - Send welcome email to clients when portal access is enabled

2. **Password Reset:**
   - Add "Forgot Password" flow for owners/admins
   - Add "Forgot Password" flow for clients

3. **Email Verification:**
   - Verify email addresses before allowing login
   - Send verification emails on signup

4. **Invitation System:**
   - Send invitation emails to team members
   - Allow team members to set their own passwords via invitation link

