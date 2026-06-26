const API_BASE = "/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export const api = {
  login: (email: string, password: string, totpCode?: string) =>
    request<{ user: AuthUser; requires2fa?: boolean }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, totpCode }),
    }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request<{ user: AuthUser }>("/auth/me"),

  publicNavbar: () => request<NavbarItem[]>("/public/navbar"),
  publicAds: () => request<AdSlot[]>("/public/ads"),
  publicLanding: () => request<LandingData>("/public/landing"),
  publicPage: (slug: string) => request<PageRecord>(`/public/pages/${slug}`),
  publicBlogs: () => request<BlogRecord[]>("/public/blogs"),
  publicBlog: (slug: string) => request<BlogRecord>(`/public/blogs/${slug}`),

  stats: () => request<DashboardStats>("/admin/stats"),
  navbar: {
    list: () => request<NavbarItemAdmin[]>("/admin/navbar"),
    create: (data: Partial<NavbarItem>) =>
      request("/admin/navbar", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<NavbarItem>) =>
      request(`/admin/navbar/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    toggle: (id: number) =>
      request<{ is_active: number }>(`/admin/navbar/${id}/toggle`, { method: "PATCH" }),
    delete: (id: number) => request(`/admin/navbar/${id}`, { method: "DELETE" }),
  },
  pages: {
    list: () => request<PageRecord[]>("/admin/pages"),
    get: (id: number) => request<PageRecord>(`/admin/pages/${id}`),
    getByNavbar: (navbarItemId: number) =>
      request<PageRecord>(`/admin/pages/by-navbar/${navbarItemId}`),
    create: (data: Partial<PageRecord>) =>
      request<{ id: number }>("/admin/pages", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<PageRecord>) =>
      request(`/admin/pages/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request(`/admin/pages/${id}`, { method: "DELETE" }),
  },
  categories: {
    list: () => request<CategoryRecord[]>("/admin/categories"),
    create: (data: Partial<CategoryRecord>) =>
      request("/admin/categories", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<CategoryRecord>) =>
      request(`/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request(`/admin/categories/${id}`, { method: "DELETE" }),
  },
  blogs: {
    list: () => request<BlogRecord[]>("/admin/blogs"),
    get: (id: number) => request<BlogRecord & { tags: TagRecord[] }>(`/admin/blogs/${id}`),
    create: (data: Partial<BlogRecord> & { tags?: string[] }) =>
      request<{ id: number }>("/admin/blogs", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<BlogRecord> & { tags?: string[] }) =>
      request(`/admin/blogs/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request(`/admin/blogs/${id}`, { method: "DELETE" }),
    revisions: (id: number) => request<RevisionRecord[]>(`/admin/blogs/${id}/revisions`),
    restoreRevision: (id: number, revId: number) =>
      request(`/admin/blogs/${id}/revisions/${revId}/restore`, { method: "POST" }),
  },
  tags: {
    list: () => request<TagRecord[]>("/admin/tags"),
    create: (name: string) =>
      request<TagRecord>("/admin/tags", { method: "POST", body: JSON.stringify({ name }) }),
  },
  snippets: {
    list: () => request<SnippetRecord[]>("/admin/snippets"),
    create: (data: Partial<SnippetRecord>) =>
      request("/admin/snippets", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<SnippetRecord>) =>
      request(`/admin/snippets/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request(`/admin/snippets/${id}`, { method: "DELETE" }),
  },
  performance: {
    get: () => request<PerformanceSettings>("/admin/performance"),
    update: (data: PerformanceSettings) =>
      request("/admin/performance", { method: "PUT", body: JSON.stringify(data) }),
    clearCache: () => request("/admin/performance/clear-cache", { method: "POST" }),
  },
  seoSettings: {
    get: () => request<{ robots_txt: string }>("/admin/seo-settings"),
    update: (robots_txt: string) =>
      request("/admin/seo-settings", { method: "PUT", body: JSON.stringify({ robots_txt }) }),
  },
  audit: {
    list: (params?: { user_id?: number; from?: string; to?: string }) => {
      const q = new URLSearchParams();
      if (params?.user_id) q.set("user_id", String(params.user_id));
      if (params?.from) q.set("from", params.from);
      if (params?.to) q.set("to", params.to);
      return request<AuditRecord[]>(`/admin/audit?${q}`);
    },
  },
  twoFa: {
    setup: () => request<{ secret: string; otpauth: string }>("/admin/2fa/setup", { method: "POST" }),
    enable: (code: string) =>
      request("/admin/2fa/enable", { method: "POST", body: JSON.stringify({ code }) }),
    disable: () => request("/admin/2fa/disable", { method: "POST" }),
  },
  forms: {
    list: () => request<FormRecord[]>("/admin/forms"),
    create: (data: Partial<FormRecord>) =>
      request<{ id: number; embed_code: string }>("/admin/forms", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<FormRecord>) =>
      request(`/admin/forms/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request(`/admin/forms/${id}`, { method: "DELETE" }),
    submissions: () => request<FormSubmission[]>("/admin/form-submissions"),
    markRead: (id: number) =>
      request(`/admin/form-submissions/${id}/read`, { method: "PATCH" }),
    exportCsv: () => fetch(`${API_BASE}/admin/form-submissions/export`, { credentials: "include" }),
  },
  publicCategories: () => request<CategoryRecord[]>("/public/categories"),
  publicCategory: (slug: string) => request<{ category: CategoryRecord; posts: BlogRecord[] }>(`/public/categories/${slug}`),
  publicSnippets: () => request<PublicSnippet[]>("/public/snippets?path=" + encodeURIComponent(window.location.pathname)),
  publicForm: (embed: string) => request<PublicForm>(`/public/forms/${embed}`),
  submitForm: (embed: string, data: Record<string, string>) =>
    request(`/public/forms/${embed}/submit`, { method: "POST", body: JSON.stringify(data) }),
  users: {
    list: () => request<UserRecord[]>("/admin/users"),
    create: (data: { name: string; email: string; password: string; role: string }) =>
      request("/admin/users", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<UserRecord & { password?: string }>) =>
      request(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request(`/admin/users/${id}`, { method: "DELETE" }),
  },
  ads: {
    list: () => request<AdSlotRecord[]>("/admin/ads"),
    create: (data: Partial<AdSlotRecord>) =>
      request<{ id: number }>("/admin/ads", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<AdSlotRecord>) =>
      request(`/admin/ads/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request(`/admin/ads/${id}`, { method: "DELETE" }),
  },
  landing: {
    get: () => request<LandingData>("/admin/landing"),
    update: (data: LandingData) =>
      request("/admin/landing", { method: "PUT", body: JSON.stringify(data) }),
  },
  upload: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/admin/upload`, {
      method: "POST",
      credentials: "include",
      body: form,
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json() as Promise<{ url: string }>;
  },
};

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "employee";
}

export interface NavbarItem {
  id: number;
  label: string;
  slug: string;
  sort_order: number;
  is_active: number;
}

export interface NavbarItemAdmin extends NavbarItem {
  page_id?: number | null;
  page_title?: string | null;
}

export interface PageRecord {
  id: number;
  title: string;
  slug: string;
  content: string;
  navbar_item_id?: number | null;
  meta_description?: string;
  meta_title?: string;
  focus_keyword?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  is_published: number;
}

export interface CategoryRecord {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  navbar_item_id?: number | null;
}

export interface BlogRecord {
  id: number;
  title: string;
  slug: string;
  cover_image?: string;
  cover_image_alt?: string;
  excerpt?: string;
  body: string;
  category_id?: number | null;
  category_name?: string;
  category_slug?: string;
  category_description?: string;
  author_name?: string;
  is_published: number;
  published_at?: string;
  created_at?: string;
  view_count?: number;
  meta_title?: string;
  meta_description?: string;
  focus_keyword?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  show_toc?: number;
  toc_min_words?: number;
  tags?: string[];
}

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: number;
}

export interface AdSlot {
  slot_code: string;
  label: string;
  image_url?: string;
  link_url?: string;
  width: number;
  height: number;
}

export interface AdSlotRecord extends AdSlot {
  id: number;
  is_active: number;
  expires_at?: string | null;
  sort_order?: number;
}

export interface DashboardStats {
  blogs: number;
  pages: number;
  users: number;
  usersTotal?: number;
  blogsTrend?: number;
  pagesTrend?: number;
  latestBlogs: BlogRecord[];
  recentActivity?: AuditRecord[];
}

export interface TagRecord {
  id: number;
  name: string;
  slug: string;
}

export interface RevisionRecord {
  id: number;
  created_at: string;
  created_by: number;
}

export interface SnippetRecord {
  id: number;
  name: string;
  type: "head" | "body-start" | "body-end";
  code: string;
  is_active: number;
  scope: string;
  scope_target?: string | null;
}

export interface PublicSnippet {
  type: string;
  code: string;
}

export interface PerformanceSettings {
  cache_ttl: number;
  minify_assets: boolean;
  cdn_base_url: string;
  lazy_load_images: boolean;
}

export interface AuditRecord {
  id: number;
  user_id: number | null;
  user_name: string;
  action: string;
  entity_type: string | null;
  entity_id: number | null;
  details: string | null;
  created_at: string;
}

export interface FormField {
  id: string;
  type: "text" | "email" | "phone" | "textarea" | "select" | "checkbox" | "file";
  label: string;
  required?: boolean;
  options?: string[];
}

export interface FormRecord {
  id: number;
  name: string;
  embed_code: string;
  fields: string | FormField[];
  notify_email?: string;
  auto_reply?: string;
  captcha_enabled?: number;
  is_active?: number;
}

export interface PublicForm {
  id: number;
  name: string;
  fields: FormField[];
  captcha_enabled: number;
}

export interface FormSubmission {
  id: number;
  form_id: number;
  form_name: string;
  data: string;
  is_read: number;
  created_at: string;
}

export interface LandingStat {
  value: string;
  label: string;
}

export interface SpotlightItem {
  id: string;
  image: string;
  title: string;
  description: string;
  link: string;
  sort_order: number;
}

export interface ServiceItem {
  rank: number;
  name: string;
  count: string;
  color: string;
}

export interface PollOption {
  label: string;
  percent: number;
}

export interface PollData {
  question: string;
  options: PollOption[];
  totalVotes: number;
}

export interface JobItem {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  postedDate: string;
  salary: string;
  type: string;
  tags: string[];
}

export interface StoryItem {
  id: string;
  title: string;
  excerpt: string;
  image: string;
}

export interface GovtServiceItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  authority: string;
  badge: string;
}

export interface LandingData {
  hero_title: string;
  hero_subtitle: string;
  stats: LandingStat[];
  breaking_ticker: string;
  spotlight: SpotlightItem[];
  about_content: string;
  services: ServiceItem[];
  poll: PollData;
  jobs: JobItem[];
  stories: StoryItem[];
  govt_services: GovtServiceItem[];
}
