import { usePublicDataContext } from "../../context/PublicDataContext";

interface BreakingTickerProps {
  darkMode: boolean;
}

export function BreakingTicker({ darkMode: _darkMode }: BreakingTickerProps) {
  const { landing } = usePublicDataContext();

  const breakingNews = landing.breaking_ticker
    ? landing.breaking_ticker
        .split("|")
        .map((h) => h.trim())
        .filter(Boolean)
    : [];

  if (breakingNews.length === 0) return null;

  return (
    <div
      className="w-full overflow-hidden flex items-center"
      style={{ backgroundColor: "#F6B512" }}
      dir="rtl"
    >
      <div
        className="flex-shrink-0 px-4 py-2.5 font-black text-sm text-white flex items-center gap-2"
        style={{ backgroundColor: "#1673B8", fontFamily: "Cairo, sans-serif" }}
      >
        <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        عاجل
      </div>
      <div className="flex-1 overflow-hidden relative py-2.5">
        <div
          className="flex gap-16 whitespace-nowrap animate-ticker"
          style={{ fontFamily: "Cairo, sans-serif" }}
        >
          {[...breakingNews, ...breakingNews].map((news, i) => (
            <span key={i} className="text-sm font-semibold text-gray-900">
              {news}
              <span className="mx-6 text-gray-600 opacity-40">◆</span>
            </span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 60s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
