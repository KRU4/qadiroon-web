import { NavLink, useNavigate } from "react-router";
import {
  IconLayoutDashboard,
  IconMenu2,
  IconHome,
  IconFileText,
  IconArticle,
  IconCategory,
  IconAd,
  IconUsers,
  IconCode,
  IconBolt,
  IconShield,
  IconForms,
  IconInbox,
  IconSeo,
  IconTerminal2,
} from "@tabler/icons-react";
import { api, type AuthUser } from "../lib/api";
import { useAdminI18n } from "./AdminLanguageContext";

export function AdminSidebar({ user }: { user: AuthUser }) {
  const navigate = useNavigate();
  const { tr } = useAdminI18n();

  const links = [
    { to: "/admin/dashboard", label: tr("dashboard"), icon: IconLayoutDashboard },
    { to: "/admin/navbar", label: tr("navbarManager"), icon: IconMenu2 },
    { to: "/admin/landing", label: tr("landingPage"), icon: IconHome },
    { to: "/admin/pages", label: tr("pages"), icon: IconFileText },
    { to: "/admin/blogs", label: tr("allPosts"), icon: IconArticle },
    { to: "/admin/categories", label: tr("categories"), icon: IconCategory },
    { to: "/admin/ads", label: tr("adSlots"), icon: IconAd },
    { to: "/admin/snippets", label: tr("codeSnippets"), icon: IconCode },
    { to: "/admin/forms", label: tr("forms"), icon: IconForms },
    { to: "/admin/inbox", label: tr("inbox"), icon: IconInbox },
    { to: "/admin/performance", label: tr("performance"), icon: IconBolt },
    { to: "/admin/seo-settings", label: tr("seoSettings"), icon: IconSeo },
    { to: "/admin/pm2-logs", label: "PM2 Logs", icon: IconTerminal2 },
  ];

  const logout = async () => {
    await api.logout();
    navigate("/admin/login");
  };

  return (
    <aside className="w-64 bg-gray-950 text-gray-200 min-h-screen p-5 flex flex-col">
      <div className="mb-6 px-2">
        <h1 className="text-lg font-bold text-white">{tr("adminPanel")}</h1>
      </div>
      <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-full text-sm transition-colors ${
                isActive ? "bg-blue-600/90 text-white" : "hover:bg-gray-800 text-gray-300"
              }`
            }
          >
            <l.icon size={18} stroke={1.5} />
            {l.label}
          </NavLink>
        ))}
        {user.role === "admin" && (
          <>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-full text-sm transition-colors ${
                  isActive ? "bg-blue-600/90 text-white" : "hover:bg-gray-800 text-gray-300"
                }`
              }
            >
              <IconUsers size={18} stroke={1.5} />
              {tr("users")}
            </NavLink>
            <NavLink
              to="/admin/security"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-full text-sm transition-colors ${
                  isActive ? "bg-blue-600/90 text-white" : "hover:bg-gray-800 text-gray-300"
                }`
              }
            >
              <IconShield size={18} stroke={1.5} />
              {tr("security")}
            </NavLink>
          </>
        )}
      </nav>
      <button
        onClick={logout}
        className="mt-4 text-sm text-red-400 hover:text-red-300 text-start px-3 py-2"
      >
        {tr("logout")}
      </button>
    </aside>
  );
}
