# Qadiroon — Admin Panel Implementation Prompt for Cursor

## Project Status
The landing page (index) is already built. Now we need to implement the full admin system and connect everything together.

---

## Part 1 — Secret Admin Route in the Header

Add a hidden route trigger in the header: when the user types `/admin` in the browser URL, they are redirected to the admin login page.

- Route: `/admin` → redirects to `/admin/login`
- This route must NOT appear in the main navigation
- The admin login page should be completely separate from the public site visually — use a clean, minimal dark login UI

---

## Part 2 — Authentication System

### Login Page (`/admin/login`)
- Fields: Email + Password
- On success: redirect to `/admin/dashboard`
- On failure: show inline error message
- No public registration — accounts are created by admins only

### User Roles
There are two roles:

| Role | Permissions |
|------|-------------|
| `admin` | Full access + can create/manage employee accounts |
| `employee` | Can manage content (bars, pages, blogs) but cannot manage users |

### Role Assignment Logic
- Role is determined by the email domain or a flag set at account creation
- When an `admin` creates a new account, they choose the role (`admin` or `employee`)
- Employees cannot create other accounts

### Database Table: `users`
```sql
id, name, email, password (hashed), role ENUM('admin','employee'), created_at, updated_at
```

### Seed
Create one default admin account on first run:
- Email: `admin@qadiroon.com`
- Password: `Admin@1234` (force change on first login)

---

## Part 3 — The Navigation Bar (Dynamic Top Bar)

This is the horizontal bar shown on the public site above or below the header. It contains section links like: Sports, News, Blogs, Articles — fully managed from the admin panel.

### Public Behavior
- Renders all active bar items as navigation links
- Each item links to its corresponding page/section
- Order is controlled by admin (drag-to-reorder or order field)

### Admin Management
**Route:** `/admin/navbar`

CRUD interface for bar items:
- `id`, `label` (Arabic text shown to users), `slug` (URL), `order` (integer), `is_active` (boolean), `created_at`

Admins and employees can:
- Add new bar items
- Edit label and slug
- Toggle visibility (active/inactive)
- Reorder items

---

## Part 4 — Pages System

Each bar item can link to a standalone page.

### Database Table: `pages`
```sql
id, title, slug, content (longtext / rich HTML), navbar_item_id (FK, nullable),
meta_description, is_published (boolean), created_by (FK users), created_at, updated_at
```

### Admin Management
**Route:** `/admin/pages`

- List all pages with status badges (published / draft)
- Create / Edit with a rich text editor (use TipTap or Quill)
- Assign page to a navbar item (optional)
- Publish / Unpublish toggle
- Delete with confirmation

---

## Part 5 — Blogs System

Blogs are the main content type. Each blog post lives under a section/category.

### Database Tables

**`blogs`**
```sql
id, title, slug, cover_image, excerpt, body (longtext), category_id (FK),
author_id (FK users), is_published (boolean), published_at, created_at, updated_at
```

**`categories`**
```sql
id, name, slug, description, navbar_item_id (FK, nullable), created_at
```

### Public Behavior
- Blog index: grid of cards (cover image + title + excerpt + date)
- Clicking a card opens the full blog post
- Each blog shows: full body content, category, author name, publish date, "About the blog" section (pulled from category description)

### Admin Management
**Route:** `/admin/blogs`

- List all blogs with filters (by category, status, author)
- Create / Edit blog post:
  - Title, slug (auto-generated from title, editable)
  - Cover image upload
  - Category selector
  - Rich text body editor
  - Excerpt (short summary)
  - "About this blog" section (per category — edit from category settings)
  - Publish / Save as draft
- Delete with confirmation

**Route:** `/admin/categories`
- CRUD for categories
- Each category can be linked to a navbar item

---

## Part 6 — Admin Dashboard Layout

**Route:** `/admin/dashboard`

Sidebar navigation with the following sections:
```
Dashboard (overview stats)
├── Navbar Manager
├── Pages
├── Blogs
│   ├── All Posts
│   └── Categories
└── Users (admin only)
    ├── All Users
    └── Create New User
```

### Dashboard Overview Cards
- Total published blogs
- Total pages
- Total users
- Latest 5 blog posts (quick list)

### Users Section (admin only)
**Route:** `/admin/users`
- List all users with role badges
- Create new user (name, email, password, role)
- Edit user (name, role, reset password)
- Deactivate / Delete user
- Employees do NOT see this section

---

## Part 7 — Access Control (Middleware)

Apply middleware on all `/admin/*` routes:

```
- Unauthenticated → redirect to /admin/login
- Authenticated employee → access all except /admin/users
- Authenticated admin → full access
```

---

## Part 8 — Tech Stack

Use whatever stack the landing page is already built on. If it's a standalone HTML/CSS/JS frontend, implement the backend as:
- **Backend:** Laravel (preferred) or Node.js/Express
- **Database:** PostgreSQL (already running)
- **Auth:** Session-based or JWT stored in httpOnly cookie
- **File uploads:** Store in `/public/uploads/` or S3-compatible storage
- **Rich text editor:** TipTap v2 or Quill.js (CDN import is fine)

If the project already uses a framework, extend it — do not introduce a new one.

---

## Part 9 — Clean Production Folder

After completing all of the above, create a new folder in the project root called:

```
web last ver by khaled
```

Inside this folder, place a clean copy of the entire project with:
- All source files (frontend + backend)
- Config files (`.env.example`, not `.env`)
- Database migration files
- `README.md` with setup instructions

**Exclude:**
- `node_modules/`
- `vendor/`
- `.git/`
- Any test files, debug logs, or temp files
- Any unused/experimental files not part of the final build

This folder should be ready to zip and upload directly to a production server.

---

## Database Summary

All tables use PostgreSQL. Here is the complete schema overview:

```
users           → id, name, email, password, role, created_at
navbar_items    → id, label, slug, order, is_active, created_at
pages           → id, title, slug, content, navbar_item_id, is_published, created_by, created_at
categories      → id, name, slug, description, navbar_item_id, created_at
blogs           → id, title, slug, cover_image, excerpt, body, category_id, author_id, is_published, published_at, created_at
```

Run all migrations in order. Seed the default admin user after migrations.

---

## Important Notes

- All admin UI text can be in English — the public-facing site remains Arabic (RTL)
- The admin panel itself is LTR layout
- Keep the public site completely unaware of the admin system — no shared state, no exposed routes
- All content changes in the admin must reflect immediately on the public site (no cache layer needed for now)
- The `/admin` URL trigger in the header should work silently — no visible link, just navigating to that path routes correctly
