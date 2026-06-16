import { useEffect, useState } from "react";
import { api, type AdSlotRecord } from "../lib/api";

export function AdminAds() {
  const [ads, setAds] = useState<AdSlotRecord[]>([]);
  const load = () => api.ads.list().then(setAds);
  useEffect(() => { load(); }, []);

  const update = (ad: AdSlotRecord, field: string, value: string | number | boolean) => {
    const next = { ...ad, [field]: value };
    api.ads.update(ad.id, next).then(load);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Ad Slots</h1>
      <p className="text-sm text-gray-600 mb-4">Manage all ad positions on the public site. Inactive or expired slots hide automatically.</p>
      <div className="space-y-4">
        {ads.map((ad) => (
          <div key={ad.id} className="bg-white border rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-mono text-sm text-blue-600">{ad.slot_code}</p>
                <p className="text-xs text-gray-500">{ad.label}</p>
              </div>
              <label className="text-sm flex items-center gap-2">
                <input type="checkbox" checked={!!ad.is_active} onChange={(e) => update(ad, "is_active", e.target.checked)} />
                Active
              </label>
            </div>
            <input placeholder="Image URL" defaultValue={ad.image_url || ""} onBlur={(e) => update(ad, "image_url", e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
            <input placeholder="Link URL" defaultValue={ad.link_url || ""} onBlur={(e) => update(ad, "link_url", e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
            <input type="date" defaultValue={ad.expires_at?.slice(0, 10) || ""} onBlur={(e) => update(ad, "expires_at", e.target.value)} className="border rounded px-3 py-2 text-sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
