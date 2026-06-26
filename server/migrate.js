import { pool, query } from "./db.js";

async function columnExists(table, column) {
  const r = await pool.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = $1 AND column_name = $2`,
    [table, column],
  );
  return r.rows.length > 0;
}

async function addColumn(table, column, pgType) {
  if (!(await columnExists(table, column))) {
    await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${pgType}`);
  }
}

export async function runMigrations() {
  await addColumn("blogs", "meta_title", "TEXT");
  await addColumn("blogs", "meta_description", "TEXT");
  await addColumn("blogs", "focus_keyword", "TEXT");
  await addColumn("blogs", "canonical_url", "TEXT");
  await addColumn("blogs", "og_title", "TEXT");
  await addColumn("blogs", "og_description", "TEXT");
  await addColumn("blogs", "og_image", "TEXT");
  await addColumn("blogs", "cover_image_alt", "TEXT");
  await addColumn("blogs", "show_toc", "INTEGER NOT NULL DEFAULT 1");
  await addColumn("blogs", "toc_min_words", "INTEGER NOT NULL DEFAULT 300");
  await addColumn("blogs", "view_count", "INTEGER NOT NULL DEFAULT 0");

  await addColumn("pages", "meta_title", "TEXT");
  await addColumn("pages", "focus_keyword", "TEXT");
  await addColumn("pages", "canonical_url", "TEXT");
  await addColumn("pages", "og_title", "TEXT");
  await addColumn("pages", "og_description", "TEXT");
  await addColumn("pages", "og_image", "TEXT");

  await addColumn("users", "totp_secret", "TEXT");
  await addColumn("users", "totp_enabled", "INTEGER NOT NULL DEFAULT 0");
  await addColumn("categories", "image_url", "TEXT");
  await addColumn("ad_slots", "sort_order", "INTEGER NOT NULL DEFAULT 0");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tags (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS blog_tags (
      blog_id INTEGER REFERENCES blogs(id) ON DELETE CASCADE,
      tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (blog_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS blog_revisions (
      id SERIAL PRIMARY KEY,
      blog_id INTEGER REFERENCES blogs(id) ON DELETE CASCADE,
      data TEXT NOT NULL,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS code_snippets (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('head','body-start','body-end')),
      code TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      scope TEXT NOT NULL DEFAULT 'all',
      scope_target TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS forms (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      embed_code TEXT NOT NULL UNIQUE,
      fields TEXT NOT NULL DEFAULT '[]',
      notify_email TEXT,
      auto_reply TEXT,
      captcha_enabled INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS form_submissions (
      id SERIAL PRIMARY KEY,
      form_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
      data TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      user_name TEXT,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      details TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS login_attempts (
      id SERIAL PRIMARY KEY,
      email TEXT,
      ip TEXT,
      success INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS login_lockouts (
      id SERIAL PRIMARY KEY,
      email TEXT,
      ip TEXT,
      locked_until TIMESTAMPTZ NOT NULL
    );
  `);

  // Seed site_settings defaults
  const robots = (await query("SELECT value FROM site_settings WHERE key = 'robots_txt'")).rows[0];
  if (!robots) {
    await query(
      "INSERT INTO site_settings (key, value) VALUES ($1, $2)",
      ["robots_txt", "User-agent: *\nAllow: /\nSitemap: /sitemap.xml"],
    );
  }

  const perf = (await query("SELECT value FROM site_settings WHERE key = 'performance'")).rows[0];
  if (!perf) {
    await query(
      "INSERT INTO site_settings (key, value) VALUES ($1, $2)",
      [
        "performance",
        JSON.stringify({
          cache_ttl: 3600,
          minify_assets: false,
          cdn_base_url: "",
          lazy_load_images: true,
        }),
      ],
    );
  }
}
