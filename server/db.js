import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { runMigrations } from "./migrate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const dbPath = path.join(dataDir, "qadiroon.db");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','employee')),
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS navbar_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL DEFAULT '',
      navbar_item_id INTEGER REFERENCES navbar_items(id) ON DELETE SET NULL,
      meta_description TEXT,
      is_published INTEGER NOT NULL DEFAULT 0,
      created_by INTEGER REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      navbar_item_id INTEGER REFERENCES navbar_items(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS blogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      cover_image TEXT,
      excerpt TEXT,
      body TEXT NOT NULL DEFAULT '',
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      author_id INTEGER REFERENCES users(id),
      is_published INTEGER NOT NULL DEFAULT 0,
      published_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ad_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slot_code TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL,
      image_url TEXT,
      link_url TEXT,
      width INTEGER NOT NULL DEFAULT 300,
      height INTEGER NOT NULL DEFAULT 250,
      is_active INTEGER NOT NULL DEFAULT 1,
      expires_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS landing_content (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL DEFAULT '{}',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const userCount = db.prepare("SELECT COUNT(*) as c FROM users").get().c;
  if (userCount === 0) {
    const hash = bcrypt.hashSync("Admin@1234", 10);
    db.prepare(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    ).run("Super Admin", "admin@qadiroon.com", hash, "admin");
  }

  const adCount = db.prepare("SELECT COUNT(*) as c FROM ad_slots").get().c;
  if (adCount === 0) {
    const ads = [
      ["TOP_BANNER", "إعلان أعلى الصفحة", 728, 90],
      ["LEFT_EDGE_TOP", "الجانب الأيسر - أعلى", 160, 200],
      ["LEFT_EDGE_MID", "الجانب الأيسر - وسط", 160, 200],
      ["RIGHT_EDGE_TOP", "الجانب الأيمن - أعلى", 160, 200],
      ["RIGHT_EDGE_MID", "الجانب الأيمن - وسط", 160, 200],
      ["SIDEBAR_300x600", "إعلان جانبي", 300, 600],
      ["BETWEEN_NEWS_BOX_1", "إعلان بين الأخبار", 728, 90],
      ["BETWEEN_NEWS_BOX_2", "إعلان 300×250 - ١", 300, 250],
      ["BETWEEN_NEWS_BOX_3", "إعلان 300×250 - ٢", 300, 250],
    ];
    const stmt = db.prepare(
      "INSERT INTO ad_slots (slot_code, label, width, height, is_active) VALUES (?, ?, ?, ?, 0)",
    );
    ads.forEach(([code, label, w, h]) => stmt.run(code, label, w, h));
  }

  const landingCount = db.prepare("SELECT COUNT(*) as c FROM landing_content").get().c;
  if (landingCount === 0) {
    const defaultLanding = {
      hero_title: "منصة قادرون الإعلامية",
      hero_subtitle: "المنصة الأولى المتخصصة لخدمة الفئات الخاصة ومجتمعها في العالم العربي",
      stats: [
        { value: "١٢٠٠+", label: "مقال وخبر" },
        { value: "٥٠٠+", label: "مستخدم نشط" },
        { value: "١٥+", label: "خدمة متخصصة" },
      ],
      breaking_ticker: "آخر الأخبار: إطلاق منصة قادرون بنسختها الجديدة | خدمات جديدة لدعم ذوي الاحتياجات الخاصة | مبادرات مجتمعية رائدة في المنطقة العربية",
      spotlight: [
        {
          id: "1",
          image: "",
          title: "خدمات التأهيل المهني",
          description: "برامج تدريبية متكاملة لتمكين ذوي الإعاقة في سوق العمل",
          link: "/pages/about",
          sort_order: 1,
        },
        {
          id: "2",
          image: "",
          title: "الدعم النفسي والاجتماعي",
          description: "استشارات نفسية وجلسات دعم جماعي للأسر والأفراد",
          link: "/pages/about",
          sort_order: 2,
        },
        {
          id: "3",
          image: "",
          title: "منح دراسية",
          description: "فرص تعليمية متميزة للطلاب من ذوي الاحتياجات الخاصة",
          link: "/pages/about",
          sort_order: 3,
        },
      ],
      about_content: "قادرون هي منصة إعلامية عربية رائدة تهدف إلى تمكين الفئات الخاصة وتسليط الضوء على قضاياهم وإنجازاتهم. نعمل على بناء مجتمع شامل يوفر المعلومات والخدمات والدعم لكل أفراد المجتمع.",
    };
    db.prepare("INSERT INTO landing_content (id, data) VALUES (1, ?)").run(
      JSON.stringify(defaultLanding),
    );
  }

  // ── Seed navbar items ──
  const navbarCount = db.prepare("SELECT COUNT(*) as c FROM navbar_items").get().c;
  if (navbarCount === 0) {
    const navStmt = db.prepare(
      "INSERT INTO navbar_items (label, slug, sort_order, is_active) VALUES (?, ?, ?, 1)",
    );
    navStmt.run("الرئيسية", "/", 1);
    navStmt.run("آخر الأخبار", "blogs", 2);
    navStmt.run("عن قادرون", "about", 3);
    navStmt.run("اتصل بنا", "contact", 4);
  }

  // ── Seed pages ──
  const pagesCount = db.prepare("SELECT COUNT(*) as c FROM pages").get().c;
  if (pagesCount === 0) {
    const pageStmt = db.prepare(
      `INSERT INTO pages (title, slug, content, navbar_item_id, meta_description, is_published, created_by)
       VALUES (?, ?, ?, ?, ?, 1, 1)`,
    );
    const aboutId = db.prepare("SELECT id FROM navbar_items WHERE slug = 'about'").get()?.id;
    const contactId = db.prepare("SELECT id FROM navbar_items WHERE slug = 'contact'").get()?.id;

    if (aboutId) {
      pageStmt.run(
        "عن قادرون",
        "about",
        `<h2>من نحن</h2><p>قادرون هي منصة إعلامية عربية متخصصة تهدف إلى تمكين الفئات الخاصة وتسليط الضوء على قضاياهم وإنجازاتهم.</p><p>تأسست المنصة لتكون الصوت الإعلامي الأول للفئات الخاصة في العالم العربي، حيث توفر محتوى إعلامياً متخصصاً يغطي الأخبار والتقارير والتحليلات المتعلقة بذوي الاحتياجات الخاصة.</p><h2>رؤيتنا</h2><p>بناء مجتمع إعلامي شامل يضمن التمثيل العادل والمشاركة الفاعلة للفئات الخاصة في المشهد الإعلامي العربي.</p><h2>رسالتنا</h2><p>تقديم محتوى إعلامي هادف ومؤثر يعكس واقع الفئات الخاصة ويساهم في تغيير الصورة النمطية وتعزيز الوعي المجتمعي.</p>`,
        aboutId,
        "تعرف على منصة قادرون الإعلامية المتخصصة للفئات الخاصة",
      );
    }

    if (contactId) {
      pageStmt.run(
        "اتصل بنا",
        "contact",
        `<h2>تواصل معنا</h2><p>نرحب بتواصلكم واستفساراتكم. يمكنكم التواصل معنا عبر الوسائل التالية:</p><ul><li>البريد الإلكتروني: info@qadiroon.com</li><li>الهاتف: +966 12 345 6789</li><li>العنوان: الرياض، المملكة العربية السعودية</li></ul><p>أو يمكنكم متابعتنا على منصات التواصل الاجتماعي للحصول على آخر الأخبار والتحديثات.</p>`,
        contactId,
        "اتصل بفريق قادرون - تواصل معنا",
      );
    }
  }

  // ── Seed sample blogs ──
  const blogsCount = db.prepare("SELECT COUNT(*) as c FROM blogs").get().c;
  if (blogsCount === 0) {
    // Ensure sample category exists
    let catId = db.prepare("SELECT id FROM categories WHERE slug = 'akhbar'").get()?.id;
    if (!catId) {
      const catResult = db.prepare(
        "INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)",
      ).run("أخبار", "akhbar", "آخر الأخبار والتحديثات");
      catId = catResult.lastInsertRowid;
    }

    const blogStmt = db.prepare(
      `INSERT INTO blogs (title, slug, cover_image, excerpt, body, category_id, author_id, is_published, published_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?)`,
    );

    const now = new Date().toISOString();

    blogStmt.run(
      "إطلاق منصة قادرون بنسختها الجديدة",
      "qadiroon-new-version",
      "",
      "أطلقت منصة قادرون نسختها الجديدة بمميزات متطورة تخدم الفئات الخاصة",
      `<p>أعلنت منصة قادرون الإعلامية عن إطلاق نسختها الجديدة والمطورة، والتي تأتي بحلة عصرية ومميزات جديدة تهدف إلى تحسين تجربة المستخدم للفئات الخاصة.</p><p>تتضمن النسخة الجديدة واجهة مستخدم محسنة تدعم سهولة التصفح، وأدوات نفاذ رقمية متطورة، ومحتوى متجدد يواكب احتياجات المجتمع.</p><h2>مميزات النسخة الجديدة</h2><ul><li>دعم كامل لقارئ الشاشة</li><li>وضع التباين العالي</li><li>تكبير وتصغير الخط</li><li>خاصية الاستماع للمحتوى</li></ul>`,
      catId,
      now,
    );

    blogStmt.run(
      "مبادرة جديدة لدعم توظيف ذوي الإعاقة",
      "employment-initiative-disabilities",
      "",
      "مبادرة وطنية تهدف إلى توفير فرص عمل لذوي الإعاقة في القطاعين العام والخاص",
      `<p>أطلقت الجهات المختصة مبادرة وطنية شاملة تهدف إلى تعزيز فرص توظيف الأشخاص ذوي الإعاقة في مختلف القطاعات.</p><p>تتضمن المبادرة برامج تدريبية متخصصة، وحوافز للشركات الموظفة، وخدمات دعم وتأهيل مهني متكاملة.</p>`,
      catId,
      now,
    );

    blogStmt.run(
      "مؤتمر التقنيات المساعدة ٢٠٢٥",
      "assistive-technology-conference-2025",
      "",
      "مؤتمر دولي يستعرض أحدث التقنيات المساعدة للأشخاص ذوي الإعاقة",
      `<p>اختتمت فعاليات مؤتمر التقنيات المساعدة ٢٠٢٥ بمشاركة دولية واسعة، حيث تم استعراض أحدث الابتكارات والتقنيات التي تخدم الأشخاص ذوي الإعاقة.</p><p>شهد المؤتمر حضوراً لافتاً من الخبراء والمختصين في مجال التقنيات المساعدة، وتم خلاله توقيع عدة اتفاقيات تعاون بين المؤسسات المحلية والدولية.</p>`,
      catId,
      now,
    );
  }

  runMigrations();
}
