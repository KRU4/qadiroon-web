#!/usr/bin/env node
/**
 * Seeds Arabic dummy data for local testing.
 * See qadiroon-dummy-data.md for full documentation.
 *
 * Usage: node server/seed-dummy-data.js
 */
import { initDb, db } from "./db.js";

initDb();

const landing = {
  hero_title: "نبض الأخبار العربية",
  hero_subtitle: "منصة إخبارية وخدمية متخصصة للفئات الخاصة",
  stats: [
    { value: "+٥٠٠", label: "خبر شهرياً" },
    { value: "٢٤", label: "ساعة متابعة" },
    { value: "الأولى", label: "أكبر منصة عربية إخبارية" },
  ],
  breaking_ticker:
    "وزارة التنمية الاجتماعية تُطلق برنامجاً جديداً لدعم الأسر|مبادرة قادرون تُحقق نتائج مذهلة: توظيف ٣٠٠٠ شخص|تقنية جديدة تُحدث ثورة في التواصل الرقمي|مؤتمر دولي لإمكانية الوصول الرقمي ينعقد في الرياض",
  spotlight: [
    {
      id: "sp-1",
      title: "الخدمات الحكومية",
      description: "دليل شامل للخدمات المتاحة للفئات الخاصة وذوي الإعاقة",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
      link: "/pages/services",
      sort_order: 0,
    },
    {
      id: "sp-2",
      title: "فرص العمل",
      description: "أحدث الوظائف المخصصة والمكيّفة في القطاعين العام والخاص",
      image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=400&fit=crop",
      link: "/pages/jobs",
      sort_order: 1,
    },
    {
      id: "sp-3",
      title: "قصص النجاح",
      description: "إلهام من تجارب حقيقية لأشخاص حققوا إنجازات استثنائية",
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop",
      link: "/blogs",
      sort_order: 2,
    },
  ],
  about_content:
    "<p>منصة <strong>قادرون</strong> هي منصة إخبارية وخدمية عربية تهدف إلى تمكين المجتمع وتقديم أخبار وخدمات متخصصة بأسلوب احترافي وعصري.</p><p>نؤمن بأن كل إنسان قادر على تحقيق أحلامه عندما تتوفر له الفرص والدعم المناسب.</p>",
};

const navbarItems = [
  { label: "الرئيسية", slug: "/", sort_order: 1 },
  { label: "الأخبار", slug: "/blogs", sort_order: 2 },
  { label: "الخدمات", slug: "/pages/services", sort_order: 3 },
  { label: "الوظائف", slug: "/pages/jobs", sort_order: 4 },
  { label: "من نحن", slug: "/pages/about", sort_order: 5 },
];

const pages = [
  {
    slug: "services",
    title: "الخدمات",
    content: `<h2>الخدمات المتاحة</h2>
<p>نوفر دليلاً شاملاً للخدمات الحكومية والخاصة المتاحة للفئات الخاصة، بما في ذلك:</p>
<ul>
<li>البطاقة الوطنية للفئات الخاصة</li>
<li>برامج الدعم المالي للأسر</li>
<li>خدمات التأهيل المهني والتدريب</li>
<li>إعفاءات الجمارك للأجهزة المساعدة</li>
</ul>
<p>للاستفسار تواصل معنا عبر صفحة <strong>من نحن</strong>.</p>`,
    navbar_slug: "/pages/services",
  },
  {
    slug: "jobs",
    title: "الوظائف",
    content: `<h2>فرص العمل</h2>
<p>نُدرج هنا أحدث فرص العمل المكيّفة والمخصصة للفئات الخاصة في مختلف القطاعات.</p>
<p>تابع قسم <strong>الأخبار</strong> للاطلاع على آخر الإعلانات الوظيفية.</p>`,
    navbar_slug: "/pages/jobs",
  },
  {
    slug: "about",
    title: "من نحن",
    content: `<h2>عن منصة قادرون</h2>
<p>قادرون منصة إعلامية وخدمية عربية متخصصة في شؤون الفئات الخاصة ومجتمعها.</p>
<p>رسالتنا: <em>تمكين كل فرد من الوصول إلى المعلومة والخدمة بكرامة وسهولة.</em></p>`,
    navbar_slug: "/pages/about",
  },
];

const categories = [
  { name: "أخبار عامة", slug: "general-news", description: "آخر الأخبار والتطورات" },
  { name: "تكنولوجيا مساعدة", slug: "assistive-tech", description: "أجهزة وتقنيات مساعدة" },
  { name: "تعليم وتدريب", slug: "education", description: "برامج تعليمية وتأهيلية" },
];

const blogs = [
  {
    title: "إطلاق برنامج وطني جديد لدعم التوظيف المكيّف",
    slug: "national-employment-program",
    excerpt: "وزارة الموارد البشرية تُعلن عن برنامج شامل يستهدف توظيف ١٠٠٠٠ شخص من الفئات الخاصة خلال عامين.",
    cover_image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=450&fit=crop",
    cover_image_alt: "اجتماع عمل في مكتب حديث",
    category_slug: "general-news",
    body: `<h2>تفاصيل البرنامج</h2>
<p>أعلنت وزارة الموارد البشرية والتنمية الاجتماعية عن إطلاق برنامج وطني جديد يهدف إلى دعم التوظيف المكيّف للفئات الخاصة في القطاعين العام والخاص.</p>
<h3>أهداف البرنامج</h3>
<ul>
<li>توفير ١٠٠٠٠ فرصة عمل مكيّفة خلال ٢٤ شهراً</li>
<li>تقديم حوافز للشركات التي توظّف بنسبة ٥٪ على الأقل</li>
<li>برامج تدريب مهني مجانية بالشراكة مع الجامعات</li>
</ul>
<p>يُتوقع أن يبدأ التسجيل في البرنامج خلال الشهر القادم عبر البوابة الإلكترونية الموحدة.</p>`,
  },
  {
    title: "تقنية جديدة للترجمة الفورية بلغة الإشارة",
    slug: "sign-language-ai",
    excerpt: "شركة سعودية ناشئة تُطوّر نظام ذكاء اصطناعي يترجم لغة الإشارة العربية في الوقت الفعلي.",
    cover_image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=450&fit=crop",
    cover_image_alt: "شاشة تعرض تقنية ذكاء اصطناعي",
    category_slug: "assistive-tech",
    body: `<h2>كيف تعمل التقنية؟</h2>
<p>يعتمد النظام على كاميرا عادية وخوارزميات رؤية حاسوبية مدربة على لغة الإشارة العربية الموحدة.</p>
<h3>مجالات الاستخدام</h3>
<ul>
<li>المستشفيات والعيادات</li>
<li>الجامعات والمدارس</li>
<li>مراكز الخدمة الحكومية</li>
</ul>
<p>التجربة التجريبية متاحة حالياً في ثلاث مدن سعودية.</p>`,
  },
  {
    title: "مبادرة تعليمية لتأهيل ٥٠٠٠ طالب وطالبة",
    slug: "education-initiative-5000",
    excerpt: "شراكة بين وزارة التعليم ومنظمات المجتمع المدني لتوفير برامج تأهيل رقمي مجانية.",
    cover_image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=450&fit=crop",
    cover_image_alt: "طلاب في فصل دراسي",
    category_slug: "education",
    body: `<h2>محتوى البرنامج</h2>
<p>يشمل البرنامج دورات في المهارات الرقمية، واللغة الإنجليزية، والتأهيل المهني الأساسي.</p>
<p>التسجيل مفتوح لجميع الفئات العمرية من ١٨ إلى ٣٥ سنة.</p>`,
  },
];

console.log("Seeding dummy Arabic data...");

db.exec("DELETE FROM blog_tags");
db.exec("DELETE FROM blog_revisions");
db.exec("DELETE FROM blogs");
db.exec("DELETE FROM pages");
db.exec("DELETE FROM categories");
db.exec("DELETE FROM navbar_items");

const insertNav = db.prepare(
  "INSERT INTO navbar_items (label, slug, sort_order, is_active) VALUES (?, ?, ?, 1)",
);
const navIds = {};
for (const item of navbarItems) {
  const r = insertNav.run(item.label, item.slug, item.sort_order);
  navIds[item.slug] = r.lastInsertRowid;
}

const insertCat = db.prepare(
  "INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)",
);
const catIds = {};
for (const cat of categories) {
  const r = insertCat.run(cat.name, cat.slug, cat.description);
  catIds[cat.slug] = r.lastInsertRowid;
}

const insertPage = db.prepare(
  `INSERT INTO pages (title, slug, content, navbar_item_id, is_published, created_by)
   VALUES (?, ?, ?, ?, 1, 1)`,
);
for (const page of pages) {
  const navId = navIds[page.navbar_slug] || null;
  insertPage.run(page.title, page.slug, page.content, navId);
}

const insertBlog = db.prepare(
  `INSERT INTO blogs (title, slug, cover_image, cover_image_alt, excerpt, body, category_id, author_id, is_published, published_at, show_toc, toc_min_words)
   VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, datetime('now'), 1, 300)`,
);
for (const blog of blogs) {
  const catId = catIds[blog.category_slug] || null;
  insertBlog.run(
    blog.title,
    blog.slug,
    blog.cover_image,
    blog.cover_image_alt,
    blog.excerpt,
    blog.body,
    catId,
  );
}

db.prepare(
  "INSERT INTO landing_content (id, data) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = datetime('now')",
).run(JSON.stringify(landing));

db.prepare(
  `UPDATE ad_slots SET is_active = 1, image_url = ?, link_url = ?
   WHERE slot_code = 'TOP_BANNER'`,
).run(
  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=728&h=90&fit=crop",
  "https://example.com",
);

console.log("Done! Open http://localhost:5173 and refresh.");
console.log("Navbar:", navbarItems.length, "| Pages:", pages.length, "| Blogs:", blogs.length);
