import { Link } from "react-router";
import { usePublicDataContext } from "../../context/PublicDataContext";
import { useScrollAnimation } from "./ui/use-scroll-animation";

interface LandingSpotlightProps {
  darkMode: boolean;
}

export function LandingSpotlight({ darkMode }: LandingSpotlightProps) {
  const { landing } = usePublicDataContext();
  const sectionRef = useScrollAnimation("news");

  const items = [...(landing.spotlight || [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  if (items.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className={`py-10 ${darkMode ? "bg-gray-900" : "bg-white"}`}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <h2
          className="section-title animate-on-scroll mb-8"
          style={{ color: "#1673B8", fontFamily: "Cairo, sans-serif" }}
        >
          أقسام مميزة
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => {
            const isExternal = item.link.startsWith("http");
            const card = (
              <article
                className={`animate-on-scroll rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl transition-all group ${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-100"
                }`}
                data-stagger-index={index}
              >
                {item.image && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3
                    className={`font-black text-lg mb-2 ${darkMode ? "text-gray-100" : "text-gray-900"}`}
                    style={{ fontFamily: "Cairo, sans-serif" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                    style={{ fontFamily: "Cairo, sans-serif" }}
                  >
                    {item.description}
                  </p>
                </div>
              </article>
            );

            if (isExternal) {
              return (
                <a key={item.id} href={item.link} target="_blank" rel="noreferrer">
                  {card}
                </a>
              );
            }

            return (
              <Link key={item.id} to={item.link}>
                {card}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
