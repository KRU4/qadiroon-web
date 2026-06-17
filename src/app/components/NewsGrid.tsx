import { useState } from "react";
import { Link } from "react-router";
import { Clock, Eye, MessageCircle } from "lucide-react";
import { usePublicDataContext } from "../../context/PublicDataContext";
import { AdSlotPlaceholder } from "./AdSlotPlaceholder";
import { useScrollAnimation } from "./ui/use-scroll-animation";

const PAGE_SIZE = 6;

const categoryColors: Record<string, string> = {
  "صحة": "bg-pink-500",
  "تكنولوجيا": "bg-green-500",
  "أخبار": "bg-blue-700",
  "رياضة": "bg-orange-500",
  "ترفيه": "bg-purple-500",
};

interface Props {
  darkMode: boolean;
}

export function NewsGrid({ darkMode }: Props) {
  const { blogs } = usePublicDataContext();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sectionRef = useScrollAnimation("news");

  if (blogs.length === 0) return null;

  const displayed = blogs.slice(0, visible);
  const hasMore = visible < blogs.length;

  return (
    <section ref={sectionRef} className={`py-10 ${darkMode ? "bg-gray-950" : "bg-gray-50"}`} dir="rtl">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <h2 className="section-title text-xl font-black mb-8 animate-on-scroll" style={{ color: "#1673B8", fontFamily: "Cairo, sans-serif" }}>
          آخر الأخبار
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
          {displayed.map((b, i) => {
            const catName = b.category_name || "";
            const badgeColor = categoryColors[catName] || "bg-blue-600";
            return (
              <Link
                key={b.id}
                to={`/blogs/${b.slug}`}
                className={`animate-on-scroll rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl transition-all group ${
                  darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"
                }`}
                data-stagger-index={i}
              >
                <div className="relative h-48 overflow-hidden">
                  {b.cover_image ? (
                    <img
                      src={b.cover_image}
                      alt={b.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className={`w-full h-full ${darkMode ? "bg-gray-800" : "bg-gray-200"} flex items-center justify-center text-gray-400 text-sm`}>
                      لا توجد صورة
                    </div>
                  )}
                  {catName && (
                    <span
                      className={`absolute top-3 right-3 text-white text-xs font-bold px-2.5 py-1 rounded-full ${badgeColor}`}
                      style={{ fontFamily: "Cairo, sans-serif" }}
                    >
                      {catName}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3
                    className="font-bold line-clamp-2 mb-2"
                    style={{ fontFamily: "Cairo, sans-serif" }}
                  >
                    {b.title}
                  </h3>
                  <p
                    className={`text-sm line-clamp-2 mb-3 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                    style={{ fontFamily: "Cairo, sans-serif" }}
                  >
                    {b.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Eye size={12} /> {b.view_count ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={12} /> 0
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {b.published_at
                        ? (() => {
                            const diff = Date.now() - new Date(b.published_at).getTime();
                            const hours = Math.floor(diff / 3600000);
                            return hours < 24 ? `منذ ${hours} ساعات` : `منذ ${Math.floor(hours / 24)} أيام`;
                          })()
                        : ""}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* In-content ad slot */}
        <div className="mb-6">
          <AdSlotPlaceholder slotCode="BETWEEN_NEWS_BOX_1" />
        </div>

        {hasMore && (
          <div className="text-center">
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="text-sm font-bold px-6 py-3 rounded-xl border-2 transition-all hover:bg-blue-50"
              style={{ borderColor: "#1673B8", color: "#1673B8", fontFamily: "Cairo, sans-serif" }}
            >
              تحميل المزيد من الأخبار
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
