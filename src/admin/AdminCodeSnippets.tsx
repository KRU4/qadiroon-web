import { useEffect, useState } from "react";
import { api, type SnippetRecord } from "../lib/api";
import { useAdminI18n } from "./AdminLanguageContext";

const empty = { name: "", type: "head" as const, code: "", is_active: 1, scope: "all", scope_target: "" };

export function AdminCodeSnippets() {
  const { tr } = useAdminI18n();
  const [items, setItems] = useState<SnippetRecord[]>([]);
  const [form, setForm] = useState(empty);

  const load = () => api.snippets.list().then(setItems);
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name || !form.code) return;
    await api.snippets.create(form);
    setForm(empty);
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{tr("codeSnippets")}</h1>
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <input placeholder={tr("snippetName")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2" />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as SnippetRecord["type"] })} className="border rounded px-3 py-2">
          <option value="head">head</option>
          <option value="body-start">body-start</option>
          <option value="body-end">body-end</option>
        </select>
        <textarea placeholder="HTML / JS / CSS" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full border rounded px-3 py-2 h-32 font-mono text-sm" dir="ltr" />
        <button onClick={save} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">{tr("add")}</button>
      </div>
      <div className="space-y-2">
        {items.map((s) => (
          <div key={s.id} className="bg-white border rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">{s.name}</p>
              <p className="text-xs text-gray-500">{s.type} · {s.is_active ? tr("active") : "off"}</p>
            </div>
            <button className="text-red-600 text-sm" onClick={() => api.snippets.delete(s.id).then(load)}>{tr("delete")}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
