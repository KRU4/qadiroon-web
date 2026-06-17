import { generateSecret, generateURI, verifySync } from "otplib";
import { logAudit } from "../audit.js";
import { cacheClear, cacheGet, cacheSet } from "../cache.js";
import { query } from "../db.js";

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w؀-ۿ\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

async function saveBlogRevision(blogId, data, userId) {
  await query(
    "INSERT INTO blog_revisions (blog_id, data, created_by) VALUES ($1, $2, $3)",
    [blogId, JSON.stringify(data), userId],
  );
  const old = (await query(
    "SELECT id FROM blog_revisions WHERE blog_id = $1 ORDER BY created_at DESC LIMIT 100 OFFSET 5",
    [blogId],
  )).rows;
  for (const r of old) {
    await query("DELETE FROM blog_revisions WHERE id = $1", [r.id]);
  }
}

async function syncBlogTags(blogId, tagNames = []) {
  await query("DELETE FROM blog_tags WHERE blog_id = $1", [blogId]);
  for (const name of tagNames) {
    if (!name?.trim()) continue;
    const slug = slugify(name);
    let tag = (await query("SELECT id FROM tags WHERE slug = $1", [slug])).rows[0];
    if (!tag) {
      const r = (await query("INSERT INTO tags (name, slug) VALUES ($1, $2)", [name.trim(), slug])).rows[0];
      tag = { id: r.id };
    }
    await query(
      "INSERT INTO blog_tags (blog_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [blogId, tag.id],
    );
  }
}

async function getBlogTags(blogId) {
  return (await query(
    `SELECT t.id, t.name, t.slug FROM tags t
     JOIN blog_tags bt ON bt.tag_id = t.id WHERE bt.blog_id = $1`,
    [blogId],
  )).rows;
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

export function registerUpgradeRoutes(app, { requireAuth, requireAdmin }) {
  // ── Enhanced dashboard ──
  app.get("/api/admin/stats", requireAuth, async (req, res) => {
    try {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const blogs = (await query("SELECT COUNT(*) as c FROM blogs WHERE is_published = 1")).rows[0].c;
      const pages = (await query("SELECT COUNT(*) as c FROM pages WHERE is_published = 1")).rows[0].c;
      const usersActive = (await query("SELECT COUNT(*) as c FROM users WHERE is_active = 1")).rows[0].c;
      const usersTotal = (await query("SELECT COUNT(*) as c FROM users")).rows[0].c;
      const blogsTrend = (await query("SELECT COUNT(*) as c FROM blogs WHERE created_at > $1", [weekAgo])).rows[0].c;
      const pagesTrend = (await query("SELECT COUNT(*) as c FROM pages WHERE created_at > $1", [weekAgo])).rows[0].c;
      const latestBlogs = (await query(
        `SELECT b.id, b.title, b.slug, b.is_published, b.created_at, b.published_at,
                b.cover_image, b.view_count
         FROM blogs b ORDER BY b.created_at DESC LIMIT 6`,
      )).rows;
      const recentActivity = (await query("SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 8")).rows;
      res.json({
        blogs: parseInt(blogs), pages: parseInt(pages),
        users: parseInt(usersActive), usersTotal: parseInt(usersTotal),
        blogsTrend: parseInt(blogsTrend), pagesTrend: parseInt(pagesTrend),
        latestBlogs, recentActivity,
      });
    } catch (err) {
      console.error("Stats error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // ── Blog get by id + revisions ──
  app.get("/api/admin/blogs/:id", requireAuth, async (req, res) => {
    const blog = (await query(
      `SELECT b.*, c.name as category_name, u.name as author_name
       FROM blogs b LEFT JOIN categories c ON c.id = b.category_id
       LEFT JOIN users u ON u.id = b.author_id WHERE b.id = $1`,
      [req.params.id],
    )).rows[0];
    if (!blog) return res.status(404).json({ error: "Not found" });
    res.json({ ...blog, tags: await getBlogTags(blog.id) });
  });

  app.get("/api/admin/blogs/:id/revisions", requireAuth, async (req, res) => {
    const revs = (await query(
      "SELECT id, created_at, created_by FROM blog_revisions WHERE blog_id = $1 ORDER BY created_at DESC LIMIT 5",
      [req.params.id],
    )).rows;
    res.json(revs);
  });

  app.post("/api/admin/blogs/:id/revisions/:revId/restore", requireAuth, async (req, res) => {
    const rev = (await query(
      "SELECT data FROM blog_revisions WHERE id = $1 AND blog_id = $2",
      [req.params.revId, req.params.id],
    )).rows[0];
    if (!rev) return res.status(404).json({ error: "Not found" });
    res.json(JSON.parse(rev.data));
  });

  // ── Tags ──
  app.get("/api/admin/tags", requireAuth, async (_req, res) => {
    res.json((await query("SELECT * FROM tags ORDER BY name ASC")).rows);
  });

  app.post("/api/admin/tags", requireAuth, async (req, res) => {
    const { name } = req.body;
    const slug = slugify(name);
    const r = (await query("INSERT INTO tags (name, slug) VALUES ($1, $2) RETURNING id", [name, slug])).rows[0];
    res.json({ id: r.id, name, slug });
  });

  // ── Code snippets ──
  app.get("/api/admin/snippets", requireAuth, async (_req, res) => {
    res.json((await query("SELECT * FROM code_snippets ORDER BY name ASC")).rows);
  });

  app.post("/api/admin/snippets", requireAuth, async (req, res) => {
    const { name, type, code, is_active = 1, scope = "all", scope_target } = req.body;
    const r = (await query(
      `INSERT INTO code_snippets (name, type, code, is_active, scope, scope_target)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [name, type, code, is_active ? 1 : 0, scope, scope_target || null],
    )).rows[0];
    await logAudit(req.user, "snippet_created", "snippet", r.id);
    cacheClear();
    res.json({ id: r.id });
  });

  app.put("/api/admin/snippets/:id", requireAuth, async (req, res) => {
    const { name, type, code, is_active, scope, scope_target } = req.body;
    await query(
      `UPDATE code_snippets SET name=$1, type=$2, code=$3, is_active=$4, scope=$5, scope_target=$6, updated_at=NOW() WHERE id=$7`,
      [name, type, code, is_active ? 1 : 0, scope, scope_target || null, req.params.id],
    );
    await logAudit(req.user, "snippet_updated", "snippet", +req.params.id);
    cacheClear();
    res.json({ ok: true });
  });

  app.delete("/api/admin/snippets/:id", requireAuth, async (req, res) => {
    await query("DELETE FROM code_snippets WHERE id = $1", [req.params.id]);
    await logAudit(req.user, "snippet_deleted", "snippet", +req.params.id);
    cacheClear();
    res.json({ ok: true });
  });

  app.get("/api/public/snippets", async (req, res) => {
    const path = req.query.path || "/";
    const snippets = (await query("SELECT type, code, scope, scope_target FROM code_snippets WHERE is_active = 1")).rows;
    res.json(snippets.filter((s) => {
      if (s.scope === "all") return true;
      if (s.scope_target && path.includes(s.scope_target)) return true;
      return false;
    }));
  });

  // ── Performance ──
  app.get("/api/admin/performance", requireAuth, async (_req, res) => {
    const row = (await query("SELECT value FROM site_settings WHERE key = 'performance'")).rows[0];
    res.json(row ? JSON.parse(row.value) : {});
  });

  app.put("/api/admin/performance", requireAuth, async (req, res) => {
    await query(
      "INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
      ["performance", JSON.stringify(req.body)],
    );
    await logAudit(req.user, "performance_updated");
    res.json({ ok: true });
  });

  app.post("/api/admin/performance/clear-cache", requireAuth, async (req, res) => {
    cacheClear();
    await logAudit(req.user, "cache_cleared");
    res.json({ ok: true });
  });

  // ── SEO settings (robots.txt) ──
  app.get("/api/admin/seo-settings", requireAuth, async (_req, res) => {
    const row = (await query("SELECT value FROM site_settings WHERE key = 'robots_txt'")).rows[0];
    res.json({ robots_txt: row?.value || "" });
  });

  app.put("/api/admin/seo-settings", requireAuth, async (req, res) => {
    await query(
      "INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
      ["robots_txt", req.body.robots_txt || ""],
    );
    await logAudit(req.user, "robots_updated");
    res.json({ ok: true });
  });

  app.get("/robots.txt", async (_req, res) => {
    const row = (await query("SELECT value FROM site_settings WHERE key = 'robots_txt'")).rows[0];
    res.type("text/plain").send(row?.value || "User-agent: *\nAllow: /");
  });

  app.get("/sitemap.xml", async (_req, res) => {
    const base = process.env.SITE_URL || "http://localhost:5173";
    const blogs = (await query("SELECT slug, updated_at FROM blogs WHERE is_published = 1")).rows;
    const pages = (await query("SELECT slug, updated_at FROM pages WHERE is_published = 1")).rows;
    const urls = [
      { loc: `${base}/`, priority: "1.0" },
      { loc: `${base}/blogs`, priority: "0.9" },
      ...blogs.map((b) => ({
        loc: `${base}/blogs/${b.slug}`,
        lastmod: b.updated_at?.toISOString?.()?.slice(0, 10) || b.updated_at?.slice?.(0, 10),
        priority: "0.8",
      })),
      ...pages.map((p) => ({
        loc: `${base}/pages/${p.slug}`,
        lastmod: p.updated_at?.toISOString?.()?.slice(0, 10) || p.updated_at?.slice?.(0, 10),
        priority: "0.7",
      })),
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
    res.type("application/xml").send(xml);
  });

  // ── Audit log ──
  app.get("/api/admin/audit", requireAuth, requireAdmin, async (req, res) => {
    const { user_id, from, to } = req.query;
    let sql = "SELECT * FROM audit_log WHERE 1=1";
    const params = [];
    let idx = 1;
    if (user_id) { sql += ` AND user_id = $${idx++}`; params.push(user_id); }
    if (from) { sql += ` AND created_at >= $${idx++}`; params.push(from); }
    if (to) { sql += ` AND created_at <= $${idx++}`; params.push(to); }
    sql += " ORDER BY created_at DESC LIMIT 200";
    res.json((await query(sql, params)).rows);
  });

  // ── 2FA ──
  app.post("/api/admin/2fa/setup", requireAuth, requireAdmin, async (req, res) => {
    const secret = generateSecret();
    await query("UPDATE users SET totp_secret = $1 WHERE id = $2", [secret, req.user.id]);
    const otpauth = generateURI({ issuer: "Qadiroon Admin", label: req.user.email, secret });
    res.json({ secret, otpauth });
  });

  app.post("/api/admin/2fa/enable", requireAuth, requireAdmin, async (req, res) => {
    const user = (await query("SELECT totp_secret FROM users WHERE id = $1", [req.user.id])).rows[0];
    const valid = verifySync({ token: req.body.code, secret: user.totp_secret });
    if (!valid) return res.status(400).json({ error: "Invalid code" });
    await query("UPDATE users SET totp_enabled = 1 WHERE id = $1", [req.user.id]);
    await logAudit(req.user, "2fa_enabled");
    res.json({ ok: true });
  });

  app.post("/api/admin/2fa/disable", requireAuth, requireAdmin, async (req, res) => {
    await query("UPDATE users SET totp_enabled = 0, totp_secret = NULL WHERE id = $1", [req.user.id]);
    await logAudit(req.user, "2fa_disabled");
    res.json({ ok: true });
  });

  // ── Forms ──
  app.get("/api/admin/forms", requireAuth, async (_req, res) => {
    res.json((await query("SELECT * FROM forms ORDER BY created_at DESC")).rows);
  });

  app.post("/api/admin/forms", requireAuth, async (req, res) => {
    const embed = `form_${Date.now().toString(36)}`;
    const { name, fields, notify_email, auto_reply, captcha_enabled } = req.body;
    const r = (await query(
      `INSERT INTO forms (name, embed_code, fields, notify_email, auto_reply, captcha_enabled)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [name, embed, JSON.stringify(fields || []), notify_email || "", auto_reply || "", captcha_enabled ? 1 : 0],
    )).rows[0];
    await logAudit(req.user, "form_created", "form", r.id);
    res.json({ id: r.id, embed_code: embed });
  });

  app.put("/api/admin/forms/:id", requireAuth, async (req, res) => {
    const { name, fields, notify_email, auto_reply, captcha_enabled, is_active } = req.body;
    await query(
      `UPDATE forms SET name=$1, fields=$2, notify_email=$3, auto_reply=$4, captcha_enabled=$5, is_active=$6 WHERE id=$7`,
      [name, JSON.stringify(fields || []), notify_email || "", auto_reply || "", captcha_enabled ? 1 : 0, is_active ? 1 : 0, req.params.id],
    );
    res.json({ ok: true });
  });

  app.delete("/api/admin/forms/:id", requireAuth, async (req, res) => {
    await query("DELETE FROM forms WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  });

  app.get("/api/public/forms/:embed", async (req, res) => {
    const form = (await query(
      "SELECT id, name, fields, captcha_enabled FROM forms WHERE embed_code = $1 AND is_active = 1",
      [req.params.embed],
    )).rows[0];
    if (!form) return res.status(404).json({ error: "Not found" });
    res.json({ ...form, fields: JSON.parse(form.fields) });
  });

  app.post("/api/public/forms/:embed/submit", async (req, res) => {
    const form = (await query(
      "SELECT * FROM forms WHERE embed_code = $1 AND is_active = 1",
      [req.params.embed],
    )).rows[0];
    if (!form) return res.status(404).json({ error: "Not found" });
    if (req.body._honeypot) return res.json({ ok: true });
    await query("INSERT INTO form_submissions (form_id, data) VALUES ($1, $2)", [form.id, JSON.stringify(req.body)]);
    res.json({ ok: true, message: form.auto_reply || "Thank you!" });
  });

  app.get("/api/admin/form-submissions", requireAuth, async (_req, res) => {
    res.json((await query(
      `SELECT s.*, f.name as form_name FROM form_submissions s
       JOIN forms f ON f.id = s.form_id ORDER BY s.created_at DESC`,
    )).rows);
  });

  app.patch("/api/admin/form-submissions/:id/read", requireAuth, async (req, res) => {
    await query("UPDATE form_submissions SET is_read = 1 WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  });

  app.get("/api/admin/form-submissions/export", requireAuth, async (_req, res) => {
    const rows = (await query(
      `SELECT s.created_at, f.name as form_name, s.data FROM form_submissions s
       JOIN forms f ON f.id = s.form_id ORDER BY s.created_at DESC`,
    )).rows;
    const csv = ["date,form,data", ...rows.map((r) => `"${r.created_at}","${r.form_name}","${r.data.replace(/"/g, '""')}"`)].join("\n");
    res.type("text/csv").send(csv);
  });

  // Export helpers for blog/page CRUD patching
  return { blogFields, pageFields, saveBlogRevision, syncBlogTags, getBlogTags, cacheClear, cacheGet, cacheSet };
}
