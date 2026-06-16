import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Link } from "react-router";
import { useScrollAnimation } from "./ui/use-scroll-animation";
import { usePublicDataContext } from "../../context/PublicDataContext";

interface HeroSectionProps {
  darkMode: boolean;
}

export function HeroSection({ darkMode }: HeroSectionProps) {
  const { landing, blogs } = usePublicDataContext();
  const [activeSlide, setActiveSlide] = useState(0);
  const sectionRef = useScrollAnimation("header");

  const stats = (landing.stats ?? []).filter((s) => s.value?.trim() || s.label?.trim());
  const heroTagline = landing.hero_title?.trim();
  const heroSubtitle = landing.hero_subtitle?.trim();
  const slides = blogs.slice(0, 5).map((b) => ({
    id: b.id,
    title: b.title,
    image: b.cover_image || "",
    date: b.published_at?.slice(0, 10) ?? "",
    category: b.category_name || "أخبار",
    slug: b.slug,
  }));

  const hasHeroContent =
    heroTagline || heroSubtitle || stats.length > 0 || slides.length > 0;

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!hasHeroContent) return null;

  const current = slides[activeSlide];

  return (
    <section ref={sectionRef} className="py-6" dir="rtl">
      {(heroTagline || stats.length > 0) && (
        <div className="animate-on-scroll animate-header mb-5">
          <h2
            className="section-title"
            style={{ color: "#1673B8", fontFamily: "Cairo, sans-serif" }}
          >
            {heroTagline || "أبرز الأخبار"}
          </h2>
        </div>
      )}

      <div className="tv-hero-bg rounded-3xl p-6 md:p-8 lg:p-10">
        <div className="relative z-10 flex flex-col xl:flex-row items-center gap-6 xl:gap-10">
          {stats.length > 0 && (
            <div className="hidden xl:flex flex-col gap-4 flex-shrink-0 text-right">
              {stats.slice(0, 2).map((stat) => (
                <div key={stat.label} className="text-white">
                  <div
                    className="text-2xl font-black"
                    style={{ fontFamily: "Cairo, sans-serif", color: "#7AC143" }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-sm text-white/70"
                    style={{ fontFamily: "Cairo, sans-serif" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {slides.length > 0 && current && (
            <div className="flex-1 w-full max-w-3xl mx-auto relative">
              <div className="tv-antenna" aria-hidden="true" />
              <div className="tv-frame">
                <div
                  className="flex items-center justify-between px-4 py-2 mb-2 rounded-t-lg"
                  style={{ background: "#0a0a14" }}
                >
                  <div
                    className="flex items-center gap-2 text-white text-sm font-bold"
                    style={{ fontFamily: "Cairo, sans-serif" }}
                  >
                    <span>📺</span>
                    <span style={{ color: "#7AC143" }}>قادرون</span>
                    {heroTagline && (
                      <>
                        <span className="text-white/50">|</span>
                        <span className="text-white/80">{heroTagline}</span>
                      </>
                    )}
                  </div>
                  <div
                    className="tv-live-badge flex items-center gap-1.5 text-xs font-bold text-white px-2 py-1 rounded"
                    style={{ background: "#c0392b" }}
                  >
                    <span className="w-2 h-2 rounded-full bg-white" />
                    LIVE
                  </div>
                </div>

                <div className="tv-screen">
                  <Link to={`/blogs/${current.slug}`} className="block">
                    <div
                      key={current.id}
                      className="tv-slide-enter relative"
                      style={{ height: "280px" }}
                    >
                      {current.image ? (
                        <img
                          src={current.image}
                          alt={current.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white/50 text-sm">
                          لا توجد صورة
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute bottom-0 right-0 left-0 p-5">
                        <h3
                          className="text-white text-lg md:text-xl font-black leading-snug line-clamp-2 mb-2"
                          style={{ fontFamily: "Cairo, sans-serif" }}
                        >
                          {current.title}
                        </h3>
                        {current.date && (
                          <div
                            className="flex items-center gap-1 text-white/70 text-xs"
                            style={{ fontFamily: "Cairo, sans-serif" }}
                          >
                            <Clock size={12} />
                            {current.date}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>

                  {slides.length > 1 && (
                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {slides.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveSlide(i)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            i === activeSlide ? "bg-white w-5" : "bg-white/40"
                          }`}
                          aria-label={`خبر ${i + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {(stats[2] || heroSubtitle) && (
            <div className="hidden xl:flex flex-col gap-4 flex-shrink-0 text-right">
              {stats[2] && (
                <div className="text-white">
                  <div
                    className="text-2xl font-black"
                    style={{ fontFamily: "Cairo, sans-serif", color: "#F6B512" }}
                  >
                    {stats[2].value}
                  </div>
                  <div
                    className="text-sm text-white/70"
                    style={{ fontFamily: "Cairo, sans-serif" }}
                  >
                    {stats[2].label}
                  </div>
                </div>
              )}
              {heroSubtitle && (
                <p
                  className="text-sm text-white/60 max-w-[140px] leading-relaxed"
                  style={{ fontFamily: "Cairo, sans-serif" }}
                >
                  {heroSubtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {stats.length > 0 && (
          <div className="flex xl:hidden justify-center gap-8 mt-6 relative z-10">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center text-white">
                <div
                  className="text-lg font-black"
                  style={{ fontFamily: "Cairo, sans-serif", color: "#7AC143" }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-xs text-white/70"
                  style={{ fontFamily: "Cairo, sans-serif" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
