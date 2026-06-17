import { useEffect, useState } from "react";
import { api, type CategoryRecord } from "../lib/api";
import { ImageUploader } from "./ImageUploader";

export function AdminCategories() {
  const [items, setItems] = useState<CategoryRecord[]>([]);
  const [form, setForm] = useState({ name: "", slug: "", description: "", image_url: "" });

  const load = () => api.categories.list().then(setItems);
  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Categories</h1>
      <div className="bg-white rounded-xl border p-4 mb-6 space-y-3">
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2" />
        <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full border rounded px-3 py-2" />
        <textarea placeholder="About this category" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded px-3 py-2 h-24" />
        <div>
          <label className="block text-sm font-medium mb-1">Category Image</label>
          <ImageUploader value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} />
        </div>
        <button onClick={() => api.categories.create(form).then(() => { setForm({ name: "", slug: "", description: "", image_url: "" }); load(); })} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Add Category</button>
      </div>
      <div className="space-y-2">
        {items.map((c) => (
          <div key={c.id} className="bg-white border rounded-lg p-4 flex justify-between items-start gap-4">
            <div className="flex gap-4 items-start">
              {c.image_url && <img src={c.image_url} alt={c.name} className="w-16 h-16 rounded-lg object-cover" />}
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-gray-500">{c.slug}</p>
                <p className="text-xs text-gray-500">{c.description}</p>
              </div>
            </div>
            <button className="text-red-600 text-sm" onClick={() => api.categories.delete(c.id).then(load)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
