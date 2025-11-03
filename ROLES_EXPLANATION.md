# User Roles in TaskSuite Pro

## Current Role System

Currently, all three roles have **the same permissions** - they can all:
- View and manage all company data
- Create/edit/delete clients, estimates, jobs, invoices, etc.
- Add/remove team members
- Access all features

**The roles are just labels right now** - there's no role-based access control (RBAC) implemented yet.

---

## Intended Role Differences

Here's what these roles **should** represent (typical SaaS patterns):

### 👑 **Owner**
- **Highest level of access**
- Full control over company account
- Can:
  - Manage all company settings
  - Add/remove team members (including owners/admins)
  - Delete the company account
  - Access billing/subscription settings
  - View all data and analytics

### 🛡️ **Admin**
- **Management level access**
- Can:
  - Manage team members (but not other owners)
  - Create/edit all company data
  - Manage clients, jobs, invoices, etc.
  - Access most company settings
  - **Cannot:**
    - Delete company account
    - Change billing settings
    - Remove owners

### 👤 **User**
- **Standard employee access**
- Can:
  - View and manage clients, jobs, invoices, etc.
  - Create estimates and jobs
  - Update job statuses
  - View company data
  - **Cannot:**
    - Add/remove team members
    - Access company settings
    - Delete critical data
    - View sensitive company information

---

## Implementation Status

**Current:** All roles have identical access - role is just stored in database

**Future:** Would need to implement:
1. Role guards/decorators (e.g., `@Roles('owner', 'admin')`)
2. Permission checks in controllers
3. UI that hides/shows features based on role
4. Settings page restrictions

---

## Example Usage

Right now, you can:
- Create users with any role
- All users see the same interface
- All users can manage team members

In the future (if we implement RBAC):
- Only owners/admins could access Settings page
- Only owners could delete company
- Users could only see their assigned clients/jobs
- etc.

