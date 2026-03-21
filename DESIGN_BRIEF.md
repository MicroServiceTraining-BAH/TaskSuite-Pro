# TaskSuite Pro - Design Brief for Figma

## App Overview

**TaskSuite Pro** is a multi-tenant service management platform that helps service companies (cleaning services, flooring companies, contractors, etc.) manage their business operations. The platform serves two types of users:

1. **Company Users** (Internal Staff) - Full access to manage clients, jobs, estimates, invoices, and team members
2. **Client Portal Users** (Customers) - Limited access to view their own estimates, jobs, invoices, and appointments

## Purpose & Value Proposition

- **For Companies:** Streamline operations, manage clients, track jobs from estimate to completion, schedule appointments, and invoice customers
- **For Clients:** View estimates, track job progress, see upcoming appointments, and manage invoices in one place

---

## User Types & Personas

### 1. Company Owner/Admin
- **Role:** Business owner or manager
- **Needs:** Full visibility and control over all business operations
- **Goals:** Efficiently manage team, clients, and revenue

### 2. Company Employee/Staff
- **Role:** Field worker or office staff
- **Needs:** Access to assigned clients and jobs, update job status
- **Goals:** Complete work efficiently and update job progress

### 3. Client/Customer
- **Role:** Person hiring the service company
- **Needs:** View estimates, track job progress, see invoices
- **Goals:** Stay informed about their projects and manage payments

---

## Application Structure

### Company Portal (Main Application)

#### Authentication
- **Login Page** (`/login`)
  - Email and password input fields
  - "Remember me" option (optional)
  - "Forgot password?" link (future)
  - Clean, professional design
  - Company branding area

#### Dashboard (`/dashboard`)
- **Layout:** Grid of overview cards
- **Cards:**
  - Total Clients (with icon)
  - Active Jobs (with icon)
  - Pending Estimates (with icon)
  - Upcoming Appointments (with icon)
  - Unpaid Invoices (with icon)
  - Total Revenue (optional)
- **Quick Actions:** Buttons to create new client, estimate, job, etc.
- **Recent Activity:** List of recent actions (optional)

#### Navigation
- **Sidebar or Top Navigation Bar** with:
  - Dashboard
  - Clients
  - Estimates
  - Jobs
  - Schedule (Appointments)
  - Invoices
  - Settings
  - User profile dropdown (logout, account settings)

#### Clients Page (`/clients`)
- **Layout:** Table/list view of all clients
- **Table Columns:**
  - Name
  - Email
  - Phone
  - Address
  - Status (Active/Inactive)
  - Actions (Edit, Delete)
- **Top Actions:**
  - "+ Add Client" button
  - Search bar
  - Filter options
- **Client Form/Dialog:**
  - Name (required)
  - Email
  - Phone
  - Address
  - Notes (optional)
  - Portal Access toggle (future: enable client login)

#### Estimates Page (`/estimates`)
- **Layout:** Card or table view
- **Estimate Card/Row:**
  - Estimate Title/Description
  - Client Name
  - Amount
  - Status (Draft, Sent, Accepted, Rejected)
  - Created Date
  - Actions (View, Edit, Delete, Convert to Job)
- **Top Actions:**
  - "+ Create Estimate" button
  - Filter by status
  - Search
- **Estimate Form:**
  - Client selector
  - Title/Description
  - Amount
  - Notes
  - Status

#### Jobs Page (`/jobs`)
- **Layout:** Kanban board or list view
- **Status Columns (Kanban):**
  - Pending
  - In Progress
  - Completed
  - Cancelled
- **Job Card:**
  - Job Title
  - Client Name
  - Assigned To (team member)
  - Status Badge
  - Due Date
  - Priority (optional)
  - Actions (Edit, Update Status, Delete)
- **Top Actions:**
  - "+ Create Job" button
  - Filter by status, client, assignee
  - View toggle (Kanban/List)

#### Schedule Page (`/schedule`)
- **Layout:** Calendar view or list view
- **Calendar View:**
  - Monthly calendar grid
  - Appointments shown on dates
  - Color coding by client or type
  - Click date to add appointment
- **List View:**
  - Upcoming appointments
  - Date, Time, Client, Location
  - Actions (Edit, Delete)
- **Top Actions:**
  - "+ Add Appointment" button
  - View toggle (Calendar/List)
  - Filter by date range
- **Appointment Form:**
  - Client selector
  - Date and Time picker
  - Duration
  - Location/Address
  - Description/Notes
  - Recurring option (weekly)

#### Invoices Page (`/invoices`)
- **Layout:** Table view
- **Table Columns:**
  - Invoice Number
  - Client Name
  - Amount
  - Status (Unpaid, Paid, Overdue)
  - Due Date
  - Paid Date
  - Actions (View, Edit, Mark as Paid, Delete)
- **Top Actions:**
  - "+ Create Invoice" button
  - Filter by status
  - Search
- **Invoice Form:**
  - Client selector
  - Invoice Number (auto-generated or manual)
  - Amount
  - Due Date
  - Description/Line Items
  - Status

#### Settings Page (`/settings`)
- **Layout:** Tabbed or sectioned layout
- **Sections:**
  - **Team Members:**
    - List of team members
    - Name, Email, Role (Owner, Admin, User)
    - Actions (Edit, Delete)
    - "+ Add Team Member" button
  - **Company Information:**
    - Company Name
    - Address
    - Phone
    - Email
    - Logo upload (future)
  - **Account Settings:**
    - User profile
    - Change password
    - Notification preferences (future)
- **Team Member Form:**
  - Name
  - Email
  - Password
  - Role selector (Owner, Admin, User)

---

### Client Portal (Separate Interface)

#### Client Login (`/client/login`)
- Similar to company login but branded for clients
- Clear messaging: "Client Portal" or "Customer Login"
- Email and password fields

#### Client Dashboard (`/client/dashboard`)
- **Layout:** Simplified, customer-focused
- **Overview Cards:**
  - Pending Estimates
  - Active Jobs
  - Upcoming Appointments
  - Unpaid Invoices (with amount)
- **Recent Activity:** Timeline of updates

#### Client Navigation
- **Simplified Navigation:**
  - Dashboard
  - My Estimates
  - My Jobs
  - My Appointments
  - My Invoices
  - Profile/Account

#### Client Estimates Page (`/client/estimates`)
- **Layout:** Card view (read-only)
- **Estimate Card:**
  - Title/Description
  - Amount (large, prominent)
  - Status (Pending Review, Accepted, Rejected)
  - Created Date
  - Expiry Date (if applicable)
  - View Details button
  - Accept/Reject buttons (future)
- **No creation/editing:** Clients can only view

#### Client Jobs Page (`/client/jobs`)
- **Layout:** List or card view
- **Job Card:**
  - Job Title
  - Status (with progress indicator)
  - Assigned Team Member
  - Start Date
  - Estimated Completion
  - Notes/Updates
  - View Details button
- **Status Indicators:** Visual progress bars or status badges

#### Client Appointments Page (`/client/appointments`)
- **Layout:** Calendar or list view
- **Appointment Card:**
  - Date and Time
  - Service Type/Description
  - Location
  - Assigned Team Member
  - Status (Scheduled, Completed, Cancelled)
- **Upcoming appointments highlighted**

#### Client Invoices Page (`/client/invoices`)
- **Layout:** Table or card view
- **Invoice Card:**
  - Invoice Number
  - Amount (prominent)
  - Status (Unpaid, Paid, Overdue)
  - Due Date
  - Description/Line Items
  - "Pay Now" button (future integration)
  - Download PDF button (future)

---

## Design Requirements

### Color Scheme
- **Primary Color:** Professional blue or green (trust, professionalism)
- **Secondary Color:** Complementary accent color
- **Success:** Green (completed jobs, paid invoices)
- **Warning:** Orange/Yellow (pending, due soon)
- **Error:** Red (overdue, cancelled)
- **Neutral:** Grays for backgrounds and text
- **Background:** Light gray or white

### Typography
- **Headings:** Bold, modern sans-serif (e.g., Inter, Poppins, Montserrat)
- **Body:** Clean, readable sans-serif
- **Monospace:** For invoice numbers, IDs
- **Hierarchy:** Clear size differentiation (H1, H2, H3, Body, Small)

### UI Components Needed

#### Buttons
- Primary (solid, prominent)
- Secondary (outlined)
- Ghost (text only)
- Danger (delete actions)
- Icon buttons
- States: Default, Hover, Active, Disabled

#### Form Elements
- Text inputs (standard, with label)
- Text areas
- Select/Dropdown
- Checkbox
- Radio buttons
- Toggle switches
- Date picker
- Time picker
- File upload

#### Cards
- Client card
- Estimate card
- Job card
- Invoice card
- Appointment card
- Dashboard stat card

#### Tables
- Data table with sorting
- Action buttons per row
- Pagination
- Search/filter bar

#### Navigation
- Sidebar navigation (collapsible)
- Top navigation bar
- Breadcrumbs
- Tab navigation
- Mobile menu

#### Modals/Dialogs
- Form dialogs (create/edit)
- Confirmation dialogs (delete)
- Detail view modals

#### Status Indicators
- Badges (status tags)
- Progress bars
- Icons with labels
- Color-coded status

#### Feedback
- Success messages (toast/notification)
- Error messages
- Loading states
- Empty states

### Layout Patterns

#### Desktop (1280px+)
- Sidebar navigation (left) - 240px width
- Main content area (flexible)
- Optional right panel for details

#### Tablet (768px - 1279px)
- Collapsible sidebar
- Stacked layout for forms
- Grid adapts to 2 columns

#### Mobile (320px - 767px)
- Hamburger menu
- Full-width cards
- Bottom navigation (optional)
- Stacked forms
- Touch-friendly targets (min 44x44px)

---

## User Flows

### Flow 1: Company User Creates Estimate
1. User logs in → Dashboard
2. Clicks "Clients" → Views client list
3. Selects client → Clicks "Create Estimate"
4. Fills estimate form
5. Saves → Redirected to estimates page
6. Estimate appears in list

### Flow 2: Converting Estimate to Job
1. User on Estimates page
2. Clicks estimate card
3. Clicks "Convert to Job" button
4. Confirmation dialog appears
5. Confirms → Job created
6. Redirected to Jobs page
7. Job appears in "Pending" column

### Flow 3: Client Views Their Job Progress
1. Client logs into portal → Dashboard
2. Sees "1 Active Job" card
3. Clicks "My Jobs"
4. Views job card with status
5. Clicks job → Sees details and updates
6. Can see progress timeline

### Flow 4: Updating Job Status
1. Staff member on Jobs page
2. Clicks job card
3. Clicks "Update Status"
4. Selects new status (e.g., "In Progress")
5. Saves → Status updates
6. Client receives email notification (if configured)

### Flow 5: Creating Recurring Appointment
1. Staff on Schedule page
2. Clicks "Add Appointment"
3. Selects client
4. Sets date and time
5. Checks "Recurring" option
6. Sets recurrence (weekly, number of occurrences)
7. Saves → Multiple appointments created

---

## Visual Hierarchy

### Priority Levels
1. **Primary Actions:** Create, Save, Submit (most prominent)
2. **Secondary Actions:** Edit, View Details (medium prominence)
3. **Tertiary Actions:** Delete, Cancel (less prominent, often in menu)

### Information Architecture
- **Most Important:** Current status, amounts, due dates
- **Supporting Info:** Dates, client names, descriptions
- **Actions:** Contextual, near relevant content

---

## Accessibility Requirements

- **Color Contrast:** WCAG AA compliant (4.5:1 for text)
- **Keyboard Navigation:** All interactive elements accessible
- **Screen Reader Support:** Proper labels, ARIA attributes
- **Focus Indicators:** Visible focus states
- **Alternative Text:** Icons and images have alt text

---

## Design Principles

1. **Clarity:** Information is easy to scan and understand
2. **Efficiency:** Common actions are quick to access
3. **Consistency:** Similar patterns used throughout
4. **Feedback:** Users always know what's happening (loading, success, errors)
5. **Professionalism:** Clean, modern, business-appropriate aesthetic

---

## Brand Identity

### Personality
- Professional but approachable
- Reliable and trustworthy
- Efficient and modern
- Clean and organized

### Visual Style
- Minimalist design
- Generous whitespace
- Clear typography hierarchy
- Subtle shadows and borders
- Smooth transitions and animations

---

## Technical Constraints

- Built with **Next.js 15** (App Router)
- Uses **shadcn/ui** component library
- **Tailwind CSS** for styling
- Responsive design required
- Dark mode support (optional, future)

---

## Deliverables for Figma

When creating the Figma design, please include:

1. **Design System**
   - Color palette with hex codes
   - Typography scale and styles
   - Component library (buttons, inputs, cards, etc.)
   - Spacing system (8px grid recommended)

2. **Page Designs**
   - Company Portal: Login, Dashboard, Clients, Estimates, Jobs, Schedule, Invoices, Settings
   - Client Portal: Login, Dashboard, Estimates, Jobs, Appointments, Invoices

3. **Component States**
   - Hover, active, disabled states
   - Loading states
   - Error states
   - Empty states

4. **Responsive Breakpoints**
   - Desktop (1280px+)
   - Tablet (768px)
   - Mobile (375px)

5. **User Flows**
   - Annotated flows showing key user journeys
   - Interaction patterns documented

6. **Prototyping**
   - Clickable prototypes for main flows
   - Transitions between screens

---

## Additional Notes

- The app uses a **multi-tenant architecture** - each company's data is isolated
- **Role-based permissions** exist but aren't fully enforced yet (Owner, Admin, User)
- **Email notifications** are sent for key events (estimate created, job updated, invoice created)
- **Client portal** is a separate experience with restricted access
- The design should feel modern but not overly trendy (needs to age well)
- Consider internationalization (i18n) in design (text expansion)

---

## Design Inspiration

Consider referencing:
- **Monday.com** - For board/kanban views
- **Stripe Dashboard** - For clean, professional interface
- **Linear** - For modern, minimalist design
- **Notion** - For flexible, organized layouts
- **Calendly** - For scheduling interfaces

---

This brief provides comprehensive information for creating a complete Figma design system and UI mockups for TaskSuite Pro. Use this document as input to generate detailed Figma designs, component libraries, and interactive prototypes.

