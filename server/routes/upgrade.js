import { generateSecret, generateURI, verifySync } from "otplib";
import { logAudit } from "../audit.js";
import { cacheClear, cacheGet, cacheSet } from "../cache.js";

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function saveBlogRevision(db, blogId, data, userId) {
  db.prepare(
    "INSERT INTO blog_revisions (blog_id, data, created_by) VALUES (?, ?, ?)",
  ).run(blogId, JSON.stringify(data), userId);
  const old = db
    .prepare(
      "SELECT id FROM blog_revisions WHERE blog_id = ? ORDER BY created_at DESC LIMIT 100 OFFSET 5",
    )
    .all(blogId);
  old.forEach((r) =>
    db.prepare("DELETE FROM blog_revisions WHERE id = ?").run(r.id),
  );
}

function syncBlogTags(db, blogId, tagNames = []) {
  db.prepare("DELETE FROM blog_tags WHERE blog_id = ?").run(blogId);
  for (const name of tagNames) {
    if (!name?.trim()) continue;
    const slug = slugify(name);
    let tag = db.prepare("SELECT id FROM tags WHERE slug = ?").get(slug);
    if (!tag) {
      const r = db.prepare("INSERT INTO tags (name, slug) VALUES (?, ?)").run(name.trim(), slug);
      tag = { id: r.lastInsertRowid };
    }
    db.prepare("INSERT OR IGNORE INTO blog_tags (blog_id, tag_id) VALUES (?, ?)").run(
      blogId,
      tag.id,
    );
  }
}

function getBlogTags(db, blogId) {
  return db
    .prepare(
      `SELECT t.id, t.name, t.slug FROM tags t
       JOIN blog_tags bt ON bt.tag_id = t.id WHERE bt.blog_id = ?`,
    )
    .all(blogId);
}

function blogFields(body) {
  return {
    title: body.title,
    slug: body.slug,
    cover_image: body.cover_image || "",
    cover_image_alt: body.cover_image_alt || "",
    excerpt: body.excerpt || "",
    body: body.body || "",
    category_id: body.category_id || null,
    is_published: body.is_published ? 1 : 0,
    meta_title: body.meta_title || "",
    meta_description: body.meta_description || "",
    focus_keyword: body.focus_keyword || "",
    canonical_url: body.canonical_url || "",
    og_title: body.og_title || "",
    og_description: body.og_description || "",
    og_image: body.og_image || "",
    show_toc: body.show_toc === 0 || body.show_toc === false ? 0 : 1,
    toc_min_words: body.toc_min_words || 300,
  };
}

function pageFields(body) {
  return {
    title: body.title,
    slug: body.slug,
    content: body.content || "",
    navbar_item_id: body.navbar_item_id || null,
    meta_description: body.meta_description || "",
    meta_title: body.meta_title || "",
    focus_keyword: body.focus_keyword || "",
    canonical_url: body.canonical_url || "",
    og_title: body.og_title || "",
    og_description: body.og_description || "",
    og_image: body.og_image || "",
    is_published: body.is_published ? 1 : 0,
  };
}

export function registerUpgradeRoutes(app, db, { requireAuth, requireAdmin }) {
  // ── Enhanced dashboard ──
  app.get("/api/admin/stats", requireAuth, (req, res) => {
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const blogs = db.prepare("SELECT COUNT(*) as c FROM blogs WHERE is_published = 1").get().c;
    const pages = db.prepare("SELECT COUNT(*) as c FROM pages WHERE is_published = 1").get().c;
    const usersActive = db.prepare("SELECT COUNT(*) as c FROM users WHERE is_active = 1").get().c;
    const usersTotal = db.prepare("SELECT COUNT(*) as c FROM users").get().c;
    const blogsTrend = db
      .prepare("SELECT COUNT(*) as c FROM blogs WHERE created_at > ?").get(weekAgo).c;
    const pagesTrend = db
      .prepare("SELECT COUNT(*) as c FROM pages WHERE created_at > ?").get(weekAgo).c;
    const latestBlogs = db
      .prepare(
        `SELECT b.id, b.title, b.slug, b.is_published, b.created_at, b.published_at,
                b.cover_image, b.view_count
         FROM blogs b ORDER BY b.created_at DESC LIMIT 6`,
      )
      .all();
    const recentActivity = db
      .prepare("SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 8")
      .all();
    res.json({
      blogs,
      pages,
      users: usersActive,
      usersTotal,
      blogsTrend,
      pagesTrend,
      latestBlogs,
      recentActivity,
    });
  });

  // ── Blog get by id + revisions ──
  app.get("/api/admin/blogs/:id", requireAuth, (req, res) => {
    const blog = db
      .prepare(
        `SELECT b.*, c.name as category_name, u.name as author_name
         FROM blogs b LEFT JOIN categories c ON c.id = b.category_id
         LEFT JOIN users u ON u.id = b.author_id WHERE b.id = ?`,
      )
      .get(req.params.id);
    if (!blog) return res.status(404).json({ error: "Not found" });
    res.json({ ...blog, tags: getBlogTags(db, blog.id) });
  });

  app.get("/api/admin/blogs/:id/revisions", requireAuth, (req, res) => {
    const revs = db
      .prepare(
        "SELECT id, created_at, created_by FROM blog_revisions WHERE blog_id = ? ORDER BY created_at DESC LIMIT 5",
      )
      .all(req.params.id);
    res.json(revs);
  });

  app.post("/api/admin/blogs/:id/revisions/:revId/restore", requireAuth, (req, res) => {
    const rev = db
      .prepare("SELECT data FROM blog_revisions WHERE id = ? AND blog_id = ?")
      .get(req.params.revId, req.params.id);
    if (!rev) return res.status(404).json({ error: "Not found" });
    res.json(JSON.parse(rev.data));
  });

  // ── Tags ──
  app.get("/api/admin/tags", requireAuth, (_req, res) => {
    res.json(db.prepare("SELECT * FROM tags ORDER BY name ASC").all());
  });

  app.post("/api/admin/tags", requireAuth, (req, res) => {
    const { name } = req.body;
    const slug = slugify(name);
    const r = db.prepare("INSERT INTO tags (name, slug) VALUES (?, ?)").run(name, slug);
    res.json({ id: r.lastInsertRowid, name, slug });
  });

  // ── Code snippets ──
  app.get("/api/admin/snippets", requireAuth, (_req, res) => {
    res.json(db.prepare("SELECT * FROM code_snippets ORDER BY name ASC").all());
  });

  app.post("/api/admin/snippets", requireAuth, (req, res) => {
    const { name, type, code, is_active = 1, scope = "all", scope_target } = req.body;
    const r = db
      .prepare(
        `INSERT INTO code_snippets (name, type, code, is_active, scope, scope_target)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(name, type, code, is_active ? 1 : 0, scope, scope_target || null);
    logAudit(req.user, "snippet_created", "snippet", r.lastInsertRowid);
    cacheClear();
    res.json({ id: r.lastInsertRowid });
  });

  app.put("/api/admin/snippets/:id", requireAuth, (req, res) => {
    const { name, type, code, is_active, scope, scope_target } = req.body;
    db.prepare(
      `UPDATE code_snippets SET name=?, type=?, code=?, is_active=?, scope=?, scope_target=?, updated_at=datetime('now') WHERE id=?`,
    ).run(name, type, code, is_active ? 1 : 0, scope, scope_target || null, req.params.id);
    logAudit(req.user, "snippet_updated", "snippet", +req.params.id);
    cacheClear();
    res.json({ ok: true });
  });

  app.delete("/api/admin/snippets/:id", requireAuth, (req, res) => {
    db.prepare("DELETE FROM code_snippets WHERE id = ?").run(req.params.id);
    logAudit(req.user, "snippet_deleted", "snippet", +req.params.id);
    cacheClear();
    res.json({ ok: true });
  });

  app.get("/api/public/snippets", (req, res) => {
    const path = req.query.path || "/";
    const snippets = db
      .prepare("SELECT type, code, scope, scope_target FROM code_snippets WHERE is_active = 1")
      .all()
      .filter((s) => {
        if (s.scope === "all") return true;
        if (s.scope_target && path.includes(s.scope_target)) return true;
        return false;
      });
    res.json(snippets);
  });

  // ── Performance ──
  app.get("/api/admin/performance", requireAuth, (_req, res) => {
    const row = db.prepare("SELECT value FROM site_settings WHERE key = 'performance'").get();
    res.json(row ? JSON.parse(row.value) : {});
  });

  app.put("/api/admin/performance", requireAuth, (req, res) => {
    db.prepare(
      "INSERT INTO site_settings (key, value) VALUES ('performance', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    ).run(JSON.stringify(req.body));
    logAudit(req.user, "performance_updated");
    res.json({ ok: true });
  });

  app.post("/api/admin/performance/clear-cache", requireAuth, (req, res) => {
    cacheClear();
    logAudit(req.user, "cache_cleared");
    res.json({ ok: true });
  });

  // ── SEO settings (robots.txt) ──
  app.get("/api/admin/seo-settings", requireAuth, (_req, res) => {
    const row = db.prepare("SELECT value FROM site_settings WHERE key = 'robots_txt'").get();
    res.json({ robots_txt: row?.value || "" });
  });

  app.put("/api/admin/seo-settings", requireAuth, (req, res) => {
    db.prepare(
      "INSERT INTO site_settings (key, value) VALUES ('robots_txt', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    ).run(req.body.robots_txt || "");
    logAudit(req.user, "robots_updated");
    res.json({ ok: true });
  });

  app.get("/robots.txt", (_req, res) => {
    const row = db.prepare("SELECT value FROM site_settings WHERE key = 'robots_txt'").get();
    res.type("text/plain").send(row?.value || "User-agent: *\nAllow: /");
  });

  app.get("/sitemap.xml", (_req, res) => {
    const base = process.env.SITE_URL || "http://localhost:5173";
    const blogs = db
      .prepare("SELECT slug, updated_at FROM blogs WHERE is_published = 1")
      .all();
    const pages = db
      .prepare("SELECT slug, updated_at FROM pages WHERE is_published = 1")
      .all();
    const urls = [
      { loc: `${base}/`, priority: "1.0" },
      { loc: `${base}/blogs`, priority: "0.9" },
      ...blogs.map((b) => ({
        loc: `${base}/blogs/${b.slug}`,
        lastmod: b.updated_at?.slice(0, 10),
        priority: "0.8",
      })),
      ...pages.map((p) => ({
        loc: `${base}/pages/${p.slug}`,
        lastmod: p.updated_at?.slice(0, 10),
        priority: "0.7",
      })),
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;
    res.type("application/xml").send(xml);
  });

  // ── Audit log ──
  app.get("/api/admin/audit", requireAuth, requireAdmin, (req, res) => {
    const { user_id, from, to } = req.query;
    let sql = "SELECT * FROM audit_log WHERE 1=1";
    const params = [];
    if (user_id) {
      sql += " AND user_id = ?";
      params.push(user_id);
    }
    if (from) {
      sql += " AND created_at >= ?";
      params.push(from);
    }
    if (to) {
      sql += " AND created_at <= ?";
      params.push(to);
    }
    sql += " ORDER BY created_at DESC LIMIT 200";
    res.json(db.prepare(sql).all(...params));
  });

  // ── 2FA ──
  app.post("/api/admin/2fa/setup", requireAuth, requireAdmin, (req, res) => {
    const secret = generateSecret();
    db.prepare("UPDATE users SET totp_secret = ? WHERE id = ?").run(secret, req.user.id);
    const otpauth = generateURI({ issuer: "Qadiroon Admin", label: req.user.email, secret });
    res.json({ secret, otpauth });
  });

  app.post("/api/admin/2fa/enable", requireAuth, requireAdmin, (req, res) => {
    const user = db.prepare("SELECT totp_secret FROM users WHERE id = ?").get(req.user.id);
    const valid = verifySync({ token: req.body.code, secret: user.totp_secret });
    if (!valid) {
      return res.status(400).json({ error: "Invalid code" });
    }
    db.prepare("UPDATE users SET totp_enabled = 1 WHERE id = ?").run(req.user.id);
    logAudit(req.user, "2fa_enabled");
    res.json({ ok: true });
  });

  app.post("/api/admin/2fa/disable", requireAuth, requireAdmin, (req, res) => {
    db.prepare("UPDATE users SET totp_enabled = 0, totp_secret = NULL WHERE id = ?").run(
      req.user.id,
    );
    logAudit(req.user, "2fa_disabled");
    res.json({ ok: true });
  });

  // ── Forms ──
  app.get("/api/admin/forms", requireAuth, (_req, res) => {
    res.json(db.prepare("SELECT * FROM forms ORDER BY created_at DESC").all());
  });

  app.post("/api/admin/forms", requireAuth, (req, res) => {
    const embed = `form_${Date.now().toString(36)}`;
    const { name, fields, notify_email, auto_reply, captcha_enabled } = req.body;
    const r = db
      .prepare(
        `INSERT INTO forms (name, embed_code, fields, notify_email, auto_reply, captcha_enabled)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        name,
        embed,
        JSON.stringify(fields || []),
        notify_email || "",
        auto_reply || "",
        captcha_enabled ? 1 : 0,
      );
    logAudit(req.user, "form_created", "form", r.lastInsertRowid);
    res.json({ id: r.lastInsertRowid, embed_code: embed });
  });

  app.put("/api/admin/forms/:id", requireAuth, (req, res) => {
    const { name, fields, notify_email, auto_reply, captcha_enabled, is_active } = req.body;
    db.prepare(
      `UPDATE forms SET name=?, fields=?, notify_email=?, auto_reply=?, captcha_enabled=?, is_active=? WHERE id=?`,
    ).run(
      name,
      JSON.stringify(fields || []),
      notify_email || "",
      auto_reply || "",
      captcha_enabled ? 1 : 0,
      is_active ? 1 : 0,
      req.params.id,
    );
    res.json({ ok: true });
  });

  app.delete("/api/admin/forms/:id", requireAuth, (req, res) => {
    db.prepare("DELETE FROM forms WHERE id = ?").run(req.params.id);
    res.json({ ok: true });
  });

  app.get("/api/public/forms/:embed", (req, res) => {
    const form = db
      .prepare("SELECT id, name, fields, captcha_enabled FROM forms WHERE embed_code = ? AND is_active = 1")
      .get(req.params.embed);
    if (!form) return res.status(404).json({ error: "Not found" });
    res.json({ ...form, fields: JSON.parse(form.fields) });
  });

  app.post("/api/public/forms/:embed/submit", (req, res) => {
    const form = db
      .prepare("SELECT * FROM forms WHERE embed_code = ? AND is_active = 1")
      .get(req.params.embed);
    if (!form) return res.status(404).json({ error: "Not found" });
    if (req.body._honeypot) return res.json({ ok: true });
    db.prepare("INSERT INTO form_submissions (form_id, data) VALUES (?, ?)").run(
      form.id,
      JSON.stringify(req.body),
    );
    res.json({ ok: true, message: form.auto_reply || "Thank you!" });
  });

  app.get("/api/admin/form-submissions", requireAuth, (_req, res) => {
    res.json(
      db
        .prepare(
          `SELECT s.*, f.name as form_name FROM form_submissions s
           JOIN forms f ON f.id = s.form_id ORDER BY s.created_at DESC`,
        )
        .all(),
    );
  });

  app.patch("/api/admin/form-submissions/:id/read", requireAuth, (req, res) => {
    db.prepare("UPDATE form_submissions SET is_read = 1 WHERE id = ?").run(req.params.id);
    res.json({ ok: true });
  });

  app.get("/api/admin/form-submissions/export", requireAuth, (_req, res) => {
    const rows = db
      .prepare(
        `SELECT s.created_at, f.name as form_name, s.data FROM form_submissions s
         JOIN forms f ON f.id = s.form_id ORDER BY s.created_at DESC`,
      )
      .all();
    const csv = ["date,form,data", ...rows.map((r) => `"${r.created_at}","${r.form_name}","${r.data.replace(/"/g, '""')}"`)].join("\n");
    res.type("text/csv").send(csv);
  });

  // Export helpers for blog/page CRUD patching
  return { blogFields, pageFields, saveBlogRevision, syncBlogTags, getBlogTags, cacheClear, cacheGet, cacheSet };
}
