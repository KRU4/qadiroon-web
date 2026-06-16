import { usePublicDataContext } from "../../context/PublicDataContext";
import { useScrollAnimation } from "./ui/use-scroll-animation";

interface LandingAboutProps {
  darkMode: boolean;
}

export function LandingAbout({ darkMode }: LandingAboutProps) {
  const { landing } = usePublicDataContext();
  const sectionRef = useScrollAnimation("news");

  if (!landing.about_content?.trim()) return null;

  return (
    <section
      ref={sectionRef}
      className={`py-12 ${darkMode ? "bg-gray-950" : "bg-gray-100"}`}
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto px-4 lg:px-6">
        <h2
          className="section-title animate-on-scroll mb-6 text-center"
          style={{ color: "#1673B8", fontFamily: "Cairo, sans-serif" }}
        >
          عن قادرون
        </h2>
        <div
          className={`animate-on-scroll prose max-w-none leading-loose rounded-2xl p-8 border ${
            darkMode
              ? "bg-gray-900 border-gray-800 text-gray-200"
              : "bg-white border-gray-200 text-gray-700"
          }`}
          style={{ fontFamily: "Cairo, sans-serif" }}
          dangerouslySetInnerHTML={{ __html: landing.about_content }}
        />
      </div>
    </section>
  );
}
