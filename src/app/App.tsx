import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { BreakingTicker } from "./components/BreakingTicker";
import { HeroSection } from "./components/HeroSection";
import { LatestNews } from "./components/LatestNews";
import { Footer } from "./components/Footer";
import { AdBanner, EdgeMarquee } from "./components/AdBanner";
import { SplashIntro } from "./components/SplashIntro";
import { LandingSpotlight } from "./components/LandingSpotlight";
import { LandingAbout } from "./components/LandingAbout";
import { CodeSnippetsInjector } from "./components/CodeSnippetsInjector";
import { useAnimationContext } from "../context/AnimationContext";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [speaking, setSpeaking] = useState(false);
  const { enable: enableAnimations } = useAnimationContext();

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleListen = () => {
    if ("speechSynthesis" in window) {
      if (speaking) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
        return;
      }
      const text = "مرحباً بك في منصة قادرون.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-SA";
      utterance.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    }
  };

  const handleFontIncrease = () => setFontSize((s) => Math.min(s + 2, 24));
  const handleFontDecrease = () => setFontSize((s) => Math.max(s - 2, 12));

  const hcStyle = highContrast
    ? { filter: "contrast(1.5) saturate(1.2)" }
    : {};

  return (
    <>
      <CodeSnippetsInjector />
      {showSplash && (
        <SplashIntro
          onComplete={() => {
            setShowSplash(false);
            enableAnimations();
          }}
        />
      )}
      <div
        dir="rtl"
        className={`min-h-screen ${darkMode ? "dark bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"}`}
        style={{ fontFamily: "Cairo, Tajawal, sans-serif", ...hcStyle }}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-[999] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
          style={{ fontFamily: "Cairo, sans-serif" }}
        >
          تخطى إلى المحتوى الرئيسي
        </a>

        <Header
          darkMode={darkMode}
          highContrast={highContrast}
          fontSize={fontSize}
          onToggleDark={() => setDarkMode((d) => !d)}
          onToggleContrast={() => setHighContrast((c) => !c)}
          onFontIncrease={handleFontIncrease}
          onFontDecrease={handleFontDecrease}
          onListen={handleListen}
        />

        <div className={`w-full py-3 px-4 ${darkMode ? "bg-gray-900" : "bg-white"} border-b ${darkMode ? "border-gray-800" : "border-gray-100"}`}>
          <div className="boxed-page-wrapper flex justify-center">
            <AdBanner slotCode="TOP_BANNER" type="leaderboard" darkMode={darkMode} />
          </div>
        </div>

        <BreakingTicker darkMode={darkMode} />

        <main id="main-content">
          <div className="boxed-page-wrapper flex gap-4 px-4">
            <EdgeMarquee side="right" darkMode={darkMode} />

            <div className="flex-1 min-w-0">
              <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
                <HeroSection darkMode={darkMode} />
              </div>

              <LandingSpotlight darkMode={darkMode} />
              <LatestNews darkMode={darkMode} />
              <LandingAbout darkMode={darkMode} />
            </div>

            <EdgeMarquee side="left" darkMode={darkMode} />
          </div>
        </main>

        <Footer darkMode={darkMode} />

        {fontSize !== 16 && (
          <div className="fixed bottom-6 left-6 bg-blue-600 text-white px-3 py-2 rounded-xl text-xs shadow-lg z-50" style={{ fontFamily: "Cairo, sans-serif" }}>
            حجم الخط: {fontSize}px
          </div>
        )}

        {speaking && (
          <div className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded-xl text-xs shadow-lg z-50 flex items-center gap-2" style={{ fontFamily: "Cairo, sans-serif" }}>
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            جارٍ القراءة...
          </div>
        )}
      </div>
    </>
  );
}
