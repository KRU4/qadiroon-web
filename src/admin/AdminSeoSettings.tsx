import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAdminI18n } from "./AdminLanguageContext";

export function AdminSeoSettings() {
  const { tr } = useAdminI18n();
  const [robots, setRobots] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.seoSettings.get().then((r) => setRobots(r.robots_txt));
  }, []);

  const save = async () => {
    await api.seoSettings.update(robots);
    setMsg(tr("saved"));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">{tr("seoSettings")}</h1>
      <p className="text-sm text-gray-500">{tr("sitemapHint")}</p>
      {msg && <p className="text-sm text-green-600">{msg}</p>}
      <div className="bg-white border rounded-xl p-5 space-y-3">
        <label className="text-sm font-semibold">robots.txt</label>
        <textarea value={robots} onChange={(e) => setRobots(e.target.value)} className="w-full border rounded px-3 py-2 h-40 font-mono text-sm" dir="ltr" />
        <button onClick={save} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">{tr("save")}</button>
      </div>
    </div>
  );
}
