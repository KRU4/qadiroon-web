import { useEffect, useState } from "react";
import { api, type PerformanceSettings } from "../lib/api";
import { useAdminI18n } from "./AdminLanguageContext";

export function AdminPerformance() {
  const { tr } = useAdminI18n();
  const [settings, setSettings] = useState<PerformanceSettings>({
    cache_ttl: 3600,
    minify_assets: false,
    cdn_base_url: "",
    lazy_load_images: true,
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.performance.get().then(setSettings);
  }, []);

  const save = async () => {
    await api.performance.update(settings);
    setMsg(tr("saved"));
  };

  const clearCache = async () => {
    await api.performance.clearCache();
    setMsg(tr("cacheCleared"));
  };

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">{tr("performance")}</h1>
      {msg && <p className="text-sm text-green-600">{msg}</p>}
      <div className="bg-white border rounded-xl p-5 space-y-4">
        <div>
          <label className="text-sm font-semibold">{tr("cacheTtl")}</label>
          <input type="number" value={settings.cache_ttl} onChange={(e) => setSettings({ ...settings, cache_ttl: +e.target.value })} className="w-full border rounded px-3 py-2 mt-1" />
        </div>
        <div>
          <label className="text-sm font-semibold">{tr("cdnUrl")}</label>
          <input value={settings.cdn_base_url} onChange={(e) => setSettings({ ...settings, cdn_base_url: e.target.value })} className="w-full border rounded px-3 py-2 mt-1" dir="ltr" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={settings.lazy_load_images} onChange={(e) => setSettings({ ...settings, lazy_load_images: e.target.checked })} />
          {tr("lazyLoad")}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={settings.minify_assets} onChange={(e) => setSettings({ ...settings, minify_assets: e.target.checked })} />
          {tr("minifyAssets")}
        </label>
        <div className="flex gap-2">
          <button onClick={save} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">{tr("save")}</button>
          <button onClick={clearCache} className="border px-4 py-2 rounded-lg text-sm">{tr("clearCache")}</button>
        </div>
      </div>
    </div>
  );
}
