# Figma Design Specification - TaskSuite Pro

This document references the Figma design specification generated from the design brief.

## Design File
- **File:** `figma-design-spec.json`
- **Theme:** Enterprise Pro
- **Font Family:** Poppins
- **Dark Mode:** Figma spec is light-theme only — full dark mode is implemented in the application via CSS custom properties and `next-themes`

## Design System

### Colors

#### Primary Colors
- **Primary:** Teal (#0D9492) - RGB(13, 148, 146)
- **Secondary:** Blue (#2563EB) - RGB(37, 99, 235)
- **Success:** Green (#165A4A) - RGB(22, 90, 74)
- **Warning:** Orange (#F59E0B) - RGB(245, 158, 11)
- **Danger:** Red (#DC2626) - RGB(220, 38, 38)

#### Neutral Colors
- **Gray 900:** #0F1729 - Darkest text
- **Gray 700:** #334455 - Medium text
- **Gray 500:** #64738B - Muted text
- **Gray 300:** #CBD5E1 - Borders
- **Gray 100:** #F1F5F9 - Light backgrounds

### Typography (Poppins)

- **H1:** Bold, 32px, 120% line height
- **H2:** Semibold, 24px, 120% line height
- **H3:** Semibold, 20px, 120% line height
- **Body:** Regular, 16px, 140% line height
- **Small:** Regular, 14px, 140% line height
- **Mono:** JetBrains Mono, 13px, 140% line height

### Effects

- **Card Shadow:** Drop shadow, 12px radius, 4px offset, 12% opacity
- **Border Radius:** 12px (medium)

## Components Library

1. **Button** - Primary/Secondary/Ghost/Danger variants
2. **Input/Textfield** - Standard text input
3. **Select** - Dropdown component
4. **Card/Stat** - Summary stat card
5. **Table/Standard** - Data table component
6. **Board/Kanban** - Kanban board layout
7. **Calendar/Monthly** - Monthly calendar grid
8. **Form/Standard** - Form layout with labels/inputs
9. **Logo/Brand** - Brand lockup component
10. **Shell/SidebarLayout** - App layout with sidebar navigation

## Pages Included

### Company Portal
1. **Design System** - Colors, Typography, Components
2. **Company - Auth** - Login page
3. **Company - Dashboard** - Main dashboard with stats
4. **Company - Clients** - Client management page
5. **Company - Estimates** - Estimate management page
6. **Company - Jobs** - Jobs Kanban board
7. **Company - Schedule** - Calendar view for appointments
8. **Company - Invoices** - Invoice management page
9. **Company - Settings** - Team members and company info

### Client Portal
1. **Client - Auth** - Client login page
2. **Client - Dashboard** - Client dashboard with overview
3. **Client - Estimates** - Client's estimates view
4. **Client - Jobs** - Client's jobs view
5. **Client - Appointments** - Client's appointments calendar
6. **Client - Invoices** - Client's invoices view
7. **Client - Profile** - Client profile settings

## Implementation Notes

### Using This Design Specification

1. **Import to Figma:**
   - The JSON file can be used as reference for creating actual Figma designs
   - Use Figma plugins like "Figma to Code" or similar to import structure

2. **Color Implementation:**
   - Convert RGB values to hex for Tailwind CSS configuration
   - Update `apps/web/tailwind.config.ts` with these colors

3. **Typography:**
   - Ensure Poppins font is loaded in Next.js
   - Add to `apps/web/src/app/layout.tsx` or use `next/font/google`

4. **Components:**
   - Use shadcn/ui components as base
   - Customize to match this design system
   - Create variants for buttons, cards, etc.

5. **Layout:**
   - Sidebar width: 240px
   - Content padding: 24px
   - Item spacing: 24px

## Next Steps

1. **Create Figma File:**
   - Import this spec into Figma or recreate manually
   - Use as reference for detailed designs

2. **Implement Design Tokens:**
   - Add colors to Tailwind config
   - Set up typography scales
   - Define spacing system

3. **Build Components:**
   - Start with design system components
   - Then build page layouts
   - Ensure responsive breakpoints

4. **Connect to Code:**
   - Use Figma's Dev Mode or inspect mode
   - Extract exact measurements and styles
   - Implement in Next.js components

## Design Tokens (for Code)

### Tailwind Config Colors
```javascript
colors: {
  primary: '#0D9492',
  secondary: '#2563EB',
  success: '#165A4A',
  warning: '#F59E0B',
  danger: '#DC2626',
  gray: {
    900: '#0F1729',
    700: '#334455',
    500: '#64738B',
    300: '#CBD5E1',
    100: '#F1F5F9',
  }
}
```

### Typography Scale
```javascript
fontSize: {
  h1: ['32px', { lineHeight: '120%', fontWeight: '700' }],
  h2: ['24px', { lineHeight: '120%', fontWeight: '600' }],
  h3: ['20px', { lineHeight: '120%', fontWeight: '600' }],
  body: ['16px', { lineHeight: '140%', fontWeight: '400' }],
  small: ['14px', { lineHeight: '140%', fontWeight: '400' }],
}
```

### Spacing
- Card padding: 24px
- Section spacing: 24px
- Sidebar width: 240px
- Border radius: 12px

## Reference

- See `DESIGN_BRIEF.md` for original design requirements
- See `figma-design-spec.json` for complete design specification
- Design matches "Enterprise Pro" theme with Poppins font family

