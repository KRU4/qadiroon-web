import { useEffect, useState } from "react";
import { api, type PageRecord } from "../lib/api";
import { PageEditorPanel } from "./PageEditorPanel";
import { useAdminI18n } from "./AdminLanguageContext";

export function AdminPages() {
  const { tr } = useAdminI18n();
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);

  const load = () => api.pages.list().then(setPages);
  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{tr("pages")}</h1>
        <button
          type="button"
          onClick={() => {
            setEditId(null);
            setShowNew(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          {tr("createNew")}
        </button>
      </div>

      {(showNew || editId !== null) && (
        <div className="bg-white rounded-xl border p-4 mb-6">
          <PageEditorPanel
            pageId={editId}
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
      )}

      <div className="space-y-2">
        {pages.map((p) => (
          <div
            key={p.id}
            className="bg-white border rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{p.title}</p>
              <p className="text-xs text-gray-500">
                /{p.slug} · {p.is_published ? tr("published") : tr("draft")}
              </p>
            </div>
            <div className="space-x-2">
              <button
                type="button"
                className="text-blue-600 text-sm"
                onClick={() => {
                  setShowNew(false);
                  setEditId(p.id);
                }}
              >
                {tr("edit")}
              </button>
              <button
                type="button"
                className="text-red-600 text-sm"
                onClick={() => api.pages.delete(p.id).then(load)}
              >
                {tr("delete")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
