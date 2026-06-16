# Qadiroon Website — Redesign & Enhancement Prompt for Cursor

## Context & Vision

منصة "قادرون" هي منصة إخبارية وخدمية لذوي الإعاقة. الموقع يعتمد نظام **Entire Page Boxed Layout** (المحتوى محاط بحدود والـ Edges الجانبية مرئية). المنافس الرئيسي هو موقع **Jassour** الكويتي الذي يتميز بـ Hero ودخول مرئي قوي.

الهدف: تحديث الموقع ليكون **Professional + Modern + Memorable** مع الحفاظ على الطابع الكلاسيكي البسيط الحالي، وإضافة عناصر تفاعلية تجعل الزائر يحس أنه في موقع مختلف.

---

## التعديل 1 — Hero Section (الدخول / الـ Intro)

### المشكلة
الـ Hero الحالي عادي ولا يعطي انطباعاً قوياً مقارنة بمنافس مثل Jassour الذي يستخدم مجلة منفوخة بصرياً وتأثيرات ذات شخصية.

### المطلوب: TV News Mockup Hero

اعمل Hero Section جديد يعتمد فكرة **محطة تلفزيونية إخبارية مصغرة** بداخل الصفحة:

```
┌─────────────────────────────────────────────────────────────┐
│  [شاشة TV بإطار أنيق — داخلها Slider أو Ticker للأخبار]    │
│                                                             │
│  📺  قادرون | نبض الإعاقة العربية                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  [ صورة الخبر الكبيرة + عنوان خبر + تاريخ — Auto Rotate ]  │
│                                                             │
│  [ شريط أسفل الشاشة يجري فيه Ticker بالأخبار العاجلة ]    │
└─────────────────────────────────────────────────────────────┘
```

#### التفاصيل التقنية:
- **TV Frame**: إطار CSS بـ `border-radius` دائري للزوايا، ظل ثقيل (box-shadow)، لون داكن (#1a1a2e أو #0d1b2a) يحاكي إطار تلفزيون حديث
- **الشاشة الداخلية**: تعرض أحدث 5 أخبار بـ **Auto Slider** (تتحرك كل 4 ثوانٍ) — صورة كبيرة + عنوان + تصنيف
- **News Ticker** أسفل الشاشة (داخل الإطار): شريط أحمر أو أزرق داكن مع نص يجري باستمرار يعرض العناوين العاجلة
- **مؤشر تشغيل**: أيقونة صغيرة 🔴 LIVE تومض في الزاوية العلوية اليسرى من الشاشة
- **Antenna أو زخرفة خفيفة** فوق الشاشة (اختياري) لتعزيز الهوية البصرية

#### الخلفية خلف الشاشة (الـ Hero Background):
- **Gradient داكن** من الألوان البراندية للموقع
- أو **Pattern هندسي خفيف** (نقاط أو خطوط) على خلفية داكنة
- يمين/يسار الشاشة: إحصائية أو tagline مثل:
  - `+٥٠٠ خبر شهرياً`
  - `٢٤ ساعة متابعة`
  - `أكبر منصة عربية لذوي الإعاقة`

---

## التعديل 2 — إعلانات الـ Edges (جانبي الـ Boxed Layout)

### المفهوم
بما أن الموقع Boxed، الـ Edges الجانبية (يمين ويسار الـ container) مساحة فارغة. استغلها كمواضع إعلانية.

### المطلوب:

#### أ) Marquee Vertical Ads (على الجانبين):
- عمودان إعلانيان ضيقان (عرض ~160px كل منهم) على يمين ويسار الـ container
- كل عمود عبارة عن **Vertical Marquee** — الإعلانات تتحرك للأعلى ببطء (مثل scroll لا نهاية له)
- كل إعلان: صورة + عنوان + رابط
- الحركة تتوقف عند Hover

#### ب) نظام إدارة الإعلانات من الـ Dashboard:
كل موقع إعلاني في الموقع يجب أن يكون:
- **له `slot_code` فريد** (مثال: `LEFT_EDGE_TOP`, `HERO_TICKER`, `BETWEEN_NEWS_BOX_1`)
- **له اسم وصفي** يظهر في لوحة التحكم
- **المحتوى قابل للتعديل من الـ Dashboard** بدون لمس الكود: صورة، رابط، تاريخ انتهاء، حالة (نشط/متوقف)
- إذا لم يكن هناك إعلان نشط في الـ slot → **يُخفى تلقائياً** بدون أن يترك فراغاً

```
// مثال على بنية الـ Ad Slot في الكود
<div class="ad-slot" data-slot="LEFT_EDGE_TOP" data-label="الجانب الأيسر - أعلى">
  <!-- يُملأ ديناميكياً من الـ Dashboard -->
</div>
```

#### ج) Responsive Behavior:
- على الشاشات الأقل من 1280px: الـ Edges تختفي والإعلانات تنتقل لمواضع داخل المحتوى
- على المحمول: إعلانات Horizontal (شريط أفقي) بدلاً من الـ Vertical Marquee

---

## التعديل 3 — 3D Floating Ad Boxes (داخل المحتوى)

### المفهوم
بدلاً من مربعات الإعلانات الـ flat العادية في منتصف الصفحة، نريد شعور **Gallery عائم ثلاثي الأبعاد** يحس الزائر أن الإعلانات "خارجة" من الشاشة.

### المطلوب:

#### تأثير CSS 3D Cards:
```css
/* مثال على التأثير المطلوب */
.ad-3d-box {
  transform-style: preserve-3d;
  perspective: 1000px;
  transition: transform 0.4s ease;
  box-shadow: 
    0 10px 30px rgba(0,0,0,0.2),
    0 1px 8px rgba(0,0,0,0.1);
}

.ad-3d-box:hover {
  transform: rotateY(-5deg) rotateX(3deg) translateZ(20px);
  box-shadow:
    20px 20px 60px rgba(0,0,0,0.3),
    0 5px 15px rgba(0,0,0,0.1);
}
```

#### Layout الإعلانات 3D:
- مجموعة من 2-3 بطاقات إعلانية مرتبة بـ **staggered layout** (مش في صف مستقيم — بتختلف في الارتفاع وزاوية خفيفة)
- كل بطاقة لها ظل عميق يعطي إحساس Depth
- **Parallax خفيف**: البطاقات تتحرك بشكل طفيف مع حركة الماوس (Mouse tracking)

#### الأحجام المقترحة:
- بطاقة كبيرة: `300×250`
- بطاقة متوسطة: `160×600` (شريط جانبي)
- يُحدد من الـ Dashboard أي حجم يُعرض في كل Slot

---

## التعديل 4 — Scroll-Triggered Card Animations (Pop-up عند السكرول)

### المطلوب:
كل كروت الأخبار والخدمات تظهر بـ **animation عند دخولها مجال الرؤية (Viewport)**

#### الأنواع المطلوبة:

**أ) بطاقات الأخبار (News Cards):**
```
Initial State: opacity: 0, transform: translateY(40px)
Final State:   opacity: 1, transform: translateY(0)
Easing:        cubic-bezier(0.25, 0.46, 0.45, 0.94)
Duration:      0.6s
Stagger:       0.1s بين كل بطاقة والتانية
```

**ب) بطاقات الخدمات (Service Cards):**
```
Initial State: opacity: 0, transform: scale(0.9) translateY(20px)
Final State:   opacity: 1, transform: scale(1) translateY(0)
Duration:      0.5s
Stagger:       0.08s
```

**ج) Section Headers:**
```
Initial State: opacity: 0, transform: translateX(30px)
Final State:   opacity: 1, transform: translateX(0)
Duration:      0.4s
```

#### التنفيذ:
استخدم `IntersectionObserver` (لا jQuery) مع class `is-visible` يُضاف عند الدخول:

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('is-visible');
      }, index * 100); // stagger
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
```

#### Reduced Motion Respect:
```css
@media (prefers-reduced-motion: reduce) {
  .animate-on-scroll {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
```

---

## التعديل 5 — إزالة الشريط الجانبي من Section Headers

### المشكلة
كل Section Header أو عنوان قسم في الموقع عليه شريط جانبي أزرق (vertical bar / border-left) يظهر كـ AI-generated أو template.

### المطلوب:
**إزاله الشريط تماماً** من كل الـ Section Headers في الموقع.

#### بديل مقترح (اختر واحد بناءً على الـ Design System الحالي):

**الخيار أ — Underline أنيق:**
```css
.section-title {
  /* إزالة الـ border-left */
  border-left: none;
  padding-left: 0;
  
  /* إضافة underline بالبراند كولور */
  display: inline-block;
  border-bottom: 3px solid var(--brand-color);
  padding-bottom: 4px;
}
```

**الخيار ب — Eyebrow Label:**
```css
.section-title::before {
  content: '—';
  color: var(--brand-color);
  margin-left: 8px; /* RTL */
  font-size: 0.8em;
}
```

**الخيار ج — Bold فقط بدون زخرفة إضافية:**
```css
.section-title {
  border-left: none;
  font-weight: 800;
  font-size: 1.4rem;
  letter-spacing: -0.02em;
}
```

> **ملاحظة:** ابحث في الكود عن أي `.section-title`, `.block-title`, `h2.title`, أو أي class مشابه يحتوي على `border-left` أو `border-right` (RTL) وأزله من كل مكان.

---

## ملاحظات عامة للتنفيذ

### الـ RTL:
- الموقع عربي RTL — كل الـ transforms والـ animations يجب أن تُعكس
- `translateX(30px)` في LTR تصبح `translateX(-30px)` في RTL للعناصر الآتية من اليمين

### الـ Performance:
- استخدم `will-change: transform, opacity` للعناصر المتحركة فقط
- أزله بعد انتهاء الـ animation لتحرير الذاكرة

### الـ Breakpoints:
```
Mobile:  < 768px
Tablet:  768px - 1280px  
Desktop: > 1280px (الـ Boxed Layout يظهر كامل هنا فقط)
```

### أولوية التنفيذ:
1. ✅ إزالة الشريط الجانبي من Headers (أسرع وأأثر)
2. ✅ Scroll Animations على الكروت
3. ✅ TV Hero Mockup
4. ✅ 3D Ad Boxes
5. ✅ Edge Marquee Ads + نظام الـ Dashboard

---

## الـ Files المتوقع تعديلها

```
resources/
├── views/
│   ├── layouts/
│   │   └── app.blade.php         ← Hero section هنا
│   ├── home.blade.php            ← الصفحة الرئيسية
│   └── partials/
│       ├── hero.blade.php        ← TV Hero الجديد
│       ├── ad-slot.blade.php     ← Component الإعلانات
│       └── section-title.blade.php ← Headers بدون شريط
├── css/
│   ├── app.css                   ← Styles الرئيسية
│   ├── hero.css                  ← TV Hero styles
│   ├── animations.css            ← Scroll animations
│   └── ads.css                   ← 3D + Marquee ads
└── js/
    ├── app.js
    ├── hero-slider.js            ← TV Hero slider logic
    ├── scroll-animations.js      ← IntersectionObserver
    └── ad-3d.js                  ← Mouse tracking + 3D effect
```

> إذا كان الـ project يستخدم Vue/React/Inertia بدلاً من Blade، اعمل نفس البنية كـ Components.
