import type { PollData } from "../../lib/api";

interface Props {
  darkMode: boolean;
  poll: PollData;
}

export function WeeklyPoll({ darkMode, poll }: Props) {
  if (!poll || !poll.question || (poll.options || []).length === 0) return null;

  return (
    <section className={`py-10 ${darkMode ? "bg-gray-950" : "bg-gray-50"}`} dir="rtl">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">📊</span>
          <h2 className="text-xl font-black" style={{ color: "#1673B8", fontFamily: "Cairo, sans-serif" }}>
            استطلاع الأسبوع
          </h2>
        </div>
        <p className="text-sm text-gray-500 mb-4" style={{ fontFamily: "Cairo, sans-serif" }}>
          {poll.question}
        </p>
        <div className="space-y-3 max-w-lg">
          {poll.options.map((opt) => (
            <div
              key={opt.label}
              className={`rounded-full h-10 overflow-hidden relative ${darkMode ? "bg-gray-800" : "bg-gray-200"}`}
            >
              <div
                className="absolute inset-y-0 right-0 rounded-full transition-all"
                style={{ width: `${opt.percent}%`, backgroundColor: "#7AC143", opacity: 0.3 }}
              />
              <div className="absolute inset-0 flex items-center justify-between px-4">
                <span className="text-sm font-bold" style={{ fontFamily: "Cairo, sans-serif" }}>
                  {opt.percent}%
                </span>
                <span className="text-sm" style={{ fontFamily: "Cairo, sans-serif" }}>
                  {opt.label}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3" style={{ fontFamily: "Cairo, sans-serif" }}>
          {(poll.totalVotes || 0).toLocaleString()} صوت حتى الآن
        </p>
      </div>
    </section>
  );
}
