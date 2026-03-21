# TaskSuite Pro - Niche Transformation Plan

## 🎯 Mission
Transform TaskSuite Pro into a specialized SaaS platform built specifically for small cleaning and flooring companies — replacing Google Sheets, paper estimates, and manual texting.

## 🚀 Product Identity

**Name:** TaskSuite Pro (keeping current)

**Tagline:** "Built for small cleaning and flooring companies — not accountants."

**Mission Statement:** Empower small cleaning and flooring businesses with a simple, powerful, bilingual platform that handles scheduling, jobs, estimates, invoices, materials, and customer communication — without the complexity of QuickBooks.

## 📋 Implementation Status

### ✅ Completed
- [x] Schema updates for industry-specific features
  - Job types (cleaning/flooring)
  - Job photos (before/after)
  - Cleaning checklists (room-by-room)
  - Flooring materials tracking
- [x] Updated branding/metadata

### 🚧 In Progress
- [ ] Database migration
- [ ] Industry-specific estimate builders
- [ ] Job type selection
- [ ] Photo upload functionality
- [ ] Cleaning checklist component
- [ ] Flooring material estimator

### 📅 Planned
- [ ] Bilingual support (English/Spanish)
- [ ] Recurring job scheduling
- [ ] Mobile-first UI updates
- [ ] Industry-specific dashboard metrics
- [ ] SMS reminders
- [ ] Customer portal enhancements

## 🧹 Cleaning Company Features

### Estimates
- Flat rate or hourly pricing
- Room checkboxes (Bedrooms, Bathrooms, Kitchen, Appliances, Windows)
- Deep cleaning add-ons
- Signature capture (future)

### Job Execution
- Before/after photos
- Room-by-room checklist
- Supply usage tracking
- Client satisfaction rating
- Tip tracking

### Scheduling
- Recurring: weekly, bi-weekly, monthly
- Assign cleaners
- Auto-reminders

## 🪵 Flooring Company Features

### Measurement Tools
- Square-foot calculator
- Waste percentage calculator
- Feet ↔ inches converter
- Multiple rooms support

### Material Estimator
- Hardwood, Vinyl plank, Carpet, Tile
- Baseboards & trim
- Adhesive quantities
- Underlayment

### Jobsite Tools
- Upload floor plan (future)
- Jobsite photos
- Change orders → auto-update invoices

### Invoice Structure
- Material cost
- Labor cost
- Disposal fee
- Delivery fee

## 📊 Feature Roadmap

### v1 (MVP - 4 Weeks)
- ✅ Multi-tenant login
- ✅ Client management
- 🚧 Simple estimate builder (industry-specific)
- 🚧 Simple invoice builder
- ✅ Basic schedule calendar
- 🚧 Job notes + photos
- ✅ Payments marked manually
- ✅ Basic reports
- 📅 English/Spanish toggle basics
- ✅ NestJS backend with Prisma
- 📅 Production deployment

### v1.5 (6-8 Weeks)
- Cleaning checklists
- Flooring material estimator
- Jobsite photos + signatures
- Recurring scheduling
- SMS reminders
- Client notifications
- Improved dashboard
- Team assignments

### v2 (Advanced)
- Customer Portal enhancements
- Employee mobile app
- GPS route optimization
- Stripe integrated payments
- AI auto-estimate generator
- AI inspection quality scoring
- Offline mode
- Change order digital approvals

## 💰 Monetization Strategy

### Plan A: Simple Tiers
- **Starter** - $39/mo: 1-2 users, Estimates, Jobs, Simple invoices, Unlimited clients
- **Growth** - $79/mo: Cleaning module, Flooring estimator, SMS reminders, Photos, Team management
- **Pro** - $149/mo: Customer portal, Employee mobile app, Priority support, Multi-location

### Plan B: Bilingual Discount
"Spanish-speaking small-business discount: $10 off every month for life."

## 🌐 Bilingual Strategy

**Technical:**
- Next.js i18n routing
- Translation keys in `/locales/en` and `/locales/es`
- NestJS returns bilingual strings for notifications

**Industry-Accurate Spanish:**
- "Deep Cleaning" → "Limpieza Profunda"
- "Square Footage" → "Metraje Cuadrado"
- "Baseboards" → "Zócalos"
- "Floor Plan" → "Plano del Piso"

## 📝 Next Steps

1. Create database migration for new schema fields
2. Build cleaning-specific estimate builder component
3. Build flooring-specific estimate builder component
4. Add job type selection to job creation flow
5. Implement photo upload functionality
6. Create cleaning checklist component
7. Create flooring material estimator component
8. Update dashboard with industry-specific metrics
9. Set up i18n infrastructure
10. Add recurring job scheduling

