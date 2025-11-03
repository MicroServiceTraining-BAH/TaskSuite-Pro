# TaskSuite Pro - User Experience Guide

## How Users Access the Application

### Production URLs
- **Web Application**: `https://tasksuite-pro.vercel.app`
- **API**: `https://tasksuite-api.railway.app` (internal)

### User Journey

#### Phase 1 (Current - No Authentication)
1. **User opens browser** → Types URL or clicks link
2. **Landing on Dashboard** → Sees overview cards
3. **Company Selection** → Dropdown in navigation (top right)
4. **Data Loading** → Sees company-specific data
5. **CRUD Operations** → Can create, edit, delete records

#### Phase 2 (With Authentication)
1. **User visits** → `https://tasksuite-pro.vercel.app`
2. **Redirected to Login** → If not authenticated
3. **Login Screen** → Email + Password
4. **Authentication** → JWT token stored
5. **Auto-redirect** → To dashboard
6. **Company Auto-detected** → From user's companyId
7. **Personalized Dashboard** → Shows their company's data only

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
- Account settings (Phase 2)
- Company settings (Phase 2)
- User preferences (Phase 2)

## Multi-Company Scenarios

### Scenario 1: Single Company User
- User belongs to one company (CleaningCo)
- Logs in → Automatically sees CleaningCo data
- No company selector needed
- Cannot access other companies' data

### Scenario 2: Multi-Company User (Admin)
- User belongs to multiple companies
- Logs in → Sees company selector
- Can switch between companies
- Each company's data is isolated

### Scenario 3: Company Owner
- Owner of CleaningCo
- Can see all data for their company
- Can invite other users (Phase 2)
- Can manage company settings

## Security & Data Isolation

### Current Implementation (Phase 1)
- Company selection via dropdown
- Company ID stored in localStorage
- All API requests include `X-Company-Id` header
- API filters all queries by companyId

### Phase 2 Implementation
- JWT authentication
- User's companyId from JWT token
- Automatic company detection
- Role-based access control
- Users cannot access other companies' data

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

