import { useEffect, useRef, useState } from "react";
import { api, type BlogRecord, type CategoryRecord } from "../lib/api";
import { RichTextEditor } from "./RichTextEditor";
import { SeoPanel, type SeoData } from "./SeoPanel";
import { useAdminI18n } from "./AdminLanguageContext";
import { countWords, readingTimeMinutes } from "../lib/seo";

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

interface BlogEditorProps {
  blogId?: number | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function BlogEditor({ blogId, onSaved, onCancel }: BlogEditorProps) {
  const { tr } = useAdminI18n();
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    body: "",
    cover_image: "",
    cover_image_alt: "",
    category_id: null as number | null,
    is_published: 0,
    show_toc: 1,
    toc_min_words: 300,
  });
  const [seo, setSeo] = useState<SeoData>(emptySeo);
  const [editId, setEditId] = useState<number | null>(blogId ?? null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    api.categories.list().then(setCategories);
  }, []);

  useEffect(() => {
    if (!blogId) return;
    api.blogs.get(blogId).then((b: BlogRecord & { tags?: { name: string }[] }) => {
      setForm({
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt || "",
        body: b.body || "",
        cover_image: b.cover_image || "",
        cover_image_alt: b.cover_image_alt || "",
        category_id: b.category_id ?? null,
        is_published: b.is_published ? 1 : 0,
        show_toc: b.show_toc ?? 1,
        toc_min_words: b.toc_min_words ?? 300,
      });
      setSeo({
        meta_title: b.meta_title || "",
        meta_description: b.meta_description || "",
        focus_keyword: b.focus_keyword || "",
        slug: b.slug,
        canonical_url: b.canonical_url || "",
        og_title: b.og_title || "",
        og_description: b.og_description || "",
        og_image: b.og_image || "",
      });
      setTags(b.tags?.map((t) => t.name) || []);
      setEditId(b.id);
    });
  }, [blogId]);

  const payload = () => ({
    ...form,
    slug: seo.slug || form.slug,
    ...seo,
    category_id: form.category_id,
    tags,
  });

  const save = async (silent = false) => {
    if (!form.title) return;
    if (!silent) setSaveStatus("saving");
    setError("");
    try {
      const data = payload();
      if (editId) await api.blogs.update(editId, data);
      else {
        const r = await api.blogs.create(data);
        setEditId(r.id);
      }
      setSaveStatus("saved");
      if (!silent) onSaved();
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : tr("saveFailed"));
      setSaveStatus("idle");
    }
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (form.title) save(true);
    }, 30000);
    return () => clearInterval(timerRef.current);
  });

  const words = countWords(form.body);
  const readMin = readingTimeMinutes(form.body);
  const autoToc = words >= form.toc_min_words;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">{editId ? tr("edit") : tr("createNew")}</h2>
          <span className="text-xs text-gray-500">
            {saveStatus === "saving" && tr("saving")}
            {saveStatus === "saved" && tr("saved")}
            {saveStatus === "idle" && `${words} ${tr("words")} · ${readMin} ${tr("minRead")}`}
          </span>
        </div>
        <input
          placeholder={tr("title")}
          value={form.title}
          onChange={(e) =>
            setForm({
              ...form,
              title: e.target.value,
              slug: form.slug || e.target.value.replace(/\s+/g, "-"),
            })
          }
          className="w-full border rounded-lg px-3 py-2"
        />
        <input
          placeholder={tr("coverImage")}
          value={form.cover_image}
          onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
          dir="ltr"
        />
        <input
          placeholder={tr("coverImageAlt")}
          value={form.cover_image_alt}
          onChange={(e) => setForm({ ...form, cover_image_alt: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
        />
        <textarea
          placeholder="Excerpt"
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 h-20"
        />
        <RichTextEditor value={form.body} onChange={(body) => setForm({ ...form, body })} />
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={form.category_id ?? ""}
            onChange={(e) =>
              setForm({ ...form, category_id: e.target.value ? +e.target.value : null })
            }
            className="border rounded-lg px-3 py-2"
          >
            <option value="">{tr("categories")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!form.show_toc && autoToc}
              onChange={(e) => setForm({ ...form, show_toc: e.target.checked ? 1 : 0 })}
            />
            {tr("showToc")} {autoToc ? "" : `(${tr("tocMinWords")}: ${form.toc_min_words})`}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!form.is_published}
              onChange={(e) =>
                setForm({ ...form, is_published: e.target.checked ? 1 : 0 })
              }
            />
            {tr("published")}
          </label>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {tags.map((t) => (
            <span key={t} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
              {t}
              <button type="button" className="ms-1" onClick={() => setTags(tags.filter((x) => x !== t))}>×</button>
            </span>
          ))}
          <input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newTag.trim()) {
                e.preventDefault();
                setTags([...tags, newTag.trim()]);
                setNewTag("");
              }
            }}
            placeholder={tr("addTag")}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button type="button" onClick={() => save()} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
            {editId ? tr("updatePage") : tr("createNew")}
          </button>
          <button type="button" onClick={onCancel} className="border px-4 py-2 rounded-lg text-sm">
            {tr("cancel")}
          </button>
        </div>
      </div>
      <div className="space-y-4">
        <SeoPanel
          title={form.title}
          content={form.body}
          slug={form.slug}
          isPublished={!!form.is_published}
          seo={{ ...seo, slug: seo.slug || form.slug }}
          onChange={(s) => {
            setSeo(s);
            if (s.slug) setForm((f) => ({ ...f, slug: s.slug }));
          }}
        />
      </div>
    </div>
  );
}
