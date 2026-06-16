import { useState, useEffect } from "react";
import {
 Search, Menu, X, Sun, Moon, ZoomIn, ZoomOut,
 Contrast, Volume2, Bell, Rss,
} from "lucide-react";
import { usePublicDataContext } from "../../context/PublicDataContext";
import { NavbarLink } from "./NavbarLink";

interface HeaderProps {
 darkMode: boolean;
 highContrast: boolean;
 fontSize: number;
 onToggleDark: () => void;
 onToggleContrast: () => void;
 onFontIncrease: () => void;
 onFontDecrease: () => void;
 onListen: () => void;
}

const todayDate = new Date().toLocaleDateString("ar-SA", {
 weekday: "long", year: "numeric", month: "long", day: "numeric",
});

export function Header({
 darkMode, highContrast, fontSize,
 onToggleDark, onToggleContrast, onFontIncrease, onFontDecrease,
 onListen,
}: HeaderProps) {
 const { navbar } = usePublicDataContext();
 const [menuOpen, setMenuOpen] = useState(false);
 const [searchOpen, setSearchOpen] = useState(false);
 const [searchQuery, setSearchQuery] = useState("");
 const [scrolled, setScrolled] = useState(false);

 useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
 }, []);

 const bg = darkMode
  ? scrolled ? "bg-gray-950/95 border-gray-800/80" : "bg-gray-950 border-gray-800"
  : scrolled ? "bg-white/95 border-gray-200/80" : "bg-white border-gray-100";

 return (
  <header className="sticky top-0 z-50 w-full" dir="rtl">

   {/* ── Utility bar ── */}
   <div
    className="w-full border-b"
    style={{
     background: "linear-gradient(90deg, #0d3a6e 0%, #1673B8 60%, #0a4f8a 100%)",
     borderColor: "rgba(255,255,255,0.1)",
    }}
   >
    <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between gap-4">
     {/* Date + Live badge */}
     <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
       <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
       <span className="text-red-300 text-xs font-bold tracking-wider" style={{ fontFamily: "Cairo, sans-serif" }}>
        بث مباشر
       </span>
      </div>
      <span className="text-white/30 text-xs">|</span>
      <span className="text-white/70 text-xs" style={{ fontFamily: "Cairo, sans-serif" }}>
       {todayDate}
      </span>
     </div>

     {/* Accessibility toolbar */}
     <div className="flex items-center gap-0.5">
      {[
       { icon: <ZoomIn size={13} />, label: "A+", onClick: onFontIncrease, title: "تكبير الخط" },
       { icon: <ZoomOut size={13} />, label: "A-", onClick: onFontDecrease, title: "تصغير الخط" },
      ].map((btn) => (
       <button
        key={btn.title}
        onClick={btn.onClick}
        title={btn.title}
        className="flex items-center gap-1 px-2 py-1 rounded-md text-white/80 hover:text-white hover:bg-white/15 transition-all text-xs font-bold"
        style={{ fontFamily: "Cairo, sans-serif" }}
       >
        {btn.icon} <span>{btn.label}</span>
       </button>
      ))}
      <button
       onClick={onToggleContrast}
       title="التباين العالي"
       className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all ${
        highContrast ? "bg-yellow-400 text-black font-bold" : "text-white/80 hover:text-white hover:bg-white/15"
       }`}
      >
       <Contrast size={13} />
       <span className="hidden sm:inline" style={{ fontFamily: "Cairo, sans-serif" }}>تباين</span>
      </button>
      <button
       onClick={onToggleDark}
       title={darkMode ? "النهاري" : "الليلي"}
       className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all ${
        darkMode ? "bg-yellow-400 text-black font-bold" : "text-white/80 hover:text-white hover:bg-white/15"
       }`}
      >
       {darkMode ? <Sun size={13} /> : <Moon size={13} />}
       <span className="hidden sm:inline" style={{ fontFamily: "Cairo, sans-serif" }}>
        {darkMode ? "نهاري" : "ليلي"}
       </span>
      </button>
      <button
       onClick={onListen}
       title="استمع"
       className="flex items-center gap-1 px-2 py-1 rounded-md text-white/80 hover:text-white hover:bg-white/15 transition-all text-xs"
      >
       <Volume2 size={13} />
       <span className="hidden sm:inline" style={{ fontFamily: "Cairo, sans-serif" }}>استمع</span>
      </button>
      <button className="flex items-center gap-1 px-2 py-1 rounded-md text-white/80 hover:text-white hover:bg-white/15 transition-all text-xs">
       <Rss size={13} />
      </button>
     </div>
    </div>
   </div>

   {/* ── Main header ── */}
   <div
    className={`w-full border-b backdrop-blur-sm transition-all duration-300 ${bg} ${
     scrolled ? "shadow-lg shadow-black/10" : "shadow-sm"
    }`}
   >
    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">

     {/* Logo */}
     <div className="flex items-center gap-3 flex-shrink-0 group cursor-pointer">
      {/* Icon */}
      <div
       className="relative w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden"
       style={{ background: "linear-gradient(135deg, #1673B8 0%, #0a4f8a 100%)" }}
      >
       <svg viewBox="0 0 48 52" width="30" height="35" fill="none">
        <circle cx="28" cy="9" r="7" fill="white" opacity="0.95"/>
        <polygon points="38,2 39.5,6.5 44,6.5 40.5,9 41.8,13.5 38,11 34.2,13.5 35.5,9 32,6.5 36.5,6.5" fill="#F6B512"/>
        <path d="M 22 17 Q 8 22 12 37 Q 16 48 24 46 Q 20 38 22 30 Z" fill="#7AC143"/>
        <path d="M 25 15 Q 40 20 42 34 Q 38 26 30 22 Q 26 19 26 17 Z" fill="white" opacity="0.9"/>
       </svg>
       {/* Animated ring */}
       <div className="absolute inset-0 rounded-2xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all" />
      </div>

      {/* Text */}
      <div className="leading-none">
       <div
        className="text-2xl font-black"
        style={{ color: "#1673B8", fontFamily: "Cairo, sans-serif", letterSpacing: "-0.5px" }}
       >
        قادرون
       </div>
       <div
        className="text-xs font-bold mt-0.5"
        style={{ color: "#7AC143", fontFamily: "Cairo, sans-serif", letterSpacing: "0.5px" }}
       >
        للفئات الخاصة
       </div>
      </div>
     </div>

     {/* Search */}
     <div className="flex-1 max-w-md mx-auto hidden md:block">
      <div className="relative group">
       <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="ابحث في قادرون..."
        className={`w-full px-5 py-2.5 pr-11 rounded-2xl text-sm outline-none transition-all border ${
         darkMode
          ? "bg-gray-800/80 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:bg-gray-800"
          : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:bg-white focus:shadow-md focus:shadow-blue-100"
        }`}
        style={{ fontFamily: "Cairo, sans-serif" }}
        dir="rtl"
       />
       <div
        className="absolute right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-xl flex items-center justify-center transition-all"
        style={{ backgroundColor: "#1673B8" }}
       >
        <Search size={13} className="text-white" />
       </div>
      </div>
     </div>

     {/* Nav - Desktop (from admin API) */}
     {navbar.length > 0 && (
     <nav className="hidden lg:flex items-center gap-0.5 flex-shrink-0">
      {navbar.map((item) => (
       <NavbarLink
        key={item.id}
        item={item}
        className={`relative px-3 py-2 rounded-xl text-sm transition-all whitespace-nowrap ${
         darkMode
          ? "text-gray-300 hover:text-white hover:bg-gray-800"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        }`}
        activeClassName="font-bold text-blue-600"
       />
      ))}
     </nav>
     )}

     {/* Right actions */}
     <div className="flex items-center gap-2 flex-shrink-0 mr-auto">
      {/* Notification bell */}
      <button className={`relative p-2 rounded-xl transition-all ${darkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
       <Bell size={18} />
       <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
      </button>

      {/* Mobile search */}
      <button
       className={`md:hidden p-2 rounded-xl transition-all ${darkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
       onClick={() => setSearchOpen(!searchOpen)}
      >
       <Search size={18} />
      </button>

      {/* Mobile menu */}
      <button
       className={`lg:hidden p-2 rounded-xl transition-all ${darkMode ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-600"}`}
       onClick={() => setMenuOpen(!menuOpen)}
      >
       {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
     </div>
    </div>

    {/* Mobile search bar */}
    {searchOpen && (
     <div className={`px-4 pb-3 md:hidden ${darkMode ? "bg-gray-950" : "bg-white"}`}>
      <input
       type="text"
       value={searchQuery}
       onChange={(e) => setSearchQuery(e.target.value)}
       placeholder="ابحث في قادرون..."
       className={`w-full px-4 py-2.5 pr-10 rounded-xl text-sm outline-none border ${
        darkMode
         ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
         : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400"
       }`}
       style={{ fontFamily: "Cairo, sans-serif" }}
       autoFocus
       dir="rtl"
      />
     </div>
    )}

    {/* Mobile nav */}
    {menuOpen && navbar.length > 0 && (
     <div className={`lg:hidden border-t px-4 py-4 ${darkMode ? "bg-gray-950 border-gray-800" : "bg-white border-gray-100"}`}>
      <div className="grid grid-cols-2 gap-2">
       {navbar.map((item) => (
        <NavbarLink
         key={item.id}
         item={item}
         onClick={() => setMenuOpen(false)}
         className={`px-4 py-2.5 rounded-xl text-sm text-right font-medium transition-all ${
          darkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-50"
         }`}
         activeClassName="bg-blue-600 text-white font-bold"
        />
       ))}
      </div>
     </div>
    )}
   </div>

   <style>{`
    header { font-family: 'Cairo', sans-serif; }
   `}</style>
  </header>
 );
}
