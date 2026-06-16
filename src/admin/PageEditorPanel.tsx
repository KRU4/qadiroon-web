import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { RichTextEditor } from "./RichTextEditor";
import { SeoPanel, type SeoData } from "./SeoPanel";
import { useAdminI18n } from "./AdminLanguageContext";

interface PageForm {
  title: string;
  slug: string;
  content: string;
  is_published: number;
  meta_description: string;
}

const emptySeo: SeoData = {
  meta_title: "",
  meta_description: "",
  focus_keyword: "",
  slug: "",
  canonical_url: "",
  og_title: "",
  og_description: "",
  og_image: "",
};

const emptyForm: PageForm = {
  title: "",
  slug: "",
  content: "",
  is_published: 0,
  meta_description: "",
};

interface PageEditorPanelProps {
  pageId?: number | null;
  navbarItemId?: number;
  suggestedSlug?: string;
  onSaved: () => void;
  onCancel: () => void;
}

export function PageEditorPanel({
  pageId,
  navbarItemId,
  suggestedSlug = "",
  onSaved,
  onCancel,
}: PageEditorPanelProps) {
  const { tr } = useAdminI18n();
  const [form, setForm] = useState<PageForm>({ ...emptyForm, slug: suggestedSlug });
  const [seo, setSeo] = useState<SeoData>(emptySeo);
  const [editId, setEditId] = useState<number | null>(pageId ?? null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        if (pageId) {
          const page = await api.pages.get(pageId);
          if (!cancelled) {
            setForm({
              title: page.title,
              slug: page.slug,
              content: page.content || "",
              is_published: page.is_published ? 1 : 0,
              meta_description: page.meta_description || "",
            });
            setSeo({
              meta_title: page.meta_title || "",
              meta_description: page.meta_description || "",
              focus_keyword: page.focus_keyword || "",
              slug: page.slug,
              canonical_url: page.canonical_url || "",
              og_title: page.og_title || "",
              og_description: page.og_description || "",
              og_image: page.og_image || "",
            });
            setEditId(page.id);
          }
        } else if (navbarItemId) {
          try {
            const page = await api.pages.getByNavbar(navbarItemId);
            if (!cancelled) {
              setForm({
                title: page.title,
                slug: page.slug,
                content: page.content || "",
                is_published: page.is_published ? 1 : 0,
                meta_description: page.meta_description || "",
              });
              setSeo({
                meta_title: page.meta_title || "",
                meta_description: page.meta_description || "",
                focus_keyword: page.focus_keyword || "",
                slug: page.slug,
                canonical_url: page.canonical_url || "",
                og_title: page.og_title || "",
                og_description: page.og_description || "",
                og_image: page.og_image || "",
              });
              setEditId(page.id);
            }
          } catch {
            if (!cancelled) {
              setForm({ ...emptyForm, slug: suggestedSlug });
              setEditId(null);
            }
          }
        } else {
          setForm({ ...emptyForm, slug: suggestedSlug });
          setEditId(null);
        }
      } catch {
        if (!cancelled) setError(tr("saveFailed"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [pageId, navbarItemId, suggestedSlug, tr]);

  const save = async () => {
    if (!form.title || !form.slug || loading) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        slug: seo.slug || form.slug,
        ...seo,
        navbar_item_id: navbarItemId ?? undefined,
      };
      if (editId) {
        await api.pages.update(editId, payload);
      } else {
        const created = await api.pages.create(payload);
        setEditId(created.id);
      }
      onSaved();
    } catch (err: any) {
      setError(err?.message || err?.error || tr("saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-sm text-gray-500 bg-gray-50 rounded-lg border">
        {tr("loading")}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border rounded-xl p-4 mt-2">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-3">
      <input
        placeholder={tr("title")}
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="w-full border rounded px-3 py-2"
      />
      <input
        placeholder={tr("slug")}
        value={form.slug}
        onChange={(e) => setForm({ ...form, slug: e.target.value })}
        className="w-full border rounded px-3 py-2"
        dir="ltr"
      />
      <RichTextEditor
        value={form.content}
        onChange={(content) => setForm({ ...form, content })}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={!!form.is_published}
          onChange={(e) =>
            setForm({ ...form, is_published: e.target.checked ? 1 : 0 })
          }
        />
        {form.is_published ? tr("published") : tr("draft")}
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
        >
          {editId ? tr("updatePage") : tr("createPage")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border px-4 py-2 rounded-lg text-sm"
        >
          {tr("cancel")}
        </button>
      </div>
        </div>
        <SeoPanel
          title={form.title}
          content={form.content}
          slug={form.slug}
          isPublished={!!form.is_published}
          seo={{ ...seo, slug: seo.slug || form.slug }}
          onChange={(s) => {
            setSeo(s);
            if (s.meta_description) setForm((f) => ({ ...f, meta_description: s.meta_description }));
            if (s.slug) setForm((f) => ({ ...f, slug: s.slug }));
          }}
        />
      </div>
    </div>
  );
}

export function slugFromNavbarPath(navSlug: string): string {
  if (navSlug.startsWith("/pages/")) return navSlug.replace("/pages/", "");
  if (navSlug.startsWith("/")) return navSlug.slice(1);
  return navSlug;
}
