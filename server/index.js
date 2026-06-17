import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { initDb, db } from "./db.js";
import { signToken, requireAuth, requireAdmin } from "./middleware/auth.js";
import bcrypt from "bcryptjs";
import multer from "multer";
import fs from "fs";
import { verifySync } from "otplib";
import { logAudit } from "./audit.js";
import { securityHeaders, getClientIp, isLockedOut, recordLoginAttempt } from "./security.js";
import { registerUpgradeRoutes } from "./routes/upgrade.js";
import { registerPm2Routes } from "./routes/pm2-logs.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

initDb();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(securityHeaders);
app.use("/uploads", express.static(uploadsDir));

// Serve built Vite frontend in production
const distDir = path.join(__dirname, "..", "dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  // SPA fallback: serve index.html for any non-API route
  app.get(/^\/(?!api\/|uploads\/|sitemap\.xml|robots\.txt).*/, (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

const upload = multer({ dest: uploadsDir });

// ── Auth ──
app.post("/api/auth/login", (req, res) => {
  const { email, password, totpCode } = req.body;
  const ip = getClientIp(req);
  const lockedMins = isLockedOut(email, ip);
  if (lockedMins) {
    return res.status(429).json({ error: `Try again in ${lockedMins} minutes` });
  }
  const user = db
    .prepare("SELECT * FROM users WHERE email = ? AND is_active = 1")
    .get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    recordLoginAttempt(email, ip, false);
    return res.status(401).json({ error: "Invalid email or password" });
  }
  if (user.totp_enabled) {
    if (!totpCode) {
      return res.json({ requires2fa: true });
    }
    if (!verifySync({ token: totpCode, secret: user.totp_secret })) {
      recordLoginAttempt(email, ip, false);
      return res.status(401).json({ error: "Invalid 2FA code" });
    }
  }
  recordLoginAttempt(email, ip, true);
  const token = signToken(user);
  res.cookie("qadiroon_token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  logAudit({ id: user.id, name: user.name }, "login");
  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie("qadiroon_token");
  res.json({ ok: true });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// ── Public ──
app.get("/api/public/navbar", (_req, res) => {
  const items = db
    .prepare(
      "SELECT id, label, slug, sort_order FROM navbar_items WHERE is_active = 1 ORDER BY sort_order ASC",
    )
    .all();
  res.json(items);
});

app.get("/api/public/ads", (_req, res) => {
  const ads = db
    .prepare(
      `SELECT slot_code, label, image_url, link_url, width, height
       FROM ad_slots
       WHERE is_active = 1 AND (expires_at IS NULL OR expires_at > datetime('now'))`,
    )
    .all();
  res.json(ads);
});

app.get("/api/public/pages/:slug", (req, res) => {
  const page = db
    .prepare("SELECT * FROM pages WHERE slug = ? AND is_published = 1")
    .get(req.params.slug);
  if (!page) return res.status(404).json({ error: "Not found" });
  res.json(page);
});

app.get("/api/public/blogs", (_req, res) => {
  const { offset, limit } = _req.query;
  const blogs = db
    .prepare(
      `SELECT b.id, b.title, b.slug, b.cover_image, b.excerpt, b.published_at, b.view_count,
              c.name as category_name, c.slug as category_slug, u.name as author_name
       FROM blogs b
       LEFT JOIN categories c ON c.id = b.category_id
       LEFT JOIN users u ON u.id = b.author_id
       WHERE b.is_published = 1
       ORDER BY b.published_at DESC
       LIMIT ? OFFSET ?`,
    )
    .all(+(limit || 12), +(offset || 0));
  res.json(blogs);
});

app.get("/api/public/blogs/:slug", (req, res) => {
  const blog = db
    .prepare(
      `SELECT b.*, c.name as category_name, c.slug as category_slug, c.description as category_description,
              u.name as author_name
       FROM blogs b
       LEFT JOIN categories c ON c.id = b.category_id
       LEFT JOIN users u ON u.id = b.author_id
       WHERE b.slug = ? AND b.is_published = 1`,
    )
    .get(req.params.slug);
  if (!blog) return res.status(404).json({ error: "Not found" });
  db.prepare("UPDATE blogs SET view_count = view_count + 1 WHERE id = ?").run(blog.id);
  const tags = db
    .prepare(
      `SELECT t.name FROM tags t JOIN blog_tags bt ON bt.tag_id = t.id WHERE bt.blog_id = ?`,
    )
    .all(blog.id)
    .map((t) => t.name);
  res.json({ ...blog, view_count: (blog.view_count || 0) + 1, tags });
});

app.get("/api/public/landing", (_req, res) => {
  const row = db.prepare("SELECT data FROM landing_content WHERE id = 1").get();
  if (!row) return res.json({});
  try {
    res.json(JSON.parse(row.data));
  } catch {
    res.json({});
  }
});

// ── Public categories ──
app.get("/api/public/categories", (_req, res) => {
  const cats = db.prepare("SELECT id, name, slug, description, image_url FROM categories ORDER BY name ASC").all();
  res.json(cats);
});

app.get("/api/public/categories/:slug", (req, res) => {
  const cat = db.prepare("SELECT id, name, slug, description, image_url FROM categories WHERE slug = ?").get(req.params.slug);
  if (!cat) return res.status(404).json({ error: "Category not found" });
  const { offset, limit } = req.query;
  const posts = db
    .prepare(
      `SELECT b.id, b.title, b.slug, b.cover_image, b.excerpt, b.published_at, b.view_count,
              c.name as category_name, c.slug as category_slug, u.name as author_name
       FROM blogs b
       LEFT JOIN categories c ON c.id = b.category_id
       LEFT JOIN users u ON u.id = b.author_id
       WHERE b.category_id = ? AND b.is_published = 1
       ORDER BY b.published_at DESC
       LIMIT ? OFFSET ?`,
    )
    .all(cat.id, +(limit || 12), +(offset || 0));
  res.json({ category: cat, posts });
});

// ── Dashboard stats (enhanced in upgrade routes) ──

const upgradeHelpers = registerUpgradeRoutes(app, db, { requireAuth, requireAdmin });
const { blogFields, pageFields, saveBlogRevision, syncBlogTags } = upgradeHelpers;

// ── PM2 Logs ──
registerPm2Routes(app, { requireAuth });

// ── Navbar CRUD ──
app.get("/api/admin/navbar", requireAuth, (_req, res) => {
  res.json(
    db
      .prepare(
        `SELECT n.*, p.id as page_id, p.title as page_title
         FROM navbar_items n
         LEFT JOIN pages p ON p.navbar_item_id = n.id
         ORDER BY n.sort_order ASC`,
      )
      .all(),
  );
});

app.post("/api/admin/navbar", requireAuth, (req, res) => {
  const { label, slug, sort_order = 0, is_active = 1 } = req.body;
  const r = db
    .prepare(
      "INSERT INTO navbar_items (label, slug, sort_order, is_active) VALUES (?, ?, ?, ?)",
    )
    .run(label, slug, sort_order, is_active ? 1 : 0);
  res.json({ id: r.lastInsertRowid });
});

app.put("/api/admin/navbar/:id", requireAuth, (req, res) => {
  const { label, slug, sort_order, is_active } = req.body;
  db.prepare(
    "UPDATE navbar_items SET label=?, slug=?, sort_order=?, is_active=? WHERE id=?",
  ).run(label, slug, sort_order, is_active ? 1 : 0, req.params.id);
  res.json({ ok: true });
});

app.patch("/api/admin/navbar/:id/toggle", requireAuth, (req, res) => {
  const item = db
    .prepare("SELECT is_active FROM navbar_items WHERE id = ?")
    .get(req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  const next = item.is_active ? 0 : 1;
  db.prepare("UPDATE navbar_items SET is_active = ? WHERE id = ?").run(
    next,
    req.params.id,
  );
  res.json({ is_active: next });
});

app.delete("/api/admin/navbar/:id", requireAuth, (req, res) => {
  db.prepare("DELETE FROM navbar_items WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// ── Pages CRUD ──
app.get("/api/admin/pages", requireAuth, (_req, res) => {
  res.json(db.prepare("SELECT * FROM pages ORDER BY updated_at DESC").all());
});

app.get("/api/admin/pages/:id", requireAuth, (req, res) => {
  const page = db.prepare("SELECT * FROM pages WHERE id = ?").get(req.params.id);
  if (!page) return res.status(404).json({ error: "Not found" });
  res.json(page);
});

app.get("/api/admin/pages/by-navbar/:navbarItemId", requireAuth, (req, res) => {
  const page = db
    .prepare("SELECT * FROM pages WHERE navbar_item_id = ?")
    .get(req.params.navbarItemId);
  if (!page) return res.status(404).json({ error: "Not found" });
  res.json(page);
});

app.post("/api/admin/pages", requireAuth, (req, res) => {
  const f = pageFields(req.body);
  // Check for duplicate slug before inserting
  const existing = db.prepare("SELECT id FROM pages WHERE slug = ?").get(f.slug);
  if (existing) {
    return res.status(409).json({ error: "A page with this slug already exists." });
  }
  try {
    const r = db
      .prepare(
        `INSERT INTO pages (title, slug, content, navbar_item_id, meta_description, meta_title, focus_keyword, canonical_url, og_title, og_description, og_image, is_published, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(f.title, f.slug, f.content, f.navbar_item_id, f.meta_description, f.meta_title, f.focus_keyword, f.canonical_url, f.og_title, f.og_description, f.og_image, f.is_published, req.user.id);
    logAudit(req.user, "page_created", "page", r.lastInsertRowid, { title: f.title });
    res.json({ id: r.lastInsertRowid });
  } catch (err) {
    if (err.message?.includes("UNIQUE constraint failed")) {
      return res.status(409).json({ error: "A page with this slug already exists." });
    }
    throw err;
  }
});

app.put("/api/admin/pages/:id", requireAuth, (req, res) => {
  const f = pageFields(req.body);
  // Check for duplicate slug (exclude current page)
  const existing = db.prepare("SELECT id FROM pages WHERE slug = ? AND id != ?").get(f.slug, req.params.id);
  if (existing) {
    return res.status(409).json({ error: "Another page already uses this slug." });
  }
  try {
    db.prepare(
      `UPDATE pages SET title=?, slug=?, content=?, navbar_item_id=?, meta_description=?, meta_title=?, focus_keyword=?, canonical_url=?, og_title=?, og_description=?, og_image=?, is_published=?, updated_at=datetime('now') WHERE id=?`,
    ).run(f.title, f.slug, f.content, f.navbar_item_id, f.meta_description, f.meta_title, f.focus_keyword, f.canonical_url, f.og_title, f.og_description, f.og_image, f.is_published, req.params.id);
    logAudit(req.user, "page_updated", "page", +req.params.id, { title: f.title });
    res.json({ ok: true });
  } catch (err) {
    if (err.message?.includes("UNIQUE constraint failed")) {
      return res.status(409).json({ error: "Another page already uses this slug." });
    }
    throw err;
  }
});

app.delete("/api/admin/pages/:id", requireAuth, (req, res) => {
  db.prepare("DELETE FROM pages WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// ── Categories CRUD ──
app.get("/api/admin/categories", requireAuth, (_req, res) => {
  res.json(db.prepare("SELECT * FROM categories ORDER BY name ASC").all());
});

app.post("/api/admin/categories", requireAuth, (req, res) => {
  const { name, slug, description, image_url, navbar_item_id } = req.body;
  const r = db
    .prepare(
      "INSERT INTO categories (name, slug, description, image_url, navbar_item_id) VALUES (?, ?, ?, ?, ?)",
    )
    .run(name, slug, description || "", image_url || "", navbar_item_id || null);
  logAudit(req.user, "category_created", "category", r.lastInsertRowid);
  res.json({ id: r.lastInsertRowid });
});

app.put("/api/admin/categories/:id", requireAuth, (req, res) => {
  const { name, slug, description, image_url, navbar_item_id } = req.body;
  db.prepare(
    "UPDATE categories SET name=?, slug=?, description=?, image_url=?, navbar_item_id=? WHERE id=?",
  ).run(name, slug, description || "", image_url || "", navbar_item_id || null, req.params.id);
  res.json({ ok: true });
});

app.delete("/api/admin/categories/:id", requireAuth, (req, res) => {
  db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// ── Blogs CRUD ──
app.get("/api/admin/blogs", requireAuth, (_req, res) => {
  res.json(
    db
      .prepare(
        `SELECT b.*, c.name as category_name, u.name as author_name
         FROM blogs b LEFT JOIN categories c ON c.id = b.category_id
         LEFT JOIN users u ON u.id = b.author_id ORDER BY b.created_at DESC`,
      )
      .all(),
  );
});

app.post("/api/admin/blogs", requireAuth, (req, res) => {
  const f = blogFields(req.body);
  if (f.is_published && (!f.cover_image || !f.cover_image_alt)) {
    return res.status(400).json({ error: "Featured image and alt text required to publish" });
  }
  // Check for duplicate slug
  const existingSlug = db.prepare("SELECT id FROM blogs WHERE slug = ?").get(f.slug);
  if (existingSlug) {
    return res.status(409).json({ error: "A blog with this slug already exists." });
  }
  try {
    const published_at = f.is_published ? new Date().toISOString() : null;
    const r = db
      .prepare(
        `INSERT INTO blogs (title, slug, cover_image, cover_image_alt, excerpt, body, category_id, author_id, is_published, published_at, meta_title, meta_description, focus_keyword, canonical_url, og_title, og_description, og_image, show_toc, toc_min_words)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(f.title, f.slug, f.cover_image, f.cover_image_alt, f.excerpt, f.body, f.category_id, req.user.id, f.is_published, published_at, f.meta_title, f.meta_description, f.focus_keyword, f.canonical_url, f.og_title, f.og_description, f.og_image, f.show_toc, f.toc_min_words);
    syncBlogTags(db, r.lastInsertRowid, req.body.tags || []);
    saveBlogRevision(db, r.lastInsertRowid, { ...f, tags: req.body.tags }, req.user.id);
    logAudit(req.user, "blog_created", "blog", r.lastInsertRowid, { title: f.title });
    res.json({ id: r.lastInsertRowid });
  } catch (err) {
    if (err.message?.includes("UNIQUE constraint failed")) {
      return res.status(409).json({ error: "A blog with this slug already exists." });
    }
    throw err;
  }
});

app.put("/api/admin/blogs/:id", requireAuth, (req, res) => {
  const f = blogFields(req.body);
  if (f.is_published && (!f.cover_image || !f.cover_image_alt)) {
    return res.status(400).json({ error: "Featured image and alt text required to publish" });
  }
  const existing = db.prepare("SELECT is_published, slug FROM blogs WHERE id = ?").get(req.params.id);
  let published_at = null;
  if (f.is_published) {
    published_at = existing?.is_published ? undefined : new Date().toISOString();
  }
  const sql = published_at !== undefined
    ? `UPDATE blogs SET title=?, slug=?, cover_image=?, cover_image_alt=?, excerpt=?, body=?, category_id=?, is_published=?, published_at=COALESCE(published_at, ?), meta_title=?, meta_description=?, focus_keyword=?, canonical_url=?, og_title=?, og_description=?, og_image=?, show_toc=?, toc_min_words=?, updated_at=datetime('now') WHERE id=?`
    : `UPDATE blogs SET title=?, slug=?, cover_image=?, cover_image_alt=?, excerpt=?, body=?, category_id=?, is_published=?, published_at=NULL, meta_title=?, meta_description=?, focus_keyword=?, canonical_url=?, og_title=?, og_description=?, og_image=?, show_toc=?, toc_min_words=?, updated_at=datetime('now') WHERE id=?`;
  const params = published_at !== undefined
    ? [f.title, f.slug, f.cover_image, f.cover_image_alt, f.excerpt, f.body, f.category_id, f.is_published, published_at, f.meta_title, f.meta_description, f.focus_keyword, f.canonical_url, f.og_title, f.og_description, f.og_image, f.show_toc, f.toc_min_words, req.params.id]
    : [f.title, f.slug, f.cover_image, f.cover_image_alt, f.excerpt, f.body, f.category_id, 0, f.meta_title, f.meta_description, f.focus_keyword, f.canonical_url, f.og_title, f.og_description, f.og_image, f.show_toc, f.toc_min_words, req.params.id];
  db.prepare(sql).run(...params);
  syncBlogTags(db, +req.params.id, req.body.tags || []);
  saveBlogRevision(db, +req.params.id, { ...f, tags: req.body.tags }, req.user.id);
  logAudit(req.user, "blog_updated", "blog", +req.params.id, { title: f.title, slugChanged: existing?.slug !== f.slug });
  res.json({ ok: true });
});

app.delete("/api/admin/blogs/:id", requireAuth, (req, res) => {
  db.prepare("DELETE FROM blogs WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// ── Users CRUD (admin only) ──
app.get("/api/admin/users", requireAuth, requireAdmin, (_req, res) => {
  res.json(
    db.prepare("SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC").all(),
  );
});

app.post("/api/admin/users", requireAuth, requireAdmin, (req, res) => {
  const { name, email, password, role } = req.body;
  const hash = bcrypt.hashSync(password, 10);
  const r = db
    .prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)")
    .run(name, email, hash, role);
  res.json({ id: r.lastInsertRowid });
});

app.put("/api/admin/users/:id", requireAuth, requireAdmin, (req, res) => {
  const { name, role, password, is_active } = req.body;
  if (password) {
    const hash = bcrypt.hashSync(password, 10);
    db.prepare("UPDATE users SET name=?, role=?, password=?, is_active=?, updated_at=datetime('now') WHERE id=?")
      .run(name, role, hash, is_active ? 1 : 0, req.params.id);
  } else {
    db.prepare("UPDATE users SET name=?, role=?, is_active=?, updated_at=datetime('now') WHERE id=?")
      .run(name, role, is_active ? 1 : 0, req.params.id);
  }
  res.json({ ok: true });
});

app.delete("/api/admin/users/:id", requireAuth, requireAdmin, (req, res) => {
  db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// ── Ad slots CRUD ──
app.get("/api/admin/ads", requireAuth, (_req, res) => {
  res.json(db.prepare("SELECT * FROM ad_slots ORDER BY slot_code ASC").all());
});

app.post("/api/admin/ads", requireAuth, (req, res) => {
  const { slot_code, label, image_url, link_url, width, height, sort_order, is_active, expires_at } = req.body;
  const r = db.prepare(
    `INSERT INTO ad_slots (slot_code, label, image_url, link_url, width, height, sort_order, is_active, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(slot_code, label || "", image_url || "", link_url || "", width || 300, height || 250, sort_order ?? 0, is_active ? 1 : 0, expires_at || null);
  logAudit(req.user, "ad_created", "ad", r.lastInsertRowid);
  res.json({ id: r.lastInsertRowid });
});

app.put("/api/admin/ads/:id", requireAuth, (req, res) => {
  const { label, image_url, link_url, width, height, sort_order, is_active, expires_at } = req.body;
  db.prepare(
    `UPDATE ad_slots SET label=?, image_url=?, link_url=?, width=?, height=?, sort_order=?, is_active=?, expires_at=?, updated_at=datetime('now') WHERE id=?`,
  ).run(label || "", image_url || "", link_url || "", width || 300, height || 250, sort_order ?? 0, is_active ? 1 : 0, expires_at || null, req.params.id);
  logAudit(req.user, "ad_updated", "ad", +req.params.id);
  res.json({ ok: true });
});

app.delete("/api/admin/ads/:id", requireAuth, (req, res) => {
  db.prepare("DELETE FROM ad_slots WHERE id = ?").run(req.params.id);
  logAudit(req.user, "ad_deleted", "ad", +req.params.id);
  res.json({ ok: true });
});

app.post("/api/admin/upload", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// ── Landing content ──
app.get("/api/admin/landing", requireAuth, (_req, res) => {
  const row = db.prepare("SELECT data FROM landing_content WHERE id = 1").get();
  if (!row) return res.json({});
  try {
    res.json(JSON.parse(row.data));
  } catch {
    res.json({});
  }
});

app.put("/api/admin/landing", requireAuth, (req, res) => {
  const data = JSON.stringify(req.body);
  const existing = db.prepare("SELECT id FROM landing_content WHERE id = 1").get();
  if (existing) {
    db.prepare(
      "UPDATE landing_content SET data = ?, updated_at = datetime('now') WHERE id = 1",
    ).run(data);
  } else {
    db.prepare("INSERT INTO landing_content (id, data) VALUES (1, ?)").run(data);
  }
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Qadiroon API running on http://localhost:${PORT}`);
});
