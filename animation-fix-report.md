# تقرير مشكلة الأنيميشن في لاندنج بيج قادرون

## المشكلة

كل أنيميشنات اللاندنج بيج اختفت فجأة بعد آخر تحديث. العناصر كانت بتظهر مباشرة بدون أي حركة scroll animation أو fade-in effects.

## التشخيص

### السبب الجذري: SplashIntro بيحجب IntersectionObserver

الشاشة الافتتاحية `SplashIntro` بتغطي الصفحة بالكامل بـ `z-[9999]` لمدة 4.2 ثانية.

```
تسلسل المشكلة:
1. الصفحة تتحمل → المحتوى كله يترندر
2. SplashIntro يظهر فوق المحتوى (z-[9999])
3. useScrollAnimation يبدأ IntersectionObserver
4. الـ observer يشوف كل العناصر في الـ viewport (محجوبة ورا الـ splash)
5. يضيف is-visible لكل العناصر فوراً
6. الأنيميشن يخلص والمستخدم ما شافوش
7. بعد 4.2 ثانية → الـ splash يختفي → كل العناصر ظاهرة بدون أنيميشن
```

### أسباب إضافية

- **LatestNews.tsx**: بس أول 3 كروت كان عندها `animate-on-scroll` class، باقي الكروت كانت ناقصة
- **SplashIntro.tsx**: استخدام `Math.random()` مباشرة في الـ render كان بيخلي قيم الـ particles تتغير مع كل re-render
- **أقسام محذوفة**: آخر commit حذف أقسام كتير (JobsSection, ServicesSection, SuccessStories, VideosSection, EventsSection, Newsletter, AdMarquee3D, DynamicNavBar) اللي كان فيهم أنيميشناتهم الخاصة

## الحل

### 1. إنشاء AnimationContext

ملف جديد `src/context/AnimationContext.tsx` للتحكم في توقيت بدء الأنيميشن:

```tsx
const AnimationContext = createContext<AnimationContextValue>({
  enabled: false,        // الأنيميشن معطلة افتراضياً
  enable: () => {},      // تتشغل بعد ما الـ splash يخلص
});
```

### 2. تعديل useScrollAnimation hook

إضافة اعتماد على AnimationContext — مش بيبدأ الـ IntersectionObserver إلا لما `enabled` يكون `true`:

```tsx
export function useScrollAnimation(variant) {
  const { enabled } = useAnimationContext();

  useEffect(() => {
    if (!enabled) return;  // ما يبدأش غير بعد splah
    // ... IntersectionObserver logic
  }, [variant, enabled]);  // enabled كـ dependency
}
```

### 3. ربط SplashIntro بالـ AnimationContext

في `App.tsx`:
```tsx
const { enable: enableAnimations } = useAnimationContext();

// لما الـ splash يخلص → شغل الأنيميشن
<SplashIntro onComplete={() => {
  setShowSplash(false);
  enableAnimations();    // يشغل الأنيميشن بعد splash
}} />
```

### 4. إصلاح LatestNews

إضافة `animate-on-scroll` و `data-stagger-index` لكل كروت الأخبار مش بس أول 3:

```tsx
// كل الكروت بقى عندها animate-on-scroll
className="animate-on-scroll rounded-2xl overflow-hidden border ..."
data-stagger-index={i}
```

### 5. تثبيت قيم SplashIntro العشوائية

استبدال `Math.random()` المباشر في الـ render بـ `useMemo`:

```tsx
const particles = useMemo(() =>
  Array.from({ length: 18 }, (_, i) => ({
    width: Math.random() * 80 + 20,
    height: Math.random() * 80 + 20,
    // ... etc
  })), []);
```

## الملفات المعدلة

| الملف | التعديل |
|-------|---------|
| `src/context/AnimationContext.tsx` | ملف جديد — context للتحكم في توقيت الأنيميشن |
| `src/app/components/ui/use-scroll-animation.ts` | إضافة check للـ AnimationContext |
| `src/app/App.tsx` | استدعاء enableAnimations بعد splash |
| `src/Router.tsx` | تغليف الـ routes بـ AnimationProvider |
| `src/app/components/LatestNews.tsx` | إضافة animate-on-scroll لكل الكروت الناقصة |
| `src/app/components/SplashIntro.tsx` | تثبيت القيم العشوائية بـ useMemo |

## ملاحظات

- الـ CSS بتاع الأنيميشن (في `src/styles/theme.css`) سليم ومتغيرش
- الـ @media `prefers-reduced-motion: reduce` شغال ومحترم
- الأقسام المحذوفة (JobsSection, ServicesSection...إلخ) محتاجة ترجع لو عايز كل الأنيميشنات الأصلية
