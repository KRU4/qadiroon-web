import { Clock, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { AdBanner } from "./AdBanner";
import { useScrollAnimation } from "./ui/use-scroll-animation";
import { usePublicDataContext } from "../../context/PublicDataContext";

interface LatestNewsProps {
  darkMode: boolean;
}

export function LatestNews({ darkMode }: LatestNewsProps) {
  const { blogs } = usePublicDataContext();
  const sectionRef = useScrollAnimation("news");
  const bg = darkMode ? "bg-gray-950" : "bg-gray-50";

  if (blogs.length === 0) return null;

  const batch1 = blogs.slice(0, 6);
  const batch2 = blogs.slice(6, 9);

  return (
    <section ref={sectionRef} className={`py-10 ${bg}`} dir="rtl">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between mb-7">
          <h2
            className="section-title animate-on-scroll"
            data-stagger-index={0}
            style={{ color: "#1673B8", fontFamily: "Cairo, sans-serif" }}
          >
            آخر الأخبار
          </h2>
          <Link
            to="/blogs"
            className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl border-2 transition-all hover:gap-2"
            style={{ borderColor: "#1673B8", color: "#1673B8", fontFamily: "Cairo, sans-serif" }}
          >
            عرض الكل <ArrowLeft size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
          {batch1.slice(0, 3).map((n, i) => (
            <Link
              key={n.id}
              to={`/blogs/${n.slug}`}
              className={`animate-on-scroll rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl transition-all ${
                darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"
              }`}
              data-stagger-index={i}
            >
              {n.cover_image && (
                <img src={n.cover_image} alt={n.title} className="w-full h-48 object-cover" loading="lazy" />
              )}
              <div className="p-5">
                <span className="text-xs text-blue-600 font-bold">{n.category_name}</span>
                <h3 className="font-black mt-1 line-clamp-2">{n.title}</h3>
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{n.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>

        {batch1.length > 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {batch1.slice(3, 6).map((n, i) => (
              <Link
                key={n.id}
                to={`/blogs/${n.slug}`}
                className={`animate-on-scroll flex gap-4 rounded-2xl border p-4 hover:shadow-md ${
                  darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"
                }`}
                data-stagger-index={i + 3}
              >
                {n.cover_image && (
                  <img src={n.cover_image} alt="" className="w-24 h-20 rounded-xl object-cover flex-shrink-0" loading="lazy" />
                )}
                <div>
                  <h4 className="text-sm font-bold line-clamp-2">{n.title}</h4>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock size={10} />
                    {n.published_at?.slice(0, 10)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="flex justify-center mb-8 animate-on-scroll">
          <AdBanner slotCode="BETWEEN_NEWS_BOX_1" type="leaderboard" darkMode={darkMode} />
        </div>

        {batch2.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {batch2.map((n, i) => (
              <Link
                key={n.id}
                to={`/blogs/${n.slug}`}
                className={`animate-on-scroll rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl ${
                  darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"
                }`}
                data-stagger-index={i + 6}
              >
                {n.cover_image && (
                  <img src={n.cover_image} alt="" className="w-full h-40 object-cover" loading="lazy" />
                )}
                <div className="p-4">
                  <h3 className="font-bold line-clamp-2 text-sm">{n.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
