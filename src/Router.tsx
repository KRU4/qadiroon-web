import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import App from "./app/App";
import { AdminLogin } from "./admin/AdminLogin";
import { AdminLayout } from "./admin/AdminLayout";
import { AdminDashboard } from "./admin/AdminDashboard";
import { AdminNavbar } from "./admin/AdminNavbar";
import { AdminBlogs } from "./admin/AdminBlogs";
import { AdminCategories } from "./admin/AdminCategories";
import { AdminUsers } from "./admin/AdminUsers";
import { AdminAds } from "./admin/AdminAds";
import { AdminLanding } from "./admin/AdminLanding";
import { AdminSecurity } from "./admin/AdminSecurity";
import { AdminFormInbox } from "./admin/AdminFormInbox";
import { AdminSeoSettings } from "./admin/AdminSeoSettings";
import AdminPm2Logs from "./admin/AdminPm2Logs";
import { BlogListPage } from "./app/pages/BlogListPage";
import { BlogPostPage } from "./app/pages/BlogPostPage";
import { DynamicPage } from "./app/pages/DynamicPage";
import { CategoryPage } from "./app/pages/CategoryPage";
import { PublicDataProvider } from "./context/PublicDataContext";
import { AnimationProvider } from "./context/AnimationContext";

export function AppRouter() {
  return (
    <BrowserRouter>
      <PublicDataProvider>
        <AnimationProvider>
        <Routes>
          <Route path="/" element={<App />} />
        <Route path="/blogs" element={<BlogListPage />} />
        <Route path="/blogs/:slug" element={<BlogPostPage />} />
        <Route path="/categories/:slug" element={<CategoryPage />} />
        <Route path="/pages/:slug" element={<DynamicPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="navbar" element={<AdminNavbar />} />
          <Route path="landing" element={<AdminLanding />} />
          <Route path="blogs" element={<AdminBlogs />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="ads" element={<AdminAds />} />
          <Route path="inbox" element={<AdminFormInbox />} />
          <Route path="seo-settings" element={<AdminSeoSettings />} />
          <Route path="security" element={<AdminSecurity />} />
          <Route path="pm2-logs" element={<AdminPm2Logs />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
        </Routes>
        </AnimationProvider>
      </PublicDataProvider>
    </BrowserRouter>
  );
}
