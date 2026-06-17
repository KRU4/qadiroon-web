import { useEffect, useState, useRef } from "react";
import { usePublicDataContext } from "../../context/PublicDataContext";

interface Props {
  darkMode: boolean;
}

export function PartnersAdsCarousel({ darkMode }: Props) {
  const { ads } = usePublicDataContext();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const carouselItems = ads.filter((a) =>
    ["BETWEEN_NEWS_BOX_2", "BETWEEN_NEWS_BOX_3", "SIDEBAR_300x600"].includes(a.slot_code)
  );

  useEffect(() => {
    if (carouselItems.length < 2 || paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    const tick = () => {
      setProgress((p) => {
        if (p >= 100) {
          setActive((a) => (a + 1) % carouselItems.length);
          return 0;
        }
        return p + 2;
      });
    };
    intervalRef.current = setInterval(tick, 60);
    return () => clearInterval(intervalRef.current);
  }, [carouselItems.length, paused]);

  if (carouselItems.length === 0) return null;

  return (
    <section className={`py-10 ${darkMode ? "bg-gray-900" : "bg-white"}`} dir="rtl">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 text-center">
        <span
          className="inline-block text-sm font-bold px-4 py-1.5 rounded-full mb-6"
          style={{
            backgroundColor: darkMode ? "#1f2937" : "#f3f4f6",
            color: "#1673B8",
            fontFamily: "Cairo, sans-serif",
          }}
        >
          شركاؤنا والإعلانات
        </span>

        <div
          className="relative flex items-center justify-center gap-4 overflow-hidden py-6"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          style={{ minHeight: "320px" }}
        >
          {carouselItems.map((item, i) => {
            const offset = i - active;
            const isCenter = offset === 0;
            const scale = isCenter ? 1 : 0.8;
            const opacity = isCenter ? 1 : 0.4;
            const zIndex = isCenter ? 10 : 0;
            return (
              <div
                key={item.slot_code + "-" + i}
                className="transition-all duration-500 absolute"
                style={{
                  transform: `translateX(${offset * 120}%) scale(${scale})`,
                  opacity,
                  zIndex,
                }}
              >
                <div
                  className="rounded-2xl border bg-white shadow-lg overflow-hidden flex flex-col items-center justify-center p-4"
                  style={{ width: "250px", height: "300px" }}
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.label || ""}
                      className="w-full h-48 object-contain mb-3"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300 mb-3">
                      <span className="text-2xl">📢</span>
                    </div>
                  )}
                  <p className="text-sm font-bold text-gray-700" style={{ fontFamily: "Cairo, sans-serif" }}>
                    {item.label || `إعلان — ${item.slot_code}`}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1" style={{ fontFamily: "Cairo, sans-serif" }}>
                    {item.width} × {item.height}
                  </p>
                  <p className="text-[9px] text-gray-300 mt-1" style={{ fontFamily: "Cairo, sans-serif" }}>
                    إعلان مباشر / Google AdSense
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dots + progress */}
        <div className="flex flex-col items-center gap-2 mt-4">
          <div className="flex gap-2">
            {carouselItems.map((_, i) => (
              <button
                key={i}
                onClick={() => { setActive(i); setProgress(0); }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === active ? "bg-blue-600 w-6" : "bg-gray-300"
                }`}
                aria-label={`إعلان ${i + 1}`}
              />
            ))}
          </div>
          <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
