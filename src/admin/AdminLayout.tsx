import { Navigate, Outlet, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { api, type AuthUser } from "../lib/api";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AdminLanguageProvider, useAdminI18n } from "./AdminLanguageContext";

function AdminLayoutInner() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { dir, tr } = useAdminI18n();

  useEffect(() => {
    api
      .me()
      .then((r) => setUser(r.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        {tr("loading")}
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex" dir={dir}>
      <AdminSidebar user={user} />
      <main className="flex-1 p-8 overflow-auto">
        <AdminHeader user={user} />
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}

export function AdminLayout() {
  return (
    <AdminLanguageProvider>
      <AdminLayoutInner />
    </AdminLanguageProvider>
  );
}
