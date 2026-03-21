# TaskSuite Pro - User Experience Guide

## How Users Access the Application

### Production URLs
- **Web Application**: `https://tasksuite-pro.vercel.app`
- **API**: `https://tasksuite-api.railway.app` (internal)

### User Journey

#### Company User (Current - Phases 2, 3, 4 Implemented)
1. **User visits** → `https://tasksuite-pro.vercel.app` or `http://localhost:3000`
2. **Redirected to Login** → If not authenticated (`/login`)
3. **Login Screen** → Email + Password
4. **Authentication** → JWT token stored in localStorage
5. **Auto-redirect** → To dashboard
6. **Company Auto-detected** → From JWT token's companyId
7. **Personalized Dashboard** → Shows their company's data only
8. **Full Access** → Can manage clients, estimates, jobs, invoices, appointments, and team members

#### Client Portal (Current - Phase 3 Implemented)
1. **Client visits** → `http://localhost:3000/client/login`
2. **Login Screen** → Email + Password (separate from company users)
3. **Authentication** → JWT token stored in localStorage
4. **Auto-redirect** → To `/client/dashboard`
5. **Restricted Access** → Only sees their own estimates, jobs, invoices, and appointments
6. **Read-Only Dashboard** → Cannot create or edit company data

## Features Users Can Access

### Dashboard (`/dashboard`)
- Overview cards linking to all sections
- Quick navigation

### Clients (`/clients`)
- View all clients for their company
- Add new clients
- Edit client information
- Delete clients

### Estimates (`/estimates`)
- View all estimates
- Convert estimates to jobs
- See estimate status

### Jobs (`/jobs`)
- View all jobs
- Update job status (pending → in_progress → completed)
- See job details

### Schedule (`/schedule`)
- View all appointments
- See weekly recurring appointments
- Manage appointment schedule

### Invoices (`/invoices`)
- View all invoices
- Mark invoices as paid
- See payment status

### Settings (`/settings`)
- Team member management
- Add/edit/remove company users
- Assign roles (owner, admin, user)

## Multi-Company Scenarios

### Scenario 1: Single Company User
- User belongs to one company (CleaningCo)
- Logs in → Automatically sees CleaningCo data
- No company selector needed
- Cannot access other companies' data

### Scenario 2: Multi-Company User (Future)
- User belongs to multiple companies
- Would see company selector (not yet implemented)
- Could switch between companies
- Each company's data would be isolated

### Scenario 3: Company Owner
- Owner of CleaningCo
- Can see all data for their company
- Can invite other users (Phase 2)
- Can manage company settings

## Security & Data Isolation

### Current Implementation (Phases 2, 3, 4)
- JWT authentication for both company users and clients
- User's companyId extracted from JWT token
- Automatic company detection (no manual selection needed)
- Client data isolation (clients only see their own records)
- Company data isolation (users only see their company's data)
- Password hashing with bcrypt
- 7-day JWT token expiration
- All authenticated routes protected with JWT guards

## Deployment Architecture

```
Users' Browser
    ↓
    HTTP/HTTPS
    ↓
Vercel (Web App)
    ↓
    API Requests
    ↓
Railway (API Server)
    ↓
    Database Queries
    ↓
PostgreSQL Database
```

## User Access Methods

1. **Direct URL**: Type `tasksuite-pro.vercel.app` in browser
2. **Bookmark**: Save to bookmarks for quick access
3. **Mobile**: Responsive design works on mobile browsers
4. **Shared Link**: Company admin shares login URL with team

## Mobile Experience

- Responsive design (works on phones/tablets)
- Touch-friendly buttons and forms
- Mobile navigation menu
- Optimized for small screens

## Browser Requirements

- Modern browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- LocalStorage support (for company selection in Phase 1)

