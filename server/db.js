import pg from "pg";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { runMigrations } from "./migrate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const pool = new pg.Pool({
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  database: process.env.DATABASE_NAME || "qadroon-news",
  user: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASSWORD || "",
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

/**
 * Execute a query and return { rows, rowCount }.
 * Matches the old SQLite interface: .all() → .rows, .get() → .rows[0], .run() → { rowCount }
 */
export async function query(sql, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return { rows: result.rows, rowCount: result.rowCount };
  } finally {
    client.release();
  }
}

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','employee')),
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS navbar_items (
      id SERIAL PRIMARY KEY,
      label TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS pages (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL DEFAULT '',
      navbar_item_id INTEGER REFERENCES navbar_items(id) ON DELETE SET NULL,
      meta_description TEXT,
      is_published INTEGER NOT NULL DEFAULT 0,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      navbar_item_id INTEGER REFERENCES navbar_items(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS blogs (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      cover_image TEXT,
      excerpt TEXT,
      body TEXT NOT NULL DEFAULT '',
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      author_id INTEGER REFERENCES users(id),
      is_published INTEGER NOT NULL DEFAULT 0,
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ad_slots (
      id SERIAL PRIMARY KEY,
      slot_code TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL,
      image_url TEXT,
      link_url TEXT,
      width INTEGER NOT NULL DEFAULT 300,
      height INTEGER NOT NULL DEFAULT 250,
      is_active INTEGER NOT NULL DEFAULT 1,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS landing_content (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL DEFAULT '{}',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Seed default admin user
  const userCount = (await query("SELECT COUNT(*) as c FROM users")).rows[0].c;
  if (parseInt(userCount) === 0) {
    const hash = await bcrypt.hash("Admin@1234", 10);
    await query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
      ["Super Admin", "admin@qadiroon.com", hash, "admin"],
    );
  }

  // Seed ad slots
  const adCount = (await query("SELECT COUNT(*) as c FROM ad_slots")).rows[0].c;
  if (parseInt(adCount) === 0) {
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
    for (const [code, label, w, h] of ads) {
      await query(
        "INSERT INTO ad_slots (slot_code, label, width, height, is_active) VALUES ($1, $2, $3, $4, 0)",
        [code, label, w, h],
      );
    }
  }

  // Seed landing content
  const landingCount = (await query("SELECT COUNT(*) as c FROM landing_content")).rows[0].c;
  if (parseInt(landingCount) === 0) {
    const defaultLanding = {
      hero_title: "",
      hero_subtitle: "",
      stats: [
        { value: "", label: "" },
        { value: "", label: "" },
        { value: "", label: "" },
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
      services: [
        { rank: 1, name: "خدمات التأهيل المهني", count: "12,345", color: "#1673B8" },
        { rank: 2, name: "الدعم النفسي والاجتماعي", count: "8,920", color: "#7AC143" },
        { rank: 3, name: "المنح الدراسية", count: "6,450", color: "#F6B512" },
        { rank: 4, name: "خدمات الرعاية الصحية", count: "5,100", color: "#E74C3C" },
        { rank: 5, name: "استشارات قانونية", count: "3,780", color: "#8E44AD" },
      ],
      poll: {
        question: "ما أكبر تحدٍ تواجهه في حياتك اليومية؟",
        options: [
          { label: "إمكانية الوصول", percent: 38 },
          { label: "فرص العمل", percent: 27 },
          { label: "الخدمات الصحية", percent: 19 },
          { label: "الدعم الاجتماعي", percent: 16 },
        ],
        totalVotes: 2847,
      },
      jobs: [
        { id: "1", title: "مطور واجهات أمامية", company: "شركة التقنية المتقدمة", companyLogo: "", location: "الرياض، السعودية", postedDate: "منذ ٣ أيام", salary: "8,000 - 11,000 ريال", type: "دوام كامل", tags: ["إعاقة سمعية", "ترحيب بالجميع"] },
        { id: "2", title: "مصمم جرافيك", company: "وكالة الإبداع الرقمي", companyLogo: "", location: "جدة، السعودية", postedDate: "منذ أسبوع", salary: "6,500 - 9,000 ريال", type: "دوام جزئي", tags: ["ترحيب بالجميع"] },
        { id: "3", title: "محلل بيانات", company: "مؤسسة البيانات الذكية", companyLogo: "", location: "عن بعد", postedDate: "منذ يومين", salary: "10,000 - 14,000 ريال", type: "عن بعد", tags: ["إعاقة حركية", "ترحيب بالجميع"] },
      ],
      stories: [
        { id: "1", title: "من التحدي إلى التميز: قصة أحمد", excerpt: "تغلب أحمد على الصعاب ليصبح من رواد الأعمال في مجال التقنية المساعدة", image: "" },
        { id: "2", title: "نورة.. أول محامية صماء في المملكة", excerpt: "كسرت الحواجز وأثبتت أن الإعاقة ليست عائقاً أمام تحقيق الأحلام", image: "" },
        { id: "3", title: "فريق كرة القدم البارالمبي يحقق الذهب", excerpt: "إنجاز تاريخي للفريق السعودي في البطولة الآسيوية للرياضات البارالمبية", image: "" },
      ],
      govt_services: [
        { id: "1", icon: "🏠", title: "برنامج الإسكان التنموي", description: "حلول سكنية للأسر الأشد حاجة بالشراكة مع القطاع غير الربحي", authority: "وزارة الإسكان", badge: "الأكثر طلباً" },
        { id: "2", icon: "🏥", title: "التأهيل الطبي المنزلي", description: "خدمات تأهيلية وعلاجية منزلية للأشخاص ذوي الإعاقة", authority: "وزارة الصحة", badge: "جديد" },
        { id: "3", icon: "🎓", title: "منح دراسية جامعية", description: "برنامج منح دراسية كاملة للطلاب من ذوي الاحتياجات الخاصة", authority: "وزارة التعليم", badge: "مميز" },
        { id: "4", icon: "♿", title: "بطاقة الخدمات المتكاملة", description: "بطاقة موحدة تسهل الوصول للخدمات الحكومية المخصصة لذوي الإعاقة", authority: "وزارة الموارد البشرية", badge: "طوارئ" },
      ],
    };
    await query(
      "INSERT INTO landing_content (id, data) VALUES (1, $1)",
      [JSON.stringify(defaultLanding)],
    );
  }

  await runMigrations();
}
