import { db } from "./db.js";

function columnExists(table, column) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  return cols.some((c) => c.name === column);
}

function addColumn(table, column, definition) {
  if (!columnExists(table, column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

export function runMigrations() {
  addColumn("blogs", "meta_title", "TEXT");
  addColumn("blogs", "meta_description", "TEXT");
  addColumn("blogs", "focus_keyword", "TEXT");
  addColumn("blogs", "canonical_url", "TEXT");
  addColumn("blogs", "og_title", "TEXT");
  addColumn("blogs", "og_description", "TEXT");
  addColumn("blogs", "og_image", "TEXT");
  addColumn("blogs", "cover_image_alt", "TEXT");
  addColumn("blogs", "show_toc", "INTEGER NOT NULL DEFAULT 1");
  addColumn("blogs", "toc_min_words", "INTEGER NOT NULL DEFAULT 300");
  addColumn("blogs", "view_count", "INTEGER NOT NULL DEFAULT 0");

  addColumn("pages", "meta_title", "TEXT");
  addColumn("pages", "focus_keyword", "TEXT");
  addColumn("pages", "canonical_url", "TEXT");
  addColumn("pages", "og_title", "TEXT");
  addColumn("pages", "og_description", "TEXT");
  addColumn("pages", "og_image", "TEXT");

  addColumn("users", "totp_secret", "TEXT");
  addColumn("users", "totp_enabled", "INTEGER NOT NULL DEFAULT 0");

  db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS blog_tags (
      blog_id INTEGER REFERENCES blogs(id) ON DELETE CASCADE,
      tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (blog_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS blog_revisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      blog_id INTEGER REFERENCES blogs(id) ON DELETE CASCADE,
      data TEXT NOT NULL,
      created_by INTEGER REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS code_snippets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('head','body-start','body-end')),
      code TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      scope TEXT NOT NULL DEFAULT 'all',
      scope_target TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      embed_code TEXT NOT NULL UNIQUE,
      fields TEXT NOT NULL DEFAULT '[]',
      notify_email TEXT,
      auto_reply TEXT,
      captcha_enabled INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS form_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
      data TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      user_name TEXT,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      details TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS login_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT,
      ip TEXT,
      success INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS login_lockouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT,
      ip TEXT,
      locked_until TEXT NOT NULL
    );
  `);

  const robots = db.prepare("SELECT value FROM site_settings WHERE key = 'robots_txt'").get();
  if (!robots) {
    db.prepare("INSERT INTO site_settings (key, value) VALUES (?, ?)").run(
      "robots_txt",
      "User-agent: *\nAllow: /\nSitemap: /sitemap.xml",
    );
  }

  const perf = db.prepare("SELECT value FROM site_settings WHERE key = 'performance'").get();
  if (!perf) {
    db.prepare("INSERT INTO site_settings (key, value) VALUES (?, ?)").run(
      "performance",
      JSON.stringify({
        cache_ttl: 3600,
        minify_assets: false,
        cdn_base_url: "",
        lazy_load_images: true,
      }),
    );
  }
}
