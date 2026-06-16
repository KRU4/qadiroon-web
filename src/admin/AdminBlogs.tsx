import { useEffect, useState } from "react";
import { api, type BlogRecord } from "../lib/api";
import { BlogEditor } from "./BlogEditor";
import { useAdminI18n } from "./AdminLanguageContext";

export function AdminBlogs() {
  const { tr } = useAdminI18n();
  const [blogs, setBlogs] = useState<BlogRecord[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);

  const load = () => api.blogs.list().then(setBlogs);
  useEffect(() => {
    load();
  }, []);

  if (showNew || editId !== null) {
    return (
      <div>
        <BlogEditor
          blogId={editId}
          onSaved={() => {
            setEditId(null);
            setShowNew(false);
            load();
          }}
          onCancel={() => {
            setEditId(null);
            setShowNew(false);
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{tr("allPosts")}</h1>
        <button
          type="button"
          onClick={() => setShowNew(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          {tr("writeNewPost")}
        </button>
      </div>
      {blogs.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center">
          <p className="text-gray-500 mb-3">{tr("noPostsYet")}</p>
          <button type="button" onClick={() => setShowNew(true)} className="text-blue-600 font-semibold text-sm">
            {tr("writeNewPost")} →
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {blogs.map((b) => (
            <div key={b.id} className="bg-white border rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{b.title}</p>
                <p className="text-xs text-gray-500">
                  {b.category_name || "—"} · {b.is_published ? tr("published") : tr("draft")} ·{" "}
                  {b.view_count ?? 0} {tr("views")}
                </p>
              </div>
              <div className="space-x-2">
                <button type="button" className="text-blue-600 text-sm" onClick={() => setEditId(b.id)}>
                  {tr("edit")}
                </button>
                <button type="button" className="text-red-600 text-sm" onClick={() => api.blogs.delete(b.id).then(load)}>
                  {tr("delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
