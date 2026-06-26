import type { StoryItem } from "../../lib/api";

interface Props {
  darkMode: boolean;
  stories: StoryItem[];
}

export function SuccessStories({ darkMode, stories }: Props) {
  if (!stories || stories.length === 0) return null;

  return (
    <section className={`py-10 ${darkMode ? "bg-gray-950" : "bg-gray-50"}`} dir="rtl">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black" style={{ color: "#1673B8", fontFamily: "Cairo, sans-serif" }}>
            قصص نجاح ملهمة
          </h2>
          <button
            className="text-sm font-bold transition-all"
            style={{ color: "#1673B8", fontFamily: "Cairo, sans-serif" }}
          >
            جميع القصص
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {stories.map((story) => (
            <article
              key={story.id}
              className={`rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-shadow ${
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
              }`}
            >
              <div className="h-44 overflow-hidden bg-gray-200">
                {story.image ? (
                  <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    صورة القصة
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold mb-2" style={{ fontFamily: "Cairo, sans-serif" }}>
                  {story.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed line-clamp-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                  style={{ fontFamily: "Cairo, sans-serif" }}
                >
                  {story.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
