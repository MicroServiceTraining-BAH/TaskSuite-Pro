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
   - Access: **Currently NONE** - app is internal only
   - Would need: Client Portal

## Client Portal Concept

### How It Would Work:

```
CleaningCo's customer "John Smith"
  ↓
Receives email invitation or link
  ↓
Visits: https://tasksuite-pro.vercel.app/client
  ↓
Logs in with email/password (separate from company users)
  ↓
Sees ONLY their own:
  - Estimates sent to them
  - Jobs being worked on for them
  - Appointments scheduled for them
  - Invoices they need to pay
  ↓
Can:
  - Accept/reject estimates
  - View job progress
  - See upcoming appointments
  - Pay invoices online
  - Message the company
```

## Technical Implementation Needed

### Database Changes:
```prisma
model Client {
  id        String   @id @default(cuid())
  companyId String
  email     String?  // Would need to be unique for login
  password  String?  // Hashed password for client portal
  name      String
  phone     String?
  address   String?
  hasPortalAccess Boolean @default(false) // Can this client log in?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### New Routes Needed:
- `/client/login` - Client login page
- `/client/dashboard` - Client's personal dashboard
- `/client/estimates` - Only estimates sent to this client
- `/client/jobs` - Only jobs for this client
- `/client/invoices` - Only invoices for this client
- `/client/profile` - Client profile/settings

### API Endpoints Needed:
- `POST /auth/client/login` - Client authentication
- `GET /client/estimates` - Filtered by clientId from JWT
- `GET /client/jobs` - Filtered by clientId
- `POST /client/estimates/:id/accept` - Client accepts estimate
- `POST /client/invoices/:id/pay` - Client pays invoice

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

## Implementation Priority

### Phase 1 (Current): ✅ DONE
- Internal company dashboard
- Multi-tenant company isolation

### Phase 2: Company Authentication
- Company users can log in
- JWT authentication
- Role-based permissions

### Phase 3: Client Portal (NEW)
- Client authentication
- Client-specific routes
- Client can view their own data
- Estimate acceptance workflow
- Invoice payment integration

### Phase 4: Communication
- Email notifications
- In-app messaging
- Status update emails

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

