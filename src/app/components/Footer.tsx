import { Facebook, Twitter, Youtube, Instagram, Rss } from "lucide-react";
import { usePublicDataContext } from "../../context/PublicDataContext";
import { NavbarLink } from "./NavbarLink";

interface FooterProps {
  darkMode: boolean;
}

export function Footer({ darkMode }: FooterProps) {
  const { navbar } = usePublicDataContext();

  return (
    <footer
      className={`pt-12 pb-6 border-t ${
        darkMode ? "bg-gray-950 border-gray-800" : "bg-gray-900 border-gray-800"
      }`}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#1673B8" }}
              >
                <span
                  className="text-white text-xl font-black"
                  style={{ fontFamily: "Cairo, sans-serif" }}
                >
                  ق
                </span>
              </div>
              <div>
                <div
                  className="text-2xl font-black text-white"
                  style={{ fontFamily: "Cairo, sans-serif" }}
                >
                  قادرون
                </div>
                <div
                  className="text-xs"
                  style={{ color: "#7AC143", fontFamily: "Cairo, sans-serif" }}
                >
                  للفئات الخاصة
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {[
                { Icon: Facebook, label: "Facebook" },
                { Icon: Twitter, label: "Twitter" },
                { Icon: Youtube, label: "YouTube" },
                { Icon: Instagram, label: "Instagram" },
                { Icon: Rss, label: "RSS" },
              ].map(({ Icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all hover:scale-110"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {navbar.length > 0 && (
            <div className="lg:col-span-2">
              <h4
                className="text-white font-bold mb-4 text-sm"
                style={{ fontFamily: "Cairo, sans-serif" }}
              >
                روابط الموقع
              </h4>
              <ul className="grid grid-cols-2 gap-2">
                {navbar.map((item) => (
                  <li key={item.id}>
                    <NavbarLink
                      item={item}
                      className="text-gray-400 hover:text-white text-sm transition-colors text-right block w-full"
                      activeClassName="text-white font-bold"
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-t border-gray-800 pt-6">
          <p
            className="text-gray-500 text-xs"
            style={{ fontFamily: "Cairo, sans-serif" }}
          >
            © ٢٠٢٦ قادرون — جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span
              className="text-gray-500 text-xs"
              style={{ fontFamily: "Cairo, sans-serif" }}
            >
              متوافق مع WCAG 2.1 AA
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
