import { Fragment, useEffect, useState } from "react";
import { api, type NavbarItemAdmin } from "../lib/api";
import { PageEditorPanel, slugFromNavbarPath } from "./PageEditorPanel";
import { useAdminI18n } from "./AdminLanguageContext";

export function AdminNavbar() {
  const { tr } = useAdminI18n();
  const [items, setItems] = useState<NavbarItemAdmin[]>([]);
  const [form, setForm] = useState({ label: "", slug: "", sort_order: 0 });
  const [error, setError] = useState("");
  const [expandedPageId, setExpandedPageId] = useState<number | null>(null);

  const load = () => api.navbar.list().then(setItems);
  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!form.label || !form.slug) return;
    await api.navbar.create({ ...form, is_active: 1 });
    setForm({ label: "", slug: "", sort_order: 0 });
    load();
  };

  const toggleItem = async (item: NavbarItemAdmin) => {
    const previous = items;
    setItems((list) =>
      list.map((i) =>
        i.id === item.id ? { ...i, is_active: i.is_active ? 0 : 1 } : i,
      ),
    );
    setError("");
    try {
      const result = await api.navbar.toggle(item.id);
      setItems((list) =>
        list.map((i) =>
          i.id === item.id ? { ...i, is_active: result.is_active } : i,
        ),
      );
    } catch {
      setItems(previous);
      setError(tr("toggleFailed"));
    }
  };

  const openPageEditor = (item: NavbarItemAdmin) => {
    setExpandedPageId(expandedPageId === item.id ? null : item.id);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{tr("navbarManager")}</h1>
      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <div className="bg-white rounded-xl border p-4 mb-6 flex gap-2 flex-wrap">
        <input
          placeholder={tr("label")}
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          className="border rounded px-3 py-2 flex-1 min-w-[140px]"
        />
        <input
          placeholder={tr("slug")}
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="border rounded px-3 py-2 flex-1 min-w-[140px]"
          dir="ltr"
        />
        <input
          type="number"
          placeholder={tr("order")}
          value={form.sort_order}
          onChange={(e) => setForm({ ...form, sort_order: +e.target.value })}
          className="border rounded px-3 py-2 w-24"
        />
        <button
          onClick={add}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          {tr("add")}
        </button>
      </div>
      <table className="w-full bg-white rounded-xl border text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="p-3 text-start">{tr("label")}</th>
            <th className="p-3 text-start">{tr("slug")}</th>
            <th className="p-3">{tr("order")}</th>
            <th className="p-3">{tr("active")}</th>
            <th className="p-3">{tr("page")}</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <Fragment key={item.id}>
              <tr className="border-b">
                <td className="p-3">{item.label}</td>
                <td className="p-3" dir="ltr">
                  {item.slug}
                </td>
                <td className="p-3 text-center">{item.sort_order}</td>
                <td className="p-3 text-center">{item.is_active ? "✓" : "—"}</td>
                <td className="p-3 text-center">
                  <button
                    type="button"
                    className="text-blue-600 text-xs font-semibold"
                    onClick={() => openPageEditor(item)}
                  >
                    {item.page_id ? tr("editPage") : tr("createPage")}
                  </button>
                </td>
                <td className="p-3 text-end space-x-2">
                  <button
                    type="button"
                    className="text-blue-600"
                    onClick={() => toggleItem(item)}
                  >
                    {tr("toggle")}
                  </button>
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={() => api.navbar.delete(item.id).then(load)}
                  >
                    {tr("delete")}
                  </button>
                </td>
              </tr>
              {expandedPageId === item.id && (
                <tr>
                  <td colSpan={6} className="p-3 bg-gray-50">
                    <PageEditorPanel
                      pageId={item.page_id ?? null}
                      navbarItemId={item.id}
                      suggestedSlug={slugFromNavbarPath(item.slug)}
                      onSaved={() => {
                        load();
                        setExpandedPageId(null);
                      }}
                      onCancel={() => setExpandedPageId(null)}
                    />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
