import type { ServiceItem } from "../../lib/api";

interface Props {
  darkMode: boolean;
  items: ServiceItem[];
}

export function MostRequestedServices({ darkMode, items }: Props) {
  if (!items || items.length === 0) return null;
  return (
    <section className={`py-10 ${darkMode ? "bg-gray-900" : "bg-white"}`} dir="rtl">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">🔥</span>
          <h2 className="text-xl font-black" style={{ color: "#1673B8", fontFamily: "Cairo, sans-serif" }}>
            الخدمات الأكثر طلباً
          </h2>
        </div>
        <div className="space-y-3 max-w-lg">
          {items.map((item) => (
            <div
              key={item.rank}
              className={`flex items-center gap-4 p-3 rounded-xl ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}
            >
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: item.color, fontFamily: "Cairo, sans-serif" }}
              >
                {item.rank}
              </span>
              <span className="flex-1 font-semibold text-sm" style={{ fontFamily: "Cairo, sans-serif" }}>
                {item.name}
              </span>
              <span className="font-black text-lg" style={{ color: item.color, fontFamily: "Cairo, sans-serif" }}>
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
