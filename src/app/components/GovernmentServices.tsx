import type { GovtServiceItem } from "../../lib/api";
import { Building, ArrowLeft } from "lucide-react";

const badgeColors: Record<string, string> = {
  "جديد": "bg-green-100 text-green-700",
  "الأكثر طلباً": "bg-blue-100 text-blue-700",
  "طوارئ": "bg-red-100 text-red-700",
  "مميز": "bg-purple-100 text-purple-700",
};

interface Props {
  darkMode: boolean;
  services: GovtServiceItem[];
}

export function GovernmentServices({ darkMode, services }: Props) {
  if (!services || services.length === 0) return null;

  return (
    <section className={`py-10 ${darkMode ? "bg-gray-900" : "bg-white"}`} dir="rtl">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black" style={{ color: "#1673B8", fontFamily: "Cairo, sans-serif" }}>
            الخدمات الحكومية وبرامج الدعم
          </h2>
          <button
            className="text-sm font-bold transition-all"
            style={{ color: "#1673B8", fontFamily: "Cairo, sans-serif" }}
          >
            جميع الخدمات
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((svc) => (
            <div
              key={svc.id}
              className={`rounded-2xl border p-5 flex flex-col gap-3 transition-all hover:shadow-lg ${
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
                  {svc.icon}
                </div>
                {svc.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColors[svc.badge] || "bg-gray-100 text-gray-600"}`}
                    style={{ fontFamily: "Cairo, sans-serif" }}
                  >
                    {svc.badge}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-sm mt-1" style={{ fontFamily: "Cairo, sans-serif" }}>
                {svc.title}
              </h3>
              <p
                className={`text-xs leading-relaxed line-clamp-2 flex-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                style={{ fontFamily: "Cairo, sans-serif" }}
              >
                {svc.description}
              </p>
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                <button
                  className="text-xs font-bold flex items-center gap-1 transition-all hover:gap-1.5"
                  style={{ color: "#1673B8", fontFamily: "Cairo, sans-serif" }}
                >
                  تفاصيل <ArrowLeft size={12} />
                </button>
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Building size={10} /> {svc.authority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
