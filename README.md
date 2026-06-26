# Qadiroon Web

An Arabic news and community platform built for accessibility. Qadiroon provides news, job listings, success stories, government services, and more for people with disabilities and the broader community.

## Tech Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS
- **Backend:** Express.js + better-sqlite3
- **UI:** Radix UI primitives, MUI, Lucide React icons, Motion animations
- **Editor:** TipTap rich text editor
- **Auth:** JWT + bcrypt + OTP 2FA

## Getting Started

```bash
# Install dependencies
npm install

# Start both servers (dev mode)
npm run dev:all

# Or start individually
npm run dev          # Vite dev server → http://localhost:5173
npm run dev:server   # Express API → http://localhost:3001
```

### Default Admin Login
- **Email:** admin@qadiroon.com
- **Password:** Admin@1234

## Project Structure

```
src/
├── admin/          # Admin panel components
│   ├── AdminLayout.tsx      # Layout wrapper
│   ├── AdminSidebar.tsx     # Navigation sidebar
│   ├── AdminLanding.tsx     # Home page editor (all sections)
│   ├── AdminBlogs.tsx       # Blog management
│   ├── BlogEditor.tsx       # Rich post editor with preview
│   ├── AdminCategories.tsx  # Category management
│   ├── AdminAds.tsx         # Ad slots visual manager
│   ├── ImageUploader.tsx    # Reusable drag-drop uploader
│   ├── RichTextEditor.tsx   # TipTap editor wrapper
│   └── i18n.ts              # Arabic/English translations
├── app/
│   ├── App.tsx              # Public home page
│   ├── components/          # Public-facing components
│   │   ├── Header.tsx, Footer.tsx
│   │   ├── HeroSection.tsx, LandingSpotlight.tsx
│   │   ├── CategoryCards.tsx
│   │   ├── MostRequestedServices.tsx
│   │   ├── WeeklyPoll.tsx
│   │   ├── JobOpportunities.tsx
│   │   ├── NewsGrid.tsx
│   │   ├── PartnersAdsCarousel.tsx
│   │   ├── SuccessStories.tsx
│   │   └── GovernmentServices.tsx
│   └── pages/
│       ├── BlogListPage.tsx
│       ├── BlogPostPage.tsx
│       ├── CategoryPage.tsx
│       └── DynamicPage.tsx
├── context/        # React contexts (PublicData, Animation)
├── hooks/          # Custom hooks (usePublicData)
└── lib/            # API client + types
server/
├── index.js        # Express API routes
├── db.js           # SQLite schema + seed data
├── migrate.js      # Schema migrations
├── security.js     # Rate limiting, lockouts
├── audit.js        # Audit logging
└── middleware/      # Auth middleware
```

## Features

### Public Site
- Arabic RTL interface with English toggle
- Dark/light mode, high contrast mode, font sizing
- Screen reader support with listen-aloud feature
- Splash intro animation
- Hero section with auto-rotating news slides
- Category cards grid
- Featured spotlight sections
- Interactive weekly poll
- Job opportunities grid with filtering
- News grid with infinite scroll
- Partners/advertising carousel
- Success stories section
- Government services directory
- Blog listing with category badges
- Blog post pages with table of contents, breadcrumbs
- Category archive pages
- Edge marquee ad placements
- In-content ad slots with Google AdSense placeholders

### Admin Panel
- Dashboard with stats, recent activity
- Navbar manager (drag-and-drop reorder)
- **Home Page editor** — manage all home page sections:
  - Hero title, subtitle, stats
  - Breaking news ticker
  - Spotlight cards (with drag-and-drop image upload)
  - Most Requested Services (ranked list)
  - Weekly Poll (question + options)
  - Job Opportunities (full CRUD with company logos)
  - Success Stories (title, excerpt, image)
  - Government Services (icons, badges, authorities)
  - About content (rich text)
- **Blog editor** with TipTap rich text, SEO panel, preview modal
- **Category manager** with image upload
- **Ad Slots** — visual page mockup with clickable regions, multi-ad rotation
- **SEO Settings** — meta tags, sitemap, robots.txt
- **Form Inbox** — form submissions viewer
- **User management** (admin only)
- **Security** — 2FA setup, audit log
- PM2 logs viewer
- Arabic/English admin interface

### API Endpoints
- `GET /api/public/landing` — All home page data
- `GET /api/public/blogs` — Published posts (paginated)
- `GET /api/public/blogs/:slug` — Single post
- `GET /api/public/categories` — Category listing
- `GET /api/public/categories/:slug` — Category + posts
- `GET /api/public/ads` — Active ad placements
- `GET/POST/PUT/DELETE /api/admin/*` — Full CRUD for all entities
- `POST /api/admin/upload` — File upload handler

## Latest Update (June 2026)

### New Home Page Sections
- Most Requested Services (ranked widget)
- Weekly Poll (interactive voting)
- Job Opportunities grid (3-column card layout)
- Success Stories section
- Government Services directory (4-column grid with badges)
- Category cards grid
- Partners/Ads auto-rotating carousel
- Upgraded news grid with load-more pagination

### Admin Improvements
- Universal drag-and-drop image uploader (replaces all URL text inputs)
- Full editors for all new home page sections
- Visual ad slot placement picker (click regions on page mockup)
- Multi-ad support per slot with rotation ordering
- Post preview modal showing real rendering
- Removed Pages, Forms, Performance, Code Snippets from admin
- Renamed Landing Page → Home Page

### Bug Fixes
- Category badges now link to working category archive pages
- Fixed AdBanner temporal dead zone crash

## License

Proprietary — All rights reserved.
