import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api, type CategoryRecord } from "../../lib/api";

interface Props {
  darkMode: boolean;
}

export function CategoryCards({ darkMode }: Props) {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);

  useEffect(() => {
    api.publicCategories().then(setCategories).catch(() => {});
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className={`py-10 ${darkMode ? "bg-gray-900" : "bg-white"}`} dir="rtl">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <h2 className="text-xl font-black mb-8" style={{ color: "#1673B8", fontFamily: "Cairo, sans-serif" }}>
          التصنيفات
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/categories/${cat.slug}`}
              className="flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-1"
              style={{
                borderColor: darkMode ? "#374151" : "#e5e7eb",
                backgroundColor: darkMode ? "#1f2937" : "#fff",
              }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center">
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl text-gray-400">📂</span>
                )}
              </div>
              <span
                className="text-sm font-bold text-center line-clamp-2"
                style={{ fontFamily: "Cairo, sans-serif", color: darkMode ? "#e5e7eb" : "#1f2937" }}
              >
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
