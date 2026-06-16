import { useEffect, useState } from "react";
import { api, type LandingData, type SpotlightItem } from "../lib/api";
import { RichTextEditor } from "./RichTextEditor";
import { useAdminI18n } from "./AdminLanguageContext";

const defaultLanding: LandingData = {
  hero_title: "",
  hero_subtitle: "",
  stats: [
    { value: "", label: "" },
    { value: "", label: "" },
    { value: "", label: "" },
  ],
  breaking_ticker: "",
  spotlight: [],
  about_content: "",
};

function newSpotlight(order: number): SpotlightItem {
  return {
    id: crypto.randomUUID(),
    image: "",
    title: "",
    description: "",
    link: "#",
    sort_order: order,
  };
}

export function AdminLanding() {
  const { tr } = useAdminI18n();
  const [data, setData] = useState<LandingData>(defaultLanding);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.landing
      .get()
      .then((d) => {
        setData({
          ...defaultLanding,
          ...d,
          stats: d.stats?.length === 3 ? d.stats : defaultLanding.stats,
          spotlight: d.spotlight || [],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const updateStat = (index: number, field: "value" | "label", value: string) => {
    setData((prev) => {
      const stats = [...prev.stats];
      stats[index] = { ...stats[index], [field]: value };
      return { ...prev, stats };
    });
  };

  const updateSpotlight = (
    id: string,
    field: keyof SpotlightItem,
    value: string | number,
  ) => {
    setData((prev) => ({
      ...prev,
      spotlight: prev.spotlight.map((s) =>
        s.id === id ? { ...s, [field]: value } : s,
      ),
    }));
  };

  const moveSpotlight = (index: number, dir: -1 | 1) => {
    setData((prev) => {
      const list = [...prev.spotlight].sort((a, b) => a.sort_order - b.sort_order);
      const target = index + dir;
      if (target < 0 || target >= list.length) return prev;
      [list[index], list[target]] = [list[target], list[index]];
      return {
        ...prev,
        spotlight: list.map((item, i) => ({ ...item, sort_order: i })),
      };
    });
  };

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      await api.landing.update(data);
      setMessage(tr("saved"));
    } catch {
      setMessage(tr("saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-gray-500">{tr("loading")}</p>;
  }

  const sortedSpotlight = [...data.spotlight].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{tr("landingPage")}</h1>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm disabled:opacity-50"
        >
          {tr("save")}
        </button>
      </div>
      {message && (
        <p
          className={`text-sm px-3 py-2 rounded-lg border ${
            message === tr("saved")
              ? "text-green-700 bg-green-50 border-green-200"
              : "text-red-700 bg-red-50 border-red-200"
          }`}
        >
          {message}
        </p>
      )}

      <section className="bg-white rounded-xl border p-5 space-y-4">
        <h2 className="font-bold text-lg">{tr("heroSection")}</h2>
        <input
          placeholder={tr("heroTitle")}
          value={data.hero_title}
          onChange={(e) => setData({ ...data, hero_title: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
        <input
          placeholder={tr("heroSubtitle")}
          value={data.hero_subtitle}
          onChange={(e) => setData({ ...data, hero_subtitle: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
        <div>
          <p className="text-sm font-semibold mb-2">{tr("stats")}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data.stats.map((stat, i) => (
              <div key={i} className="border rounded-lg p-3 space-y-2">
                <input
                  placeholder={tr("statValue")}
                  value={stat.value}
                  onChange={(e) => updateStat(i, "value", e.target.value)}
                  className="w-full border rounded px-2 py-1.5 text-sm"
                />
                <input
                  placeholder={tr("statLabel")}
                  value={stat.label}
                  onChange={(e) => updateStat(i, "label", e.target.value)}
                  className="w-full border rounded px-2 py-1.5 text-sm"
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">
            {tr("breakingTicker")}
          </label>
          <p className="text-xs text-gray-500 mb-2">{tr("breakingTickerHint")}</p>
          <textarea
            value={data.breaking_ticker}
            onChange={(e) =>
              setData({ ...data, breaking_ticker: e.target.value })
            }
            className="w-full border rounded px-3 py-2 h-24 text-sm"
          />
        </div>
      </section>

      <section className="bg-white rounded-xl border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">{tr("spotlight")}</h2>
          <button
            type="button"
            onClick={() =>
              setData((prev) => ({
                ...prev,
                spotlight: [
                  ...prev.spotlight,
                  newSpotlight(prev.spotlight.length),
                ],
              }))
            }
            className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg"
          >
            {tr("addSpotlight")}
          </button>
        </div>
        {sortedSpotlight.map((item, index) => (
          <div key={item.id} className="border rounded-lg p-4 space-y-2">
            <input
              placeholder={tr("spotlightImage")}
              value={item.image}
              onChange={(e) => updateSpotlight(item.id, "image", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              dir="ltr"
            />
            <input
              placeholder={tr("title")}
              value={item.title}
              onChange={(e) => updateSpotlight(item.id, "title", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
            <textarea
              placeholder={tr("spotlightDesc")}
              value={item.description}
              onChange={(e) =>
                updateSpotlight(item.id, "description", e.target.value)
              }
              className="w-full border rounded px-3 py-2 text-sm h-20"
            />
            <input
              placeholder={tr("spotlightLink")}
              value={item.link}
              onChange={(e) => updateSpotlight(item.id, "link", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              dir="ltr"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => moveSpotlight(index, -1)}
                className="text-xs border px-2 py-1 rounded"
              >
                {tr("moveUp")}
              </button>
              <button
                type="button"
                onClick={() => moveSpotlight(index, 1)}
                className="text-xs border px-2 py-1 rounded"
              >
                {tr("moveDown")}
              </button>
              <button
                type="button"
                onClick={() =>
                  setData((prev) => ({
                    ...prev,
                    spotlight: prev.spotlight.filter((s) => s.id !== item.id),
                  }))
                }
                className="text-xs text-red-600 border border-red-200 px-2 py-1 rounded"
              >
                {tr("delete")}
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-white rounded-xl border p-5 space-y-3">
        <h2 className="font-bold text-lg">{tr("aboutSection")}</h2>
        <p className="text-sm text-gray-500">{tr("aboutContent")}</p>
        <RichTextEditor
          value={data.about_content}
          onChange={(about_content) => setData({ ...data, about_content })}
        />
      </section>
    </div>
  );
}
