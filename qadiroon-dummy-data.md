# Qadiroon — Dummy Test Data (Arabic)

Ready-to-use Arabic sample content for testing the public site and admin panel locally.

**Instructions are in English. All content values are in Arabic.**

---

## Prerequisites

1. Start both servers from the project root:

```bash
npm run dev:server   # API → http://localhost:3001
npm run dev          # Frontend → http://localhost:5173
```

2. Default admin login:

| Field    | Value                 |
|----------|-----------------------|
| Email    | `admin@qadiroon.com`  |
| Password | `Admin@1234`          |

3. Admin panel: http://localhost:5173/admin  
4. Public site: http://localhost:5173

---

## Method 1 — One-command seed (recommended)

Copy the script below into `server/seed-dummy-data.js`, then run:

```bash
node server/seed-dummy-data.js
```

Refresh the public site (`Ctrl+Shift+R`) to see all content.

<details>
<summary><strong>Click to expand: full seed script</strong></summary>

Save this as `server/seed-dummy-data.js`:

```javascript
#!/usr/bin/env node
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
    tags: ["توظيف", "دعم حكومي"],
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
    tags: ["تكنولوجيا", "لغة الإشارة"],
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
    tags: ["تعليم", "تأهيل"],
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
console.log("Navbar items:", navbarItems.length);
console.log("Pages:", pages.length);
console.log("Blogs:", blogs.length);
console.log("Categories:", categories.length);
```

</details>

### To clear dummy data later

```bash
node server/reset-content.js
```

---

## Method 2 — Manual copy-paste via Admin UI

Use this if you prefer entering data by hand in the admin panel.

### Step 1 — Navbar (`/admin/navbar`)

Add each row (copy **Label** and **Slug** exactly):

| Order | Label (Arabic) | Slug |
|------:|----------------|------|
| 1 | الرئيسية | `/` |
| 2 | الأخبار | `/blogs` |
| 3 | الخدمات | `/pages/services` |
| 4 | الوظائف | `/pages/jobs` |
| 5 | من نحن | `/pages/about` |

After adding each item (except Home and News), click **Edit page** on that row and paste the page content from [Step 3](#step-3--page-content-html).

> **Slug rules:** `/` = home, `/blogs` = blog list, `/pages/foo` = dynamic page at `/pages/foo`.

---

### Step 2 — Categories (`/admin/categories`)

| Name (Arabic) | Slug | Description (Arabic) |
|---------------|------|----------------------|
| أخبار عامة | `general-news` | آخر الأخبار والتطورات |
| تكنولوجيا مساعدة | `assistive-tech` | أجهزة وتقنيات مساعدة |
| تعليم وتدريب | `education` | برامج تعليمية وتأهيلية |

---

### Step 3 — Page content (HTML)

Paste into the rich-text editor when editing a navbar-linked page. Set **Published** to ON and save.

#### Page: الخدمات (`slug: services`)

```html
<h2>الخدمات المتاحة</h2>
<p>نوفر دليلاً شاملاً للخدمات الحكومية والخاصة المتاحة للفئات الخاصة، بما في ذلك:</p>
<ul>
<li>البطاقة الوطنية للفئات الخاصة</li>
<li>برامج الدعم المالي للأسر</li>
<li>خدمات التأهيل المهني والتدريب</li>
<li>إعفاءات الجمارك للأجهزة المساعدة</li>
</ul>
<p>للاستفسار تواصل معنا عبر صفحة <strong>من نحن</strong>.</p>
```

#### Page: الوظائف (`slug: jobs`)

```html
<h2>فرص العمل</h2>
<p>نُدرج هنا أحدث فرص العمل المكيّفة والمخصصة للفئات الخاصة في مختلف القطاعات.</p>
<p>تابع قسم <strong>الأخبار</strong> للاطلاع على آخر الإعلانات الوظيفية.</p>
```

#### Page: من نحن (`slug: about`)

```html
<h2>عن منصة قادرون</h2>
<p>قادرون منصة إعلامية وخدمية عربية متخصصة في شؤون الفئات الخاصة ومجتمعها.</p>
<p>رسالتنا: <em>تمكين كل فرد من الوصول إلى المعلومة والخدمة بكرامة وسهولة.</em></p>
```

---

### Step 4 — Landing page (`/admin/landing`)

#### Hero & stats

| Field | Value (Arabic) |
|-------|----------------|
| Hero title | `نبض الأخبار العربية` |
| Hero subtitle | `منصة إخبارية وخدمية متخصصة للفئات الخاصة` |
| Stat 1 value | `+٥٠٠` |
| Stat 1 label | `خبر شهرياً` |
| Stat 2 value | `٢٤` |
| Stat 2 label | `ساعة متابعة` |
| Stat 3 value | `الأولى` |
| Stat 3 label | `أكبر منصة عربية إخبارية` |

#### Breaking ticker

Paste this single line (items separated by `|`):

```
وزارة التنمية الاجتماعية تُطلق برنامجاً جديداً لدعم الأسر|مبادرة قادرون تُحقق نتائج مذهلة: توظيف ٣٠٠٠ شخص|تقنية جديدة تُحدث ثورة في التواصل الرقمي|مؤتمر دولي لإمكانية الوصول الرقمي ينعقد في الرياض
```

#### About section (HTML)

```html
<p>منصة <strong>قادرون</strong> هي منصة إخبارية وخدمية عربية تهدف إلى تمكين المجتمع وتقديم أخبار وخدمات متخصصة بأسلوب احترافي وعصري.</p>
<p>نؤمن بأن كل إنسان قادر على تحقيق أحلامه عندما تتوفر له الفرص والدعم المناسب.</p>
```

#### Spotlight cards (add 3 items)

| Title | Description | Link | Image URL |
|-------|-------------|------|-----------|
| الخدمات الحكومية | دليل شامل للخدمات المتاحة للفئات الخاصة وذوي الإعاقة | `/pages/services` | `https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop` |
| فرص العمل | أحدث الوظائف المخصصة والمكيّفة في القطاعين العام والخاص | `/pages/jobs` | `https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=400&fit=crop` |
| قصص النجاح | إلهام من تجارب حقيقية لأشخاص حققوا إنجازات استثنائية | `/blogs` | `https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop` |

Click **Save** at the bottom.

---

### Step 5 — Blog posts (`/admin/blogs`)

Create 3 posts. **Publishing requires a cover image URL and alt text.**

#### Blog 1

| Field | Value |
|-------|-------|
| Title | `إطلاق برنامج وطني جديد لدعم التوظيف المكيّف` |
| Slug | `national-employment-program` |
| Category | أخبار عامة |
| Excerpt | `وزارة الموارد البشرية تُعلن عن برنامج شامل يستهدف توظيف ١٠٠٠٠ شخص من الفئات الخاصة خلال عامين.` |
| Cover image URL | `https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=450&fit=crop` |
| Cover alt text | `اجتماع عمل في مكتب حديث` |
| Tags | `توظيف`, `دعم حكومي` |
| Published | ✅ ON |

**Body (HTML):**

```html
<h2>تفاصيل البرنامج</h2>
<p>أعلنت وزارة الموارد البشرية والتنمية الاجتماعية عن إطلاق برنامج وطني جديد يهدف إلى دعم التوظيف المكيّف للفئات الخاصة في القطاعين العام والخاص.</p>
<h3>أهداف البرنامج</h3>
<ul>
<li>توفير ١٠٠٠٠ فرصة عمل مكيّفة خلال ٢٤ شهراً</li>
<li>تقديم حوافز للشركات التي توظّف بنسبة ٥٪ على الأقل</li>
<li>برامج تدريب مهني مجانية بالشراكة مع الجامعات</li>
</ul>
<p>يُتوقع أن يبدأ التسجيل في البرنامج خلال الشهر القادم عبر البوابة الإلكترونية الموحدة.</p>
```

#### Blog 2

| Field | Value |
|-------|-------|
| Title | `تقنية جديدة للترجمة الفورية بلغة الإشارة` |
| Slug | `sign-language-ai` |
| Category | تكنولوجيا مساعدة |
| Excerpt | `شركة سعودية ناشئة تُطوّر نظام ذكاء اصطناعي يترجم لغة الإشارة العربية في الوقت الفعلي.` |
| Cover image URL | `https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=450&fit=crop` |
| Cover alt text | `شاشة تعرض تقنية ذكاء اصطناعي` |
| Tags | `تكنولوجيا`, `لغة الإشارة` |
| Published | ✅ ON |

**Body (HTML):**

```html
<h2>كيف تعمل التقنية؟</h2>
<p>يعتمد النظام على كاميرا عادية وخوارزميات رؤية حاسوبية مدربة على لغة الإشارة العربية الموحدة.</p>
<h3>مجالات الاستخدام</h3>
<ul>
<li>المستشفيات والعيادات</li>
<li>الجامعات والمدارس</li>
<li>مراكز الخدمة الحكومية</li>
</ul>
<p>التجربة التجريبية متاحة حالياً في ثلاث مدن سعودية.</p>
```

#### Blog 3

| Field | Value |
|-------|-------|
| Title | `مبادرة تعليمية لتأهيل ٥٠٠٠ طالب وطالبة` |
| Slug | `education-initiative-5000` |
| Category | تعليم وتدريب |
| Excerpt | `شراكة بين وزارة التعليم ومنظمات المجتمع المدني لتوفير برامج تأهيل رقمي مجانية.` |
| Cover image URL | `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=450&fit=crop` |
| Cover alt text | `طلاب في فصل دراسي` |
| Tags | `تعليم`, `تأهيل` |
| Published | ✅ ON |

**Body (HTML):**

```html
<h2>محتوى البرنامج</h2>
<p>يشمل البرنامج دورات في المهارات الرقمية، واللغة الإنجليزية، والتأهيل المهني الأساسي.</p>
<p>التسجيل مفتوح لجميع الفئات العمرية من ١٨ إلى ٣٥ سنة.</p>
```

---

### Step 6 — Ads (optional, `/admin/ads`)

Edit slot **TOP_BANNER**:

| Field | Value |
|-------|-------|
| Image URL | `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=728&h=90&fit=crop` |
| Link URL | `https://example.com` |
| Active | ✅ ON |

> Ads only appear on the public site when **both** `is_active = 1` **and** an image URL is set.

---

## Method 3 — Landing JSON (API / devtools)

If you want to paste the full landing object at once, use this JSON in **Admin → Landing** (or send `PUT /api/admin/landing` while logged in):

```json
{
  "hero_title": "نبض الأخبار العربية",
  "hero_subtitle": "منصة إخبارية وخدمية متخصصة للفئات الخاصة",
  "stats": [
    { "value": "+٥٠٠", "label": "خبر شهرياً" },
    { "value": "٢٤", "label": "ساعة متابعة" },
    { "value": "الأولى", "label": "أكبر منصة عربية إخبارية" }
  ],
  "breaking_ticker": "وزارة التنمية الاجتماعية تُطلق برنامجاً جديداً لدعم الأسر|مبادرة قادرون تُحقق نتائج مذهلة: توظيف ٣٠٠٠ شخص|تقنية جديدة تُحدث ثورة في التواصل الرقمي|مؤتمر دولي لإمكانية الوصول الرقمي ينعقد في الرياض",
  "spotlight": [
    {
      "id": "sp-1",
      "title": "الخدمات الحكومية",
      "description": "دليل شامل للخدمات المتاحة للفئات الخاصة وذوي الإعاقة",
      "image": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
      "link": "/pages/services",
      "sort_order": 0
    },
    {
      "id": "sp-2",
      "title": "فرص العمل",
      "description": "أحدث الوظائف المخصصة والمكيّفة في القطاعين العام والخاص",
      "image": "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=400&fit=crop",
      "link": "/pages/jobs",
      "sort_order": 1
    },
    {
      "id": "sp-3",
      "title": "قصص النجاح",
      "description": "إلهام من تجارب حقيقية لأشخاص حققوا إنجازات استثنائية",
      "image": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop",
      "link": "/blogs",
      "sort_order": 2
    }
  ],
  "about_content": "<p>منصة <strong>قادرون</strong> هي منصة إخبارية وخدمية عربية تهدف إلى تمكين المجتمع وتقديم أخبار وخدمات متخصصة بأسلوب احترافي وعصري.</p><p>نؤمن بأن كل إنسان قادر على تحقيق أحلامه عندما تتوفر له الفرص والدعم المناسب.</p>"
}
```

---

## What you should see after seeding

| Area | Expected result |
|------|-----------------|
| Header navbar | 5 Arabic links |
| Breaking ticker | Yellow bar with scrolling Arabic headlines |
| Hero (TV section) | Rotating blog slides + stats |
| Spotlight | 3 cards |
| Latest news | 3 blog cards |
| About section | Arabic HTML paragraph |
| `/pages/services` | Services page content |
| `/pages/jobs` | Jobs page content |
| `/pages/about` | About page content |
| `/blogs` | 3 published posts |
| Top banner ad | Image banner (if ad slot activated) |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Navbar empty after adding items | Hard-refresh the public site (`Ctrl+Shift+R`) |
| Blog won't publish | Add both cover image URL **and** alt text |
| Page 404 | Ensure page slug matches URL (`/pages/services` → slug `services`) and **Published** is ON |
| Breaking ticker missing | `breaking_ticker` must not be empty; items separated by `\|` |
| Ads not showing | Slot must be active **and** have an `image_url` |
| Seed script error | Make sure `npm run dev:server` is stopped, run seed, then restart server |

---

## File reference

| File | Purpose |
|------|---------|
| `qadiroon-dummy-data.md` | This guide + all copy-paste data |
| `server/seed-dummy-data.js` | Optional — save script from Method 1 |
| `server/reset-content.js` | Clears all content back to empty |
