#!/usr/bin/env node
/**
 * Clears seeded dummy content from an existing database.
 * Keeps admin user and ad slot definitions.
 */
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "data", "qadiroon.db");

const emptyLanding = {
  hero_title: "",
  hero_subtitle: "",
  stats: [
    { value: "", label: "" },
    { value: "", label: "" },
    { value: "", label: "" },
  ],
  breaking_ticker: "",
  spotlight: [],
  about_content: "",
};

const db = new Database(dbPath);

db.exec("DELETE FROM navbar_items");
db.exec("DELETE FROM blogs");
db.exec("DELETE FROM pages");
db.exec("DELETE FROM categories");
db.prepare("UPDATE ad_slots SET is_active = 0, image_url = NULL, link_url = NULL").run();
db.prepare(
  "INSERT INTO landing_content (id, data) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = datetime('now')",
).run(JSON.stringify(emptyLanding));

console.log("Database cleared: navbar, pages, blogs, categories, landing reset.");
db.close();
