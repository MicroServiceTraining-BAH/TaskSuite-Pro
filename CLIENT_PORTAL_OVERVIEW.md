# Client Portal - How Clients (Customers) Would Access the App

## Current Architecture

### Two Types of Users:

1. **Company Users** (Internal)
   - Employees of CleaningCo or FlooringCo
   - Access: Full dashboard, all clients, all jobs, etc.
   - Login: Company email/password
   - Current URL: `https://tasksuite-pro.vercel.app`

2. **Clients** (Customers) 
   - People who hire CleaningCo/FlooringCo (John Smith, Jane Doe, etc.)
   - Access: **✅ Client Portal Implemented** (Phase 3)
   - Login: Client email/password (separate from company users)
   - Current URL: `http://localhost:3000/client/login`

## Client Portal (Implemented ✅)

### How It Works:

```
CleaningCo's customer "John Smith"
  ↓
Receives email notification (Phase 4) or direct link
  ↓
Visits: http://localhost:3000/client/login
  ↓
Logs in with email/password (separate from company users)
  ↓
Sees ONLY their own:
  - ✅ Estimates sent to them
  - ✅ Jobs being worked on for them
  - ✅ Appointments scheduled for them
  - ✅ Invoices they need to pay
  ↓
Can currently:
  - ✅ View job progress (read-only)
  - ✅ See upcoming appointments
  - ✅ View estimates and invoices
  - ✅ Accept/reject estimates via public link (no login required)
  - 🔜 Pay invoices online (future)
  - 🔜 Message the company (future)
```

## Technical Implementation (✅ Completed)

### Database Changes (✅ Done):
```prisma
model Client {
  id             String   @id @default(cuid())
  companyId      String
  email          String?  @unique // Unique for login
  password       String?  // Hashed password for client portal
  name           String
  phone          String?
  address        String?
  hasPortalAccess Boolean @default(false) // Can this client log in?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

### Routes (✅ Implemented):
- ✅ `/client/login` - Client login page
- ✅ `/client/dashboard` - Client's personal dashboard
- ✅ `/client/estimates` - Only estimates sent to this client
- ✅ `/client/jobs` - Only jobs for this client
- ✅ `/client/invoices` - Only invoices for this client
- ✅ `/client/appointments` - Only appointments for this client
- 🔜 `/client/profile` - Client profile/settings (future)

### API Endpoints (✅ Implemented):
- ✅ `POST /auth/client/login` - Client authentication
- ✅ `GET /client/estimates` - Filtered by clientId from JWT
- ✅ `GET /client/jobs` - Filtered by clientId
- ✅ `GET /client/invoices` - Filtered by clientId
- ✅ `GET /client/appointments` - Filtered by clientId
- ✅ `GET /public/estimates/:token` - Public estimate view (no auth)
- ✅ `POST /public/estimates/:token/approve` - Approve estimate (no auth)
- ✅ `POST /public/estimates/:token/reject` - Reject estimate (no auth)
- 🔜 `POST /client/invoices/:id/pay` - Client pays invoice (future)

## Access Levels Comparison

### Company User (Internal):
- ✅ See ALL clients for their company
- ✅ Create/edit/delete clients
- ✅ Create estimates and send to clients
- ✅ Manage all jobs
- ✅ Create invoices
- ✅ Manage schedule
- ✅ Full CRUD on everything

### Client Portal User (Customer):
- ✅ See ONLY their own estimates
- ✅ See ONLY their own jobs
- ✅ See ONLY their own invoices
- ✅ Accept/reject estimates
- ✅ View job progress (read-only)
- ✅ Pay invoices online
- ❌ Cannot see other clients
- ❌ Cannot create jobs
- ❌ Cannot edit company data

## User Experience Flow

### Scenario: CleaningCo sends estimate to John Smith

1. **Company Side (CleaningCo employee):**
   - Creates estimate for John Smith
   - Sets status to "sent"
   - System sends email to John: "You have a new estimate"

2. **Client Side (John Smith):**
   - Receives email with link
   - Clicks link → Goes to `/client/login`
   - Logs in (or creates account)
   - Redirected to `/client/dashboard`
   - Sees notification: "New estimate awaiting approval"
   - Clicks to view estimate
   - Can accept or request changes

## Implementation Status

### Phase 1: ✅ DONE
- Internal company dashboard
- Multi-tenant company isolation

### Phase 2: Company Authentication ✅ DONE
- ✅ Company users can log in
- ✅ JWT authentication
- ✅ Role-based permissions (stored, not enforced yet)

### Phase 3: Client Portal ✅ DONE
- ✅ Client authentication
- ✅ Client-specific routes
- ✅ Client can view their own data
- ✅ Public estimate viewing and approval (no login required)
- ✅ Estimate acceptance/rejection workflow
- 🔜 Invoice payment integration (future)

### Phase 4: Communication ✅ DONE
- ✅ Email notifications for estimates, jobs, invoices
- 🔜 In-app messaging (future)
- ✅ Status update emails

## Example Client Portal UI

```
┌─────────────────────────────────────┐
│  TaskSuite Pro - Client Portal      │
│  Welcome, John Smith                │
├─────────────────────────────────────┤
│  Dashboard                          │
│  ┌──────────┐  ┌──────────┐        │
│  │  1 New   │  │  $250    │        │
│  │ Estimate │  │ Outstanding│      │
│  └──────────┘  └──────────┘        │
│                                     │
│  My Estimates                       │
│  ┌─────────────────────────────────┐│
│  │ Kitchen Deep Clean - $250       ││
│  │ Status: Pending Approval        ││
│  │ [View Details] [Accept] [Decline]││
│  └─────────────────────────────────┘│
│                                     │
│  Active Jobs                        │
│  ┌─────────────────────────────────┐│
│  │ Office Cleaning - In Progress   ││
│  │ Next Appointment: Tomorrow 10am  ││
│  └─────────────────────────────────┘│
│                                     │
│  Invoices                           │
│  ┌─────────────────────────────────┐│
│  │ INV-2024-001 - $500 - Due Soon  ││
│  │ [Pay Now]                       ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

