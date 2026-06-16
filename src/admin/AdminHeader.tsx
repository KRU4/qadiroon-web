import { useState } from "react";
import { IconBell, IconChevronDown } from "@tabler/icons-react";
import type { AuthUser } from "../lib/api";
import { useAdminI18n } from "./AdminLanguageContext";

export function AdminHeader({ user }: { user: AuthUser }) {
  const { lang, setLang, tr } = useAdminI18n();
  const [open, setOpen] = useState(false);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="flex items-center justify-between mb-6 pb-4 border-b bg-white rounded-xl px-5 py-3 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800">{tr("adminPanel")}</h2>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setLang("ar")}
            className={`px-2.5 py-1 rounded-md text-xs font-bold ${
              lang === "ar" ? "bg-blue-600 text-white" : "text-gray-600"
            }`}
          >
            🇸🇦
          </button>
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`px-2.5 py-1 rounded-md text-xs font-bold ${
              lang === "en" ? "bg-blue-600 text-white" : "text-gray-600"
            }`}
          >
            🇬🇧
          </button>
        </div>
        <button type="button" className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <IconBell size={20} />
          <span className="absolute top-1.5 end-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100"
          >
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
              {initials}
            </span>
            <div className="text-start hidden sm:block">
              <p className="text-sm font-semibold text-gray-800 leading-tight">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
            <IconChevronDown size={16} className="text-gray-400" />
          </button>
          {open && (
            <div className="absolute end-0 top-full mt-1 bg-white border rounded-xl shadow-lg py-1 min-w-[140px] z-50">
              <p className="px-3 py-2 text-xs text-gray-500">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
