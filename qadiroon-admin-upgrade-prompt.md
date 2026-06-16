# Qadiroon Admin Panel — UI/UX Redesign & Feature Upgrade

## Context

Qadiroon's admin panel (`/admin/dashboard`, running on Vite/React) is currently functional but visually flat: a plain dark sidebar, generic white stat cards, no charts, no icons, no personality. This is a **custom-built CMS** (not WordPress), so every feature below must be implemented natively in the existing codebase — do not suggest installing WordPress plugins.

Two goals for this update:
1. **Visual redesign** of the dashboard to feel like a modern, premium SaaS admin panel.
2. **New functional modules** that give the marketing/content team SEO and content tooling equivalent to what popular WordPress plugins provide (Rank Math, Easy Table of Contents, WPCode, LiteSpeed Cache, AIOS, Contact Form 7) — but built as first-class native features.

Do not restructure or rewrite parts of the app that aren't mentioned here. Keep existing auth, roles, routing, and data models intact unless a task explicitly requires a schema change.

---

## 1. Dashboard visual redesign

Reference direction: a content-dashboard layout with a welcome banner, colorful accent stat cards, and a "top content" list (similar in spirit to creator/publisher dashboards like Ghost, Notion-style admin panels, or article-management SaaS tools) — not a generic gray admin template.

- [ ] Add a **welcome hero card** at the top: greets the logged-in admin by name, short subtitle, and a primary CTA button ("Write new post" / "إضافة مقال جديد") that deep-links to the post editor.
- [ ] Replace the three plain stat cards with **accented metric cards**: each card gets a distinct icon and a light color tint (not all the same purple/white). Each card should show a small trend indicator (sparkline or "+N this week") instead of a static number with nothing else.
- [ ] Add a **circular progress/donut** indicator for "Active Users" (e.g. active vs. total admin seats) instead of a bare number.
- [ ] Replace the empty "Latest Blog Posts" placeholder with a **Top Articles / Recent Posts list**: thumbnail, title, publish date, and at least one engagement metric if available (views, or fallback to status badge: Draft/Published/Scheduled).
- [ ] Add a small **"Recent Activity" feed** card (right column) showing the last few admin actions (login, page edit, new category, etc.) with colored status dots and relative timestamps ("2 hours ago").
- [ ] Sidebar: add a **Tabler icon** next to every nav label (dashboard, navbar manager, landing page, pages, all posts, categories, ad slots, users). Keep the active-item highlight, but soften it (rounded pill background instead of a hard rectangle).
- [ ] Header bar: keep the language toggle (AR/EN) and admin name, but add a notifications bell icon and convert the plain text name into a small avatar + name + role dropdown.
- [ ] Empty states (e.g. "0 published blogs") should never be a bare number with nothing else — pair every empty/zero state with a short helper line and a CTA button, not just a static "0".

## 2. SEO toolkit (replaces the need for Rank Math SEO)

Build a native **SEO panel** attached to every Post and Page editor (sidebar panel inside the editor, collapsible).

- [ ] **Meta title** field with live character counter and a Google-style search snippet preview (title + URL + description, truncated the way Google truncates it).
- [ ] **Meta description** field with character counter and the same live snippet preview.
- [ ] **Focus keyword** field, with a basic on-page checklist that validates: keyword present in title, in meta description, in first paragraph, in at least one heading, and in the slug. Show pass/fail per check, not just a vague "score."
- [ ] **Editable slug** field, decoupled from the auto-generated one, with a warning if changing it on an already-published post (to flag broken-link risk).
- [ ] **Canonical URL** field (optional override).
- [ ] **Open Graph / social preview** fields: OG title, OG description, OG image upload — with a live card preview of how the link looks when shared on WhatsApp/Facebook/Twitter.
- [ ] Auto-generate **JSON-LD schema markup** (Article/BlogPosting type) for every published post using title, author, publish date, and featured image — injected automatically, no manual input needed.
- [ ] Auto-generate and serve `sitemap.xml` (updates whenever a post/page is published or unpublished) and a manageable `robots.txt` editor in admin settings.
- [ ] Add a **breadcrumb component** on the public site (Home > Category > Post Title) with matching breadcrumb schema markup.

## 3. Auto table of contents (replaces Easy Table of Contents)

- [ ] In the post editor, add a toggle: "Show table of contents" (on by default for posts over a configurable word count, e.g. 300 words).
- [ ] When enabled, auto-generate a TOC from the post's H2/H3 headings, render it as a collapsible box at the top of the published post, with anchor-linked smooth scrolling to each heading.
- [ ] Each heading should get an auto-generated, readable anchor id (slugified from heading text), and the TOC must stay correct if headings are reordered/edited.

## 4. Custom code snippets manager (replaces WPCode Lite)

- [ ] New admin section: "Code Snippets." Lets an admin add custom HTML/JS/CSS snippets without touching the codebase — e.g. Google Analytics, Meta Pixel, Search Console verification meta tag, custom widget scripts.
- [ ] Each snippet has: a name, a type (head / body-start / body-end), the code itself, an enabled/disabled toggle, and an optional scope (all pages vs. specific page/post).
- [ ] Snippets should be sanitized/sandboxed enough to avoid an admin accidentally breaking the whole site layout (e.g. wrap in error boundaries where feasible).

## 5. Performance settings (replaces LiteSpeed Cache)

- [ ] New "Performance" settings page in admin with: page-cache TTL control, a manual "clear cache" button, and a toggle for asset minification (CSS/JS) at build/deploy time.
- [ ] Enable lazy-loading by default for all images rendered from the CMS (`loading="lazy"`), plus automatic WebP/AVIF conversion on upload with a fallback for unsupported browsers.
- [ ] Add a CDN base-URL field in settings so uploaded media can be served from a CDN without code changes.

## 6. Security module (replaces All-In-One Security)

- [ ] Add login rate-limiting: lock an account (or IP) after N failed login attempts within a time window, with a clear "try again in X minutes" message.
- [ ] Add optional **2FA** (TOTP-based, e.g. Google Authenticator-compatible) for admin/super-admin roles.
- [ ] Add an **activity/audit log** admin page: who logged in, who published/edited/deleted what, and when — filterable by user and date.
- [ ] Set standard security response headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy) at the server/proxy level.
- [ ] Mask/obscure the admin login route from generic bots where feasible (custom login path or basic bot-challenge), without breaking existing bookmarks/links for current admins — flag this one for discussion before implementing if it risks locking anyone out.

## 7. Forms builder (replaces Contact Form 7)

- [ ] New "Forms" admin section: build custom forms from a field palette (text, email, phone, textarea, select, checkbox, file upload) without writing code.
- [ ] Each form gets a unique embed reference that can be dropped into any Page or Landing Page section.
- [ ] Submissions land in an admin "Inbox" list (sortable by date, marked read/unread, exportable to CSV).
- [ ] Email notification to the admin on new submission, plus an optional auto-reply email to the submitter.
- [ ] Basic spam protection: honeypot field at minimum; reCAPTCHA/hCaptcha as a configurable option.

## 8. Content writer experience

- [ ] Live word count and estimated reading time shown while writing a post.
- [ ] Autosave drafts every ~30 seconds with a visible "Saved" / "Saving..." indicator.
- [ ] Lightweight revision history per post (at least last 5 versions, with a way to view/restore).
- [ ] Require a featured image and alt text before a post can be published (validation, not just a suggestion).
- [ ] Improve category/tag assignment: allow creating a new tag inline while writing, instead of needing to leave the editor.
- [ ] Surface the SEO checklist (section 2) directly beside the editor, not buried in a separate tab — writers should see SEO status while writing, not after.

---

## Hard rules

- Do not touch or restructure the existing Navbar Manager, Landing Page builder, or Ad Slots modules beyond what's needed to host the new SEO/snippet fields — these are out of scope for restructuring.
- Every new admin screen must respect the existing role/permission system (Super Admin vs. other roles) — do not introduce a parallel permission model.
- Every new admin screen must support both Arabic and English via the existing language toggle, including RTL layout for Arabic.
- No new feature should require a WordPress plugin, WordPress core, or any WP-specific package — everything must be native to the current stack.
- Keep all new UI consistent with the existing flat, clean visual language described in section 1 — no heavy gradients, no clutter, no more than 2-3 accent colors total across the dashboard.

## Out of scope for this pass

- A full Elementor-style drag-and-drop visual page builder. The "Landing Page" and "Pages" sections already exist; a true drag/drop builder is a larger, separate initiative and should be scoped on its own later.
- Any migration toward WordPress. Qadiroon stays a custom CMS.

## Acceptance checklist

- [ ] Dashboard redesigned per section 1, no broken layout on mobile widths.
- [ ] SEO panel live on both Post and Page editors.
- [ ] Auto TOC working on at least one long test post.
- [ ] Code snippets manager can inject a test script and it actually loads on the front end.
- [ ] Cache-clear button and lazy-loading verified on at least one page.
- [ ] Login lockout triggers correctly after N failed attempts; 2FA optional toggle works for at least one admin account.
- [ ] A test form can be built, embedded, and a submission appears in the Inbox with an email notification received.
- [ ] Writer-facing word count, autosave, and SEO checklist are visible side-by-side in the editor.
