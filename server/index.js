import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { initDb, query } from "./db.js";
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
  app.get(/^\/(?!api\/|uploads\/|sitemap\.xml|robots\.txt).*/, (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

const upload = multer({ dest: uploadsDir });

// ── Auth ──
app.post("/api/auth/login", async (req, res) => {
  const { email, password, totpCode } = req.body;
  const ip = getClientIp(req);
  const lockedMins = await isLockedOut(email, ip);
  if (lockedMins) {
    return res.status(429).json({ error: `Try again in ${lockedMins} minutes` });
  }
  const user = (await query(
    "SELECT * FROM users WHERE email = $1 AND is_active = 1",
    [email],
  )).rows[0];
  if (!user || !bcrypt.compareSync(password, user.password)) {
    await recordLoginAttempt(email, ip, false);
    return res.status(401).json({ error: "Invalid email or password" });
  }
  if (user.totp_enabled) {
    if (!totpCode) return res.json({ requires2fa: true });
    if (!verifySync({ token: totpCode, secret: user.totp_secret })) {
      await recordLoginAttempt(email, ip, false);
      return res.status(401).json({ error: "Invalid 2FA code" });
    }
  }
  await recordLoginAttempt(email, ip, true);
  const token = signToken(user);
  res.cookie("qadiroon_token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  await logAudit({ id: user.id, name: user.name }, "login");
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
app.get("/api/public/navbar", async (_req, res) => {
  const items = (await query(
    "SELECT id, label, slug, sort_order FROM navbar_items WHERE is_active = 1 ORDER BY sort_order ASC",
  )).rows;
  res.json(items);
});

app.get("/api/public/ads", async (_req, res) => {
  const ads = (await query(
    `SELECT slot_code, label, image_url, link_url, width, height
     FROM ad_slots
     WHERE is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())`,
  )).rows;
  res.json(ads);
});

app.get("/api/public/pages/:slug", async (req, res) => {
  const page = (await query(
    "SELECT * FROM pages WHERE slug = $1 AND is_published = 1",
    [req.params.slug],
  )).rows[0];
  if (!page) return res.status(404).json({ error: "Not found" });
  res.json(page);
});

app.get("/api/public/blogs", async (req, res) => {
  const { offset, limit } = req.query;
  const blogs = (await query(
    `SELECT b.id, b.title, b.slug, b.cover_image, b.excerpt, b.published_at, b.view_count,
            c.name as category_name, c.slug as category_slug, u.name as author_name
     FROM blogs b
     LEFT JOIN categories c ON c.id = b.category_id
     LEFT JOIN users u ON u.id = b.author_id
     WHERE b.is_published = 1
     ORDER BY b.published_at DESC
     LIMIT $1 OFFSET $2`,
    [limit || 12, offset || 0],
  )).rows;
  res.json(blogs);
});

app.get("/api/public/blogs/:slug", async (req, res) => {
  const blog = (await query(
    `SELECT b.*, c.name as category_name, c.slug as category_slug, c.description as category_description,
            u.name as author_name
     FROM blogs b
     LEFT JOIN categories c ON c.id = b.category_id
     LEFT JOIN users u ON u.id = b.author_id
     WHERE b.slug = $1 AND b.is_published = 1`,
    [req.params.slug],
  )).rows[0];
  if (!blog) return res.status(404).json({ error: "Not found" });
  await query("UPDATE blogs SET view_count = view_count + 1 WHERE id = $1", [blog.id]);
  const tags = (await query(
    `SELECT t.name FROM tags t JOIN blog_tags bt ON bt.tag_id = t.id WHERE bt.blog_id = $1`,
    [blog.id],
  )).rows.map((t) => t.name);
  res.json({ ...blog, view_count: (blog.view_count || 0) + 1, tags });
});

app.get("/api/public/landing", async (_req, res) => {
  const row = (await query("SELECT data FROM landing_content WHERE id = 1")).rows[0];
  if (!row) return res.json({});
  try { res.json(JSON.parse(row.data)); } catch { res.json({}); }
});

// ── Public categories ──
app.get("/api/public/categories", async (_req, res) => {
  const cats = (await query("SELECT id, name, slug, description, image_url FROM categories ORDER BY name ASC")).rows;
  res.json(cats);
});

app.get("/api/public/categories/:slug", async (req, res) => {
  const cat = (await query("SELECT id, name, slug, description, image_url FROM categories WHERE slug = $1", [req.params.slug])).rows[0];
  if (!cat) return res.status(404).json({ error: "Category not found" });
  const { offset, limit } = req.query;
  const posts = (await query(
    `SELECT b.id, b.title, b.slug, b.cover_image, b.excerpt, b.published_at, b.view_count,
            c.name as category_name, c.slug as category_slug, u.name as author_name
     FROM blogs b
     LEFT JOIN categories c ON c.id = b.category_id
     LEFT JOIN users u ON u.id = b.author_id
     WHERE b.category_id = $1 AND b.is_published = 1
     ORDER BY b.published_at DESC
     LIMIT $2 OFFSET $3`,
    [cat.id, limit || 12, offset || 0],
  )).rows;
  res.json({ category: cat, posts });
});

// ── Dashboard stats ──
const upgradeHelpers = registerUpgradeRoutes(app, { requireAuth, requireAdmin });
const { blogFields, pageFields, saveBlogRevision, syncBlogTags } = upgradeHelpers;

// ── PM2 Logs ──
registerPm2Routes(app, { requireAuth });

// ── Navbar CRUD ──
app.get("/api/admin/navbar", requireAuth, async (_req, res) => {
  res.json((await query(
    `SELECT n.*, p.id as page_id, p.title as page_title
     FROM navbar_items n
     LEFT JOIN pages p ON p.navbar_item_id = n.id
     ORDER BY n.sort_order ASC`,
  )).rows);
});

app.post("/api/admin/navbar", requireAuth, async (req, res) => {
  const { label, slug, sort_order = 0, is_active = 1 } = req.body;
  const r = (await query(
    "INSERT INTO navbar_items (label, slug, sort_order, is_active) VALUES ($1, $2, $3, $4) RETURNING id",
    [label, slug, sort_order, is_active ? 1 : 0],
  )).rows[0];
  res.json({ id: r.id });
});

app.put("/api/admin/navbar/:id", requireAuth, async (req, res) => {
  const { label, slug, sort_order, is_active } = req.body;
  await query(
    "UPDATE navbar_items SET label=$1, slug=$2, sort_order=$3, is_active=$4 WHERE id=$5",
    [label, slug, sort_order, is_active ? 1 : 0, req.params.id],
  );
  res.json({ ok: true });
});

app.patch("/api/admin/navbar/:id/toggle", requireAuth, async (req, res) => {
  const item = (await query("SELECT is_active FROM navbar_items WHERE id = $1", [req.params.id])).rows[0];
  if (!item) return res.status(404).json({ error: "Not found" });
  const next = item.is_active ? 0 : 1;
  await query("UPDATE navbar_items SET is_active = $1 WHERE id = $2", [next, req.params.id]);
  res.json({ is_active: next });
});

app.delete("/api/admin/navbar/:id", requireAuth, async (req, res) => {
  await query("DELETE FROM navbar_items WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});

// ── Pages CRUD ──
app.get("/api/admin/pages", requireAuth, async (_req, res) => {
  res.json((await query("SELECT * FROM pages ORDER BY updated_at DESC")).rows);
});

app.get("/api/admin/pages/:id", requireAuth, async (req, res) => {
  const page = (await query("SELECT * FROM pages WHERE id = $1", [req.params.id])).rows[0];
  if (!page) return res.status(404).json({ error: "Not found" });
  res.json(page);
});

app.get("/api/admin/pages/by-navbar/:navbarItemId", requireAuth, async (req, res) => {
  const page = (await query(
    "SELECT * FROM pages WHERE navbar_item_id = $1",
    [req.params.navbarItemId],
  )).rows[0];
  if (!page) return res.status(404).json({ error: "Not found" });
  res.json(page);
});

app.post("/api/admin/pages", requireAuth, async (req, res) => {
  const f = pageFields(req.body);
  const existing = (await query("SELECT id FROM pages WHERE slug = $1", [f.slug])).rows[0];
  if (existing) {
    return res.status(409).json({ error: "A page with this slug already exists." });
  }
  try {
    const r = (await query(
      `INSERT INTO pages (title, slug, content, navbar_item_id, meta_description, meta_title, focus_keyword, canonical_url, og_title, og_description, og_image, is_published, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
      [f.title, f.slug, f.content, f.navbar_item_id, f.meta_description, f.meta_title, f.focus_keyword, f.canonical_url, f.og_title, f.og_description, f.og_image, f.is_published, req.user.id],
    )).rows[0];
    await logAudit(req.user, "page_created", "page", r.id, { title: f.title });
    res.json({ id: r.id });
  } catch (err) {
    if (err.message?.includes("duplicate key") || err.code === "23505") {
      return res.status(409).json({ error: "A page with this slug already exists." });
    }
    throw err;
  }
});

app.put("/api/admin/pages/:id", requireAuth, async (req, res) => {
  const f = pageFields(req.body);
  const existing = (await query("SELECT id FROM pages WHERE slug = $1 AND id != $2", [f.slug, req.params.id])).rows[0];
  if (existing) {
    return res.status(409).json({ error: "Another page already uses this slug." });
  }
  try {
    await query(
      `UPDATE pages SET title=$1, slug=$2, content=$3, navbar_item_id=$4, meta_description=$5, meta_title=$6, focus_keyword=$7, canonical_url=$8, og_title=$9, og_description=$10, og_image=$11, is_published=$12, updated_at=NOW() WHERE id=$13`,
      [f.title, f.slug, f.content, f.navbar_item_id, f.meta_description, f.meta_title, f.focus_keyword, f.canonical_url, f.og_title, f.og_description, f.og_image, f.is_published, req.params.id],
    );
    await logAudit(req.user, "page_updated", "page", +req.params.id, { title: f.title });
    res.json({ ok: true });
  } catch (err) {
    if (err.message?.includes("duplicate key") || err.code === "23505") {
      return res.status(409).json({ error: "Another page already uses this slug." });
    }
    throw err;
  }
});

app.delete("/api/admin/pages/:id", requireAuth, async (req, res) => {
  await query("DELETE FROM pages WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});

// ── Categories CRUD ──
app.get("/api/admin/categories", requireAuth, async (_req, res) => {
  res.json((await query("SELECT * FROM categories ORDER BY name ASC")).rows);
});

app.post("/api/admin/categories", requireAuth, async (req, res) => {
  const { name, slug, description, image_url, navbar_item_id } = req.body;
  const r = (await query(
    "INSERT INTO categories (name, slug, description, image_url, navbar_item_id) VALUES ($1,$2,$3,$4,$5) RETURNING id",
    [name, slug, description || "", image_url || "", navbar_item_id || null],
  )).rows[0];
  await logAudit(req.user, "category_created", "category", r.id);
  res.json({ id: r.id });
});

app.put("/api/admin/categories/:id", requireAuth, async (req, res) => {
  const { name, slug, description, image_url, navbar_item_id } = req.body;
  await query(
    "UPDATE categories SET name=$1, slug=$2, description=$3, image_url=$4, navbar_item_id=$5 WHERE id=$6",
    [name, slug, description || "", image_url || "", navbar_item_id || null, req.params.id],
  );
  res.json({ ok: true });
});

app.delete("/api/admin/categories/:id", requireAuth, async (req, res) => {
  await query("DELETE FROM categories WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});

// ── Blogs CRUD ──
app.get("/api/admin/blogs", requireAuth, async (_req, res) => {
  res.json((await query(
    `SELECT b.*, c.name as category_name, u.name as author_name
     FROM blogs b LEFT JOIN categories c ON c.id = b.category_id
     LEFT JOIN users u ON u.id = b.author_id ORDER BY b.created_at DESC`,
  )).rows);
});

app.post("/api/admin/blogs", requireAuth, async (req, res) => {
  const f = blogFields(req.body);
  if (f.is_published && (!f.cover_image || !f.cover_image_alt)) {
    return res.status(400).json({ error: "Featured image and alt text required to publish" });
  }
  const existingSlug = (await query("SELECT id FROM blogs WHERE slug = $1", [f.slug])).rows[0];
  if (existingSlug) {
    return res.status(409).json({ error: "A blog with this slug already exists." });
  }
  try {
    const published_at = f.is_published ? new Date().toISOString() : null;
    const r = (await query(
      `INSERT INTO blogs (title, slug, cover_image, cover_image_alt, excerpt, body, category_id, author_id, is_published, published_at, meta_title, meta_description, focus_keyword, canonical_url, og_title, og_description, og_image, show_toc, toc_min_words)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING id`,
      [f.title, f.slug, f.cover_image, f.cover_image_alt, f.excerpt, f.body, f.category_id, req.user.id, f.is_published, published_at, f.meta_title, f.meta_description, f.focus_keyword, f.canonical_url, f.og_title, f.og_description, f.og_image, f.show_toc, f.toc_min_words],
    )).rows[0];
    await syncBlogTags(r.id, req.body.tags || []);
    await saveBlogRevision(r.id, { ...f, tags: req.body.tags }, req.user.id);
    await logAudit(req.user, "blog_created", "blog", r.id, { title: f.title });
    res.json({ id: r.id });
  } catch (err) {
    if (err.message?.includes("duplicate key") || err.code === "23505") {
      return res.status(409).json({ error: "A blog with this slug already exists." });
    }
    throw err;
  }
});

app.put("/api/admin/blogs/:id", requireAuth, async (req, res) => {
  const f = blogFields(req.body);
  if (f.is_published && (!f.cover_image || !f.cover_image_alt)) {
    return res.status(400).json({ error: "Featured image and alt text required to publish" });
  }
  const existing = (await query("SELECT is_published, slug FROM blogs WHERE id = $1", [req.params.id])).rows[0];
  let published_at = null;
  if (f.is_published) {
    published_at = existing?.is_published ? undefined : new Date().toISOString();
  }
  if (published_at !== undefined) {
    await query(
      `UPDATE blogs SET title=$1, slug=$2, cover_image=$3, cover_image_alt=$4, excerpt=$5, body=$6, category_id=$7, is_published=$8, published_at=COALESCE(published_at, $9), meta_title=$10, meta_description=$11, focus_keyword=$12, canonical_url=$13, og_title=$14, og_description=$15, og_image=$16, show_toc=$17, toc_min_words=$18, updated_at=NOW() WHERE id=$19`,
      [f.title, f.slug, f.cover_image, f.cover_image_alt, f.excerpt, f.body, f.category_id, f.is_published, published_at, f.meta_title, f.meta_description, f.focus_keyword, f.canonical_url, f.og_title, f.og_description, f.og_image, f.show_toc, f.toc_min_words, req.params.id],
    );
  } else {
    await query(
      `UPDATE blogs SET title=$1, slug=$2, cover_image=$3, cover_image_alt=$4, excerpt=$5, body=$6, category_id=$7, is_published=$8, published_at=NULL, meta_title=$9, meta_description=$10, focus_keyword=$11, canonical_url=$12, og_title=$13, og_description=$14, og_image=$15, show_toc=$16, toc_min_words=$17, updated_at=NOW() WHERE id=$18`,
      [f.title, f.slug, f.cover_image, f.cover_image_alt, f.excerpt, f.body, f.category_id, 0, f.meta_title, f.meta_description, f.focus_keyword, f.canonical_url, f.og_title, f.og_description, f.og_image, f.show_toc, f.toc_min_words, req.params.id],
    );
  }
  await syncBlogTags(+req.params.id, req.body.tags || []);
  await saveBlogRevision(+req.params.id, { ...f, tags: req.body.tags }, req.user.id);
  await logAudit(req.user, "blog_updated", "blog", +req.params.id, { title: f.title, slugChanged: existing?.slug !== f.slug });
  res.json({ ok: true });
});

app.delete("/api/admin/blogs/:id", requireAuth, async (req, res) => {
  await query("DELETE FROM blogs WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});

// ── Users CRUD (admin only) ──
app.get("/api/admin/users", requireAuth, requireAdmin, async (_req, res) => {
  res.json((await query("SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC")).rows);
});

app.post("/api/admin/users", requireAuth, requireAdmin, async (req, res) => {
  const { name, email, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const r = (await query(
    "INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id",
    [name, email, hash, role],
  )).rows[0];
  res.json({ id: r.id });
});

app.put("/api/admin/users/:id", requireAuth, requireAdmin, async (req, res) => {
  const { name, role, password, is_active } = req.body;
  if (password) {
    const hash = await bcrypt.hash(password, 10);
    await query(
      "UPDATE users SET name=$1, role=$2, password=$3, is_active=$4, updated_at=NOW() WHERE id=$5",
      [name, role, hash, is_active ? 1 : 0, req.params.id],
    );
  } else {
    await query(
      "UPDATE users SET name=$1, role=$2, is_active=$3, updated_at=NOW() WHERE id=$4",
      [name, role, is_active ? 1 : 0, req.params.id],
    );
  }
  res.json({ ok: true });
});

app.delete("/api/admin/users/:id", requireAuth, requireAdmin, async (req, res) => {
  await query("DELETE FROM users WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});

// ── Ad slots CRUD ──
app.get("/api/admin/ads", requireAuth, async (_req, res) => {
  res.json((await query("SELECT * FROM ad_slots ORDER BY slot_code ASC")).rows);
});

app.post("/api/admin/ads", requireAuth, async (req, res) => {
  const { slot_code, label, image_url, link_url, width, height, sort_order, is_active, expires_at } = req.body;
  const r = (await query(
    `INSERT INTO ad_slots (slot_code, label, image_url, link_url, width, height, sort_order, is_active, expires_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    [slot_code, label || "", image_url || "", link_url || "", width || 300, height || 250, sort_order ?? 0, is_active ? 1 : 0, expires_at || null],
  )).rows[0];
  await logAudit(req.user, "ad_created", "ad", r.id);
  res.json({ id: r.id });
});

app.put("/api/admin/ads/:id", requireAuth, async (req, res) => {
  const { label, image_url, link_url, width, height, sort_order, is_active, expires_at } = req.body;
  await query(
    `UPDATE ad_slots SET label=$1, image_url=$2, link_url=$3, width=$4, height=$5, sort_order=$6, is_active=$7, expires_at=$8, updated_at=NOW() WHERE id=$9`,
    [label || "", image_url || "", link_url || "", width || 300, height || 250, sort_order ?? 0, is_active ? 1 : 0, expires_at || null, req.params.id],
  );
  await logAudit(req.user, "ad_updated", "ad", +req.params.id);
  res.json({ ok: true });
});

app.delete("/api/admin/ads/:id", requireAuth, async (req, res) => {
  await query("DELETE FROM ad_slots WHERE id = $1", [req.params.id]);
  await logAudit(req.user, "ad_deleted", "ad", +req.params.id);
  res.json({ ok: true });
});

app.post("/api/admin/upload", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// ── Landing content ──
app.get("/api/admin/landing", requireAuth, async (_req, res) => {
  const row = (await query("SELECT data FROM landing_content WHERE id = 1")).rows[0];
  if (!row) return res.json({});
  try { res.json(JSON.parse(row.data)); } catch { res.json({}); }
});

app.put("/api/admin/landing", requireAuth, async (req, res) => {
  const data = JSON.stringify(req.body);
  const existing = (await query("SELECT id FROM landing_content WHERE id = 1")).rows[0];
  if (existing) {
    await query("UPDATE landing_content SET data = $1, updated_at = NOW() WHERE id = 1", [data]);
  } else {
    await query("INSERT INTO landing_content (id, data) VALUES (1, $1)", [data]);
  }
  res.json({ ok: true });
});

// ── Start server ──
async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Qadiroon API running on http://localhost:${PORT}`);
  });
}
start();
