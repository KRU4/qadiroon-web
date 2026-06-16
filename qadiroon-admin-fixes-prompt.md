# Qadiroon Admin — Fixes & Enhancements Prompt for Cursor

## Context
The admin panel is already built and working. The following are targeted fixes and feature additions based on current issues. Do NOT rebuild anything from scratch — patch and extend only.

---

## Fix 1 — Navbar Toggle Not Persisting

**Problem:** Clicking "Toggle" on a navbar item does not save to the database. The active status reverts on page reload.

**Fix:**
- The Toggle button must send a `PATCH` or `PUT` request to the backend (e.g. `/api/admin/navbar/:id/toggle`) that flips the `is_active` boolean in the database
- After the request succeeds, update the UI state locally (re-fetch or optimistic update)
- If the request fails, show an error message and revert the UI
- Verify the backend route exists and is correctly updating the `is_active` column in the `navbar_items` table
- Check that the frontend is actually awaiting the response before updating state

---

## Fix 2 — Navbar Manager: Inline Page Creation & Edit

**Problem:** Creating a page is in a separate "Pages" section. It should be possible to create and edit the page linked to a navbar item directly from the Navbar Manager.

**Change:**
- In the Navbar Manager table, add a new column: **"Page"**
- Each navbar item row shows one of:
  - A **"Create Page"** button (if no page is linked yet) → opens an inline panel or modal below the row
  - A **"Edit Page"** button (if a page already exists) → opens the same panel pre-filled with existing content
- The inline panel contains the full page editor (see Fix 3 below for editor spec)
- After saving, the button switches from "Create Page" to "Edit Page"
- Pages section in the sidebar can remain as a separate full list view, but the primary workflow is now from Navbar Manager

---

## Fix 3 — Page Editor: Load Existing Data + Rich Text Editor

### 3a — Load Existing Data
**Problem:** When navigating to an existing page to edit it, the fields are empty.

**Fix:**
- On mount, fetch the page data by ID from the backend (`GET /api/admin/pages/:id`)
- Pre-populate all fields: Title, Slug, content, Published status
- The "Create Page" button should change to "Update Page" when editing an existing record

### 3b — Editor Mode Toggle
Replace the plain HTML textarea with a **dual-mode editor**:

**Mode 1: Visual Editor (default)**
- Use **TipTap v2** or **Quill.js** (whichever is already in the project, or add via CDN)
- Should feel like WordPress — toolbar with: Bold, Italic, Underline, Headings (H1/H2/H3), Bullet list, Numbered list, Link, Image upload, Blockquote, Align (left/center/right)
- Output is stored as HTML in the database (same field, no change to schema)
- This is the DEFAULT mode for all users

**Mode 2: Raw HTML**
- A toggle switch/button labeled **"HTML Mode"** above the editor
- When clicked, switches to a plain `<textarea>` showing the raw HTML
- When switched back to Visual, the HTML is parsed back into the editor
- This mode is for advanced users only

**UI for the toggle:**
```
[ Visual ● ]  [ HTML ]     ← toggle switch style, above the editor
```

---

## Fix 4 — Language Toggle (Arabic / English UI)

Add a language switcher to the admin panel UI. This controls the **admin interface language only** — not the public site content.

**Placement:** Top-right of the admin header bar, next to the logged-in user name

**Options:**
- 🇸🇦 العربية
- 🇬🇧 English

**Behavior:**
- Default: English (current state)
- When Arabic is selected:
  - All sidebar labels, button text, table headers, form labels, and page titles switch to Arabic
  - The admin layout switches to RTL (`dir="rtl"`)
  - The selected language is saved in `localStorage` so it persists across sessions
- When English is selected: LTR layout, English labels (current behavior)

**Arabic translations needed for:**
```
Dashboard          → لوحة التحكم
Navbar Manager     → إدارة شريط التنقل
Pages              → الصفحات
All Posts          → كل المقالات
Categories         → التصنيفات
Ad Slots           → مواضع الإعلانات
Users              → المستخدمون
Logout             → تسجيل الخروج
Add                → إضافة
Toggle             → تفعيل/إيقاف
Delete             → حذف
Edit               → تعديل
Create Page        → إنشاء صفحة
Update Page        → تحديث الصفحة
Published          → منشور
Draft              → مسودة
Title              → العنوان
Slug / URL         → الرابط
Label (Arabic)     → التسمية
Order              → الترتيب
Active             → نشط
HTML Content       → محتوى HTML
Visual             → محرر مرئي
HTML Mode          → وضع HTML
Save               → حفظ
Cancel             → إلغاء
Create New         → إنشاء جديد
```

---

## Fix 5 — Landing Page Section in Admin

Add a new section to the admin sidebar called **"Landing Page"** (or "الصفحة الرئيسية" in Arabic mode).

**Sidebar position:** Between "Navbar Manager" and "Pages"

**Route:** `/admin/landing`

**What it controls:**

### 5a — Hero Section
Fields:
- Hero title (Arabic text shown on the TV mockup or main heading)
- Hero subtitle / tagline
- Stats row: 3 editable stat blocks (number + label each)
  - e.g. `+500` / `خبر شهرياً`
- Breaking news ticker: a text area where admin types headlines separated by `|` — these feed the ticker on the public hero

### 5b — Featured Sections
A list of "spotlight" items shown below the hero on the landing page:
- Image, Title, Description, Link
- Add / Edit / Delete / Reorder

### 5c — About Section
- Editable "About Qadiroon" block (rich text, same editor as pages)
- Shown at the bottom of the landing page

**All changes here must reflect immediately on the public landing page — pull from the database, no hardcoded content.**

---

## Summary of Changes

| # | Area | Type |
|---|------|------|
| 1 | Navbar Toggle | Bug fix — persist to DB |
| 2 | Navbar → Inline Page Editor | New feature |
| 3a | Page Editor → Pre-load data | Bug fix |
| 3b | Page Editor → Visual + HTML mode | New feature |
| 4 | Arabic / English UI toggle | New feature |
| 5 | Landing Page admin section | New feature |

---

## Important Notes

- Do not change the database schema unless required for a new feature
- The visual editor (TipTap/Quill) output must be valid HTML stored in the existing `content` column
- All API calls must include auth headers/cookies — do not remove auth middleware from any route
- Test toggle fix by reloading the page after toggling — the state must survive a full page reload
