import { useEffect, useState } from "react";
import { api, type AdSlotRecord } from "../lib/api";
import { ImageUploader } from "./ImageUploader";
import { IconEye, IconPlus, IconTrash } from "@tabler/icons-react";

const SLOT_PLACEMENTS: { code: string; label: string; top: string; left: string; width: string; height: string; color: string }[] = [
  { code: "TOP_BANNER", label: "Top Banner", top: "2%", left: "10%", width: "80%", height: "8%", color: "bg-blue-200 border-blue-500" },
  { code: "LEFT_EDGE_TOP", label: "Left Edge Top", top: "15%", left: "1%", width: "8%", height: "20%", color: "bg-green-200 border-green-500" },
  { code: "LEFT_EDGE_MID", label: "Left Edge Mid", top: "45%", left: "1%", width: "8%", height: "20%", color: "bg-green-200 border-green-500" },
  { code: "RIGHT_EDGE_TOP", label: "Right Edge Top", top: "15%", left: "91%", width: "8%", height: "20%", color: "bg-purple-200 border-purple-500" },
  { code: "RIGHT_EDGE_MID", label: "Right Edge Mid", top: "45%", left: "91%", width: "8%", height: "20%", color: "bg-purple-200 border-purple-500" },
  { code: "SIDEBAR_300x600", label: "Sidebar", top: "15%", left: "79%", width: "12%", height: "50%", color: "bg-yellow-200 border-yellow-500" },
  { code: "BETWEEN_NEWS_BOX_1", label: "Between News 1", top: "70%", left: "10%", width: "80%", height: "6%", color: "bg-pink-200 border-pink-500" },
  { code: "BETWEEN_NEWS_BOX_2", label: "Between News 2", top: "80%", left: "10%", width: "35%", height: "15%", color: "bg-orange-200 border-orange-500" },
  { code: "BETWEEN_NEWS_BOX_3", label: "Between News 3", top: "80%", left: "55%", width: "35%", height: "15%", color: "bg-orange-200 border-orange-500" },
];

export function AdminAds() {
  const [ads, setAds] = useState<AdSlotRecord[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [previewAd, setPreviewAd] = useState<AdSlotRecord | null>(null);
  const load = () => api.ads.list().then(setAds);
  useEffect(() => { load(); }, []);

  const update = (ad: AdSlotRecord, field: string, value: string | number | boolean) => {
    const next = { ...ad, [field]: value };
    api.ads.update(ad.id, next).then(load);
  };

  const create = async (slotCode: string) => {
    await api.ads.list().then((all) => {
      const inSlot = all.filter((a) => a.slot_code === slotCode);
      const maxOrder = Math.max(0, ...inSlot.map((a) => a.sort_order ?? 0));
      return api.ads.create({
        slot_code: slotCode,
        label: `Ad ${inSlot.length + 1}`,
        sort_order: maxOrder + 1,
        is_active: 0,
      } as AdSlotRecord & { sort_order: number });
    });
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this ad?")) return;
    await api.ads.delete(id);
    load();
  };

  const filteredAds = selectedSlot ? ads.filter((a) => a.slot_code === selectedSlot) : ads;

  const slotColors: Record<string, string> = {};
  SLOT_PLACEMENTS.forEach((s) => { slotColors[s.code] = s.color; });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Ad Slots</h1>
      <p className="text-sm text-gray-600 mb-6">
        Click a region on the page mockup to filter ads by slot. Each slot can have multiple ads (round-robin rotation).
      </p>

      {/* Visual mockup */}
      <div className="bg-white border rounded-xl p-4 mb-6">
        <h2 className="font-semibold mb-3 text-sm text-gray-600">Page Layout — Click a region to manage its ads</h2>
        <div className="relative bg-gray-50 border rounded-lg" style={{ height: "420px" }}>
          {/* Main content area */}
          <div className="absolute inset-[12%_12%_25%_12%] bg-white border rounded-lg flex items-center justify-center text-gray-300 text-sm">
            Main Content Area
          </div>
          {/* Header bar */}
          <div className="absolute top-[3%] left-[12%] w-[76%] h-[6%] bg-gray-100 border rounded flex items-center justify-center text-xs text-gray-400">
            Header + Navbar
          </div>
          {SLOT_PLACEMENTS.map((s) => {
            const slotAds = ads.filter((a) => a.slot_code === s.code);
            const activeCount = slotAds.filter((a) => a.is_active).length;
            return (
              <button
                key={s.code}
                onClick={() => setSelectedSlot(selectedSlot === s.code ? null : s.code)}
                className={`absolute border-2 rounded flex flex-col items-center justify-center text-xs font-mono cursor-pointer transition-all hover:opacity-80 ${
                  s.color
                } ${selectedSlot === s.code ? "ring-2 ring-blue-500 z-10 scale-105" : ""}`}
                style={{ top: s.top, left: s.left, width: s.width, height: s.height }}
                title={`${s.label} (${slotAds.length} ads, ${activeCount} active)`}
              >
                <span className="font-bold text-[10px] truncate px-1">{s.code}</span>
                <span className="text-[9px]">{slotAds.length} ad{slotAds.length !== 1 ? "s" : ""} / {activeCount} active</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter + actions */}
      <div className="flex items-center gap-3 mb-4">
        {selectedSlot && (
          <>
            <span className="font-mono text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{selectedSlot}</span>
            <button onClick={() => setSelectedSlot(null)} className="text-sm text-gray-500 hover:text-gray-700">Show all</button>
            <button
              onClick={() => create(selectedSlot)}
              className="flex items-center gap-1 text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg"
            >
              <IconPlus size={14} /> Add ad to this slot
            </button>
          </>
        )}
        {!selectedSlot && (
          <p className="text-sm text-gray-500">Click a slot region above to filter, or view all below</p>
        )}
      </div>

      {/* Ad list */}
      <div className="space-y-4">
        {filteredAds.map((ad) => (
          <div key={ad.id} className={`bg-white border rounded-xl p-4 space-y-3 ${ad.is_active ? "border-gray-200" : "border-dashed border-gray-300 opacity-70"}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-mono text-sm text-blue-600">{ad.slot_code}</p>
                <input
                  placeholder="Label"
                  defaultValue={ad.label || ""}
                  onBlur={(e) => update(ad, "label", e.target.value)}
                  className="border rounded px-2 py-0.5 text-xs mt-1"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm flex items-center gap-2">
                  <input type="checkbox" checked={!!ad.is_active} onChange={(e) => update(ad, "is_active", e.target.checked)} />
                  Active
                </label>
                <input
                  type="number"
                  min="0"
                  defaultValue={ad.sort_order ?? 0}
                  onBlur={(e) => update(ad, "sort_order", +e.target.value)}
                  className="w-16 border rounded px-1 py-0.5 text-xs text-center"
                  title="Sort order (rotation position)"
                />
                <button onClick={() => setPreviewAd(ad)} className="text-gray-400 hover:text-blue-600" title="Preview">
                  <IconEye size={18} />
                </button>
                <button onClick={() => remove(ad.id)} className="text-gray-400 hover:text-red-600" title="Delete">
                  <IconTrash size={16} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Ad Image</label>
              <ImageUploader
                value={ad.image_url || ""}
                onChange={(url) => update(ad, "image_url", url)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input placeholder="Link URL" defaultValue={ad.link_url || ""} onBlur={(e) => update(ad, "link_url", e.target.value)} className="border rounded px-3 py-2 text-sm" />
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">W:</label>
                <input type="number" defaultValue={ad.width || 300} onBlur={(e) => update(ad, "width", +e.target.value)} className="w-20 border rounded px-2 py-1 text-sm" />
                <label className="text-xs text-gray-500">H:</label>
                <input type="number" defaultValue={ad.height || 250} onBlur={(e) => update(ad, "height", +e.target.value)} className="w-20 border rounded px-2 py-1 text-sm" />
              </div>
              <input type="date" defaultValue={ad.expires_at?.slice(0, 10) || ""} onBlur={(e) => update(ad, "expires_at", e.target.value)} className="border rounded px-3 py-2 text-sm" />
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewAd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setPreviewAd(null)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()} style={{ fontFamily: "Cairo, sans-serif" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Ad Preview — {previewAd.slot_code}</h3>
              <button onClick={() => setPreviewAd(null)} className="text-gray-400 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg mx-auto flex items-center justify-center bg-gray-50 overflow-hidden"
              style={{ width: Math.min(previewAd.width || 300, 600), height: Math.min(previewAd.height || 250, 400) }}
            >
              {previewAd.image_url ? (
                <img src={previewAd.image_url} alt={previewAd.label || ""} className="w-full h-full object-contain" />
              ) : (
                <div className="text-center text-gray-400 text-sm p-4">
                  <p className="font-mono">{previewAd.slot_code}</p>
                  <p className="text-xs mt-1">{previewAd.width} &times; {previewAd.height}</p>
                  <p className="text-xs mt-1">No image set</p>
                </div>
              )}
            </div>
            <div className="text-center text-xs text-gray-400 mt-3">
              {previewAd.width} &times; {previewAd.height} &middot; {previewAd.slot_code}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
