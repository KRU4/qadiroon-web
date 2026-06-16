import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  IconArticle,
  IconFileText,
  IconUsers,
  IconPlus,
  IconTrendingUp,
} from "@tabler/icons-react";
import { api, type DashboardStats } from "../lib/api";
import { useAdminI18n } from "./AdminLanguageContext";
import { useOutletContext } from "react-router";
import type { AuthUser } from "../lib/api";

function Sparkline({ trend }: { trend: number }) {
  const points = trend > 0 ? "0,20 10,10 20,12 30,4 40,8" : "0,8 10,12 20,10 30,18 40,16";
  return (
    <svg viewBox="0 0 40 24" className="w-16 h-8 opacity-70">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} />
    </svg>
  );
}

function Donut({ active, total }: { active: number; total: number }) {
  const pct = total ? (active / total) * 100 : 0;
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <svg width="72" height="72" className="rotate-[-90deg]">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke="#7AC143"
        strokeWidth="8"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.max(1, Math.floor(diff / 60000))}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function AdminDashboard() {
  const { tr } = useAdminI18n();
  const { user } = useOutletContext<{ user: AuthUser }>();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.stats().then(setStats).catch(() => {});
  }, []);

  if (!stats) return <p className="text-gray-500">{tr("loading")}</p>;

  const cards = [
    {
      label: tr("publishedBlogs"),
      value: stats.blogs,
      trend: stats.blogsTrend ?? 0,
      icon: IconArticle,
      tint: "bg-blue-50 text-blue-700 border-blue-100",
    },
    {
      label: tr("publishedPages"),
      value: stats.pages,
      trend: stats.pagesTrend ?? 0,
      icon: IconFileText,
      tint: "bg-amber-50 text-amber-700 border-amber-100",
    },
    {
      label: tr("activeUsers"),
      value: stats.users,
      trend: 0,
      icon: IconUsers,
      tint: "bg-green-50 text-green-700 border-green-100",
      donut: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {tr("welcome")}, {user.name} 👋
          </h1>
          <p className="text-blue-100 text-sm mt-1">{tr("welcomeSubtitle")}</p>
        </div>
        <Link
          to="/admin/blogs"
          className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
        >
          <IconPlus size={18} />
          {tr("writeNewPost")}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-2xl border p-5 ${c.tint}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold opacity-80">{c.label}</p>
                <p className="text-3xl font-black mt-1">{c.value}</p>
                {c.value === 0 && (
                  <p className="text-xs mt-2 opacity-70">{tr("emptyBlogsHint")}</p>
                )}
                {c.trend > 0 && (
                  <p className="text-xs mt-1 flex items-center gap-1">
                    <IconTrendingUp size={14} />+{c.trend} {tr("thisWeek")}
                  </p>
                )}
              </div>
              {c.donut ? (
                <div className="relative">
                  <Donut active={stats.users} total={stats.usersTotal ?? stats.users} />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700 rotate-90">
                    {stats.users}/{stats.usersTotal ?? stats.users}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-end gap-2">
                  <c.icon size={28} stroke={1.5} />
                  <Sparkline trend={c.trend} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">{tr("topArticles")}</h2>
          {stats.latestBlogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">{tr("noPostsYet")}</p>
              <Link to="/admin/blogs" className="text-blue-600 text-sm font-semibold mt-2 inline-block">
                {tr("writeNewPost")} →
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {stats.latestBlogs.map((b) => (
                <li key={b.id} className="flex items-center gap-3 border-b pb-3 last:border-0">
                  {b.cover_image ? (
                    <img src={b.cover_image} alt="" className="w-14 h-14 rounded-lg object-cover" loading="lazy" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-100" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{b.title}</p>
                    <p className="text-xs text-gray-500">
                      {b.published_at?.slice(0, 10) || b.created_at?.slice(0, 10)} ·{" "}
                      {b.view_count ?? 0} {tr("views")}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      b.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {b.is_published ? tr("published") : tr("draft")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-2xl border p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">{tr("recentActivity")}</h2>
          <ul className="space-y-3">
            {(stats.recentActivity ?? []).map((a) => (
              <li key={a.id} className="flex gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-800">
                    <span className="font-semibold">{a.user_name}</span> {a.action.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-gray-400">{timeAgo(a.created_at)}</p>
                </div>
              </li>
            ))}
            {(stats.recentActivity ?? []).length === 0 && (
              <p className="text-gray-400 text-sm">{tr("noActivity")}</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
