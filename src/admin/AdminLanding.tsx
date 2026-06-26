import { useEffect, useState } from "react";
import { api, type LandingData, type SpotlightItem, type ServiceItem, type PollOption, type JobItem, type StoryItem, type GovtServiceItem } from "../lib/api";
import { RichTextEditor } from "./RichTextEditor";
import { ImageUploader } from "./ImageUploader";
import { useAdminI18n } from "./AdminLanguageContext";

const defaultLanding: LandingData = {
  hero_title: "",
  hero_subtitle: "",
  stats: [{ value: "", label: "" }, { value: "", label: "" }, { value: "", label: "" }],
  breaking_ticker: "",
  spotlight: [],
  about_content: "",
  services: [],
  poll: { question: "", options: [], totalVotes: 0 },
  jobs: [],
  stories: [],
  govt_services: [],
};

function newSpotlight(order: number): SpotlightItem {
  return { id: crypto.randomUUID(), image: "", title: "", description: "", link: "#", sort_order: order };
}
function newService(rank: number): ServiceItem {
  return { rank, name: "", count: "0", color: "#1673B8" };
}
function newJob(): JobItem {
  return { id: crypto.randomUUID(), title: "", company: "", companyLogo: "", location: "", postedDate: "", salary: "", type: "دوام كامل", tags: [] };
}
function newStory(): StoryItem {
  return { id: crypto.randomUUID(), title: "", excerpt: "", image: "" };
}
function newGovtService(): GovtServiceItem {
  return { id: crypto.randomUUID(), icon: "🏠", title: "", description: "", authority: "", badge: "" };
}

type SectionKey = "services" | "jobs" | "stories" | "govt_services";

export function AdminLanding() {
  const { tr } = useAdminI18n();
  const [data, setData] = useState<LandingData>(defaultLanding);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.landing.get().then((d) => {
      setData({
        ...defaultLanding,
        ...d,
        stats: d.stats?.length === 3 ? d.stats : defaultLanding.stats,
        spotlight: d.spotlight || [],
        services: d.services || [],
        poll: d.poll || defaultLanding.poll,
        jobs: d.jobs || [],
        stories: d.stories || [],
        govt_services: d.govt_services || [],
      });
    }).finally(() => setLoading(false));
  }, []);

  const updateStat = (index: number, field: "value" | "label", value: string) => {
    setData((prev) => { const s = [...prev.stats]; s[index] = { ...s[index], [field]: value }; return { ...prev, stats: s }; });
  };
  const updateSpotlight = (id: string, field: keyof SpotlightItem, value: string | number) => {
    setData((prev) => ({ ...prev, spotlight: prev.spotlight.map((s) => s.id === id ? { ...s, [field]: value } : s) }));
  };
  const moveSpotlight = (index: number, dir: -1 | 1) => {
    setData((prev) => {
      const list = [...prev.spotlight].sort((a, b) => a.sort_order - b.sort_order);
      const target = index + dir;
      if (target < 0 || target >= list.length) return prev;
      [list[index], list[target]] = [list[target], list[index]];
      return { ...prev, spotlight: list.map((item, i) => ({ ...item, sort_order: i })) };
    });
  };

  const updateListItem = <T,>(key: SectionKey, id: string, field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      [key]: prev[key].map((item: any) => item.id === id ? { ...item, [field]: value } : item),
    }));
  };

  const moveItem = (key: SectionKey, index: number, dir: -1 | 1) => {
    setData((prev: any) => {
      const list = [...prev[key]];
      const target = index + dir;
      if (target < 0 || target >= list.length) return prev;
      [list[index], list[target]] = [list[target], list[index]];
      return { ...prev, [key]: list };
    });
  };

  const removeItem = (key: SectionKey, id: string) => {
    setData((prev: any) => ({ ...prev, [key]: prev[key].filter((item: any) => item.id !== id) }));
  };

  const save = async () => {
    setSaving(true); setMessage("");
    try { await api.landing.update(data); setMessage(tr("saved")); }
    catch { setMessage(tr("saveFailed")); }
    finally { setSaving(false); }
  };

  if (loading) return <p className="text-gray-500">{tr("loading")}</p>;

  const sortedSpotlight = [...data.spotlight].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{tr("landingPage")}</h1>
        <button type="button" onClick={save} disabled={saving} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm disabled:opacity-50">{tr("save")}</button>
      </div>
      {message && (
        <p className={`text-sm px-3 py-2 rounded-lg border ${message === tr("saved") ? "text-green-700 bg-green-50 border-green-200" : "text-red-700 bg-red-50 border-red-200"}`}>{message}</p>
      )}

      {/* Hero Section */}
      <section className="bg-white rounded-xl border p-5 space-y-4">
        <h2 className="font-bold text-lg">{tr("heroSection")}</h2>
        <input placeholder={tr("heroTitle")} value={data.hero_title} onChange={(e) => setData({ ...data, hero_title: e.target.value })} className="w-full border rounded px-3 py-2" />
        <input placeholder={tr("heroSubtitle")} value={data.hero_subtitle} onChange={(e) => setData({ ...data, hero_subtitle: e.target.value })} className="w-full border rounded px-3 py-2" />
        <div>
          <p className="text-sm font-semibold mb-2">{tr("stats")}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data.stats.map((stat, i) => (
              <div key={i} className="border rounded-lg p-3 space-y-2">
                <input placeholder={tr("statValue")} value={stat.value} onChange={(e) => updateStat(i, "value", e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm" />
                <input placeholder={tr("statLabel")} value={stat.label} onChange={(e) => updateStat(i, "label", e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">{tr("breakingTicker")}</label>
          <p className="text-xs text-gray-500 mb-2">{tr("breakingTickerHint")}</p>
          <textarea value={data.breaking_ticker} onChange={(e) => setData({ ...data, breaking_ticker: e.target.value })} className="w-full border rounded px-3 py-2 h-24 text-sm" />
        </div>
      </section>

      {/* Spotlight */}
      <section className="bg-white rounded-xl border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">{tr("spotlight")}</h2>
          <button type="button" onClick={() => setData((prev) => ({ ...prev, spotlight: [...prev.spotlight, newSpotlight(prev.spotlight.length)] }))} className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg">{tr("addSpotlight")}</button>
        </div>
        {sortedSpotlight.map((item, index) => (
          <div key={item.id} className="border rounded-lg p-4 space-y-2">
            <div><label className="text-sm font-medium block mb-1">{tr("spotlightImage")}</label><ImageUploader value={item.image} onChange={(url) => updateSpotlight(item.id, "image", url)} /></div>
            <input placeholder={tr("title")} value={item.title} onChange={(e) => updateSpotlight(item.id, "title", e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
            <textarea placeholder={tr("spotlightDesc")} value={item.description} onChange={(e) => updateSpotlight(item.id, "description", e.target.value)} className="w-full border rounded px-3 py-2 text-sm h-20" />
            <input placeholder={tr("spotlightLink")} value={item.link} onChange={(e) => updateSpotlight(item.id, "link", e.target.value)} className="w-full border rounded px-3 py-2 text-sm" dir="ltr" />
            <div className="flex gap-2">
              <button type="button" onClick={() => moveSpotlight(index, -1)} className="text-xs border px-2 py-1 rounded">{tr("moveUp")}</button>
              <button type="button" onClick={() => moveSpotlight(index, 1)} className="text-xs border px-2 py-1 rounded">{tr("moveDown")}</button>
              <button type="button" onClick={() => setData((prev) => ({ ...prev, spotlight: prev.spotlight.filter((s) => s.id !== item.id) }))} className="text-xs text-red-600 border border-red-200 px-2 py-1 rounded">{tr("delete")}</button>
            </div>
          </div>
        ))}
      </section>

      {/* Services */}
      <section className="bg-white rounded-xl border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Most Requested Services</h2>
          <button type="button" onClick={() => setData((prev) => ({ ...prev, services: [...prev.services, newService(prev.services.length + 1)] }))} className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg">Add Service</button>
        </div>
        {data.services.map((item, i) => (
          <div key={i} className="border rounded-lg p-3 space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <label className="text-xs text-gray-500">Rank</label>
                <input type="number" value={item.rank} onChange={(e) => { const list = [...data.services]; list[i] = { ...list[i], rank: +e.target.value }; setData({ ...data, services: list }); }} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Name</label>
                <input value={item.name} onChange={(e) => { const list = [...data.services]; list[i] = { ...list[i], name: e.target.value }; setData({ ...data, services: list }); }} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Count</label>
                <input value={item.count} onChange={(e) => { const list = [...data.services]; list[i] = { ...list[i], count: e.target.value }; setData({ ...data, services: list }); }} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Color</label>
                <input value={item.color} onChange={(e) => { const list = [...data.services]; list[i] = { ...list[i], color: e.target.value }; setData({ ...data, services: list }); }} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => moveItem("services", i, -1)} className="text-xs border px-2 py-1 rounded">Up</button>
              <button type="button" onClick={() => moveItem("services", i, 1)} className="text-xs border px-2 py-1 rounded">Down</button>
              <button type="button" onClick={() => { const list = [...data.services]; list.splice(i, 1); setData({ ...data, services: list }); }} className="text-xs text-red-600 border border-red-200 px-2 py-1 rounded">Delete</button>
            </div>
          </div>
        ))}
      </section>

      {/* Poll */}
      <section className="bg-white rounded-xl border p-5 space-y-4">
        <h2 className="font-bold text-lg">Weekly Poll</h2>
        <div>
          <label className="text-sm font-medium block mb-1">Question</label>
          <input value={data.poll?.question || ""} onChange={(e) => setData({ ...data, poll: { ...data.poll, question: e.target.value, options: data.poll?.options || [], totalVotes: data.poll?.totalVotes || 0 } })} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Total Votes</label>
          <input type="number" value={data.poll?.totalVotes || 0} onChange={(e) => setData({ ...data, poll: { ...data.poll, question: data.poll?.question || "", options: data.poll?.options || [], totalVotes: +e.target.value } })} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Options</label>
            <button type="button" onClick={() => { const opts = [...(data.poll?.options || []), { label: "", percent: 0 }]; setData({ ...data, poll: { ...data.poll, question: data.poll?.question || "", options: opts, totalVotes: data.poll?.totalVotes || 0 } }); }} className="text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">Add Option</button>
          </div>
          {(data.poll?.options || []).map((opt, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input placeholder="Label" value={opt.label} onChange={(e) => { const opts = [...(data.poll?.options || [])]; opts[i] = { ...opts[i], label: e.target.value }; setData({ ...data, poll: { ...data.poll, options: opts } }); }} className="flex-1 border rounded px-2 py-1 text-sm" />
              <input type="number" placeholder="%" value={opt.percent} onChange={(e) => { const opts = [...(data.poll?.options || [])]; opts[i] = { ...opts[i], percent: +e.target.value }; setData({ ...data, poll: { ...data.poll, options: opts } }); }} className="w-20 border rounded px-2 py-1 text-sm" />
              <button type="button" onClick={() => { const opts = [...(data.poll?.options || [])]; opts.splice(i, 1); setData({ ...data, poll: { ...data.poll, options: opts } }); }} className="text-xs text-red-600">Remove</button>
            </div>
          ))}
        </div>
      </section>

      {/* Jobs */}
      <section className="bg-white rounded-xl border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Job Opportunities</h2>
          <button type="button" onClick={() => setData((prev) => ({ ...prev, jobs: [...prev.jobs, newJob()] }))} className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg">Add Job</button>
        </div>
        {data.jobs.map((job, i) => (
          <div key={job.id} className="border rounded-lg p-4 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-500">Title</label>
                <input value={job.title} onChange={(e) => { const list = [...data.jobs]; list[i] = { ...list[i], title: e.target.value }; setData({ ...data, jobs: list }); }} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Company</label>
                <input value={job.company} onChange={(e) => { const list = [...data.jobs]; list[i] = { ...list[i], company: e.target.value }; setData({ ...data, jobs: list }); }} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Type</label>
                <select value={job.type} onChange={(e) => { const list = [...data.jobs]; list[i] = { ...list[i], type: e.target.value }; setData({ ...data, jobs: list }); }} className="w-full border rounded px-2 py-1 text-sm">
                  <option>دوام كامل</option><option>دوام جزئي</option><option>عن بعد</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Location</label>
                <input value={job.location} onChange={(e) => { const list = [...data.jobs]; list[i] = { ...list[i], location: e.target.value }; setData({ ...data, jobs: list }); }} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Salary</label>
                <input value={job.salary} onChange={(e) => { const list = [...data.jobs]; list[i] = { ...list[i], salary: e.target.value }; setData({ ...data, jobs: list }); }} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Posted Date</label>
                <input value={job.postedDate} onChange={(e) => { const list = [...data.jobs]; list[i] = { ...list[i], postedDate: e.target.value }; setData({ ...data, jobs: list }); }} className="w-full border rounded px-2 py-1 text-sm" placeholder="منذ ٣ أيام" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Company Logo</label>
              <ImageUploader value={job.companyLogo} onChange={(url) => { const list = [...data.jobs]; list[i] = { ...list[i], companyLogo: url }; setData({ ...data, jobs: list }); }} />
            </div>
            <div>
              <label className="text-xs text-gray-500">Tags (comma separated)</label>
              <input value={job.tags?.join(", ") || ""} onChange={(e) => { const list = [...data.jobs]; list[i] = { ...list[i], tags: e.target.value.split(",").map((t: string) => t.trim()).filter(Boolean) }; setData({ ...data, jobs: list }); }} className="w-full border rounded px-2 py-1 text-sm" />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => moveItem("jobs", i, -1)} className="text-xs border px-2 py-1 rounded">Up</button>
              <button type="button" onClick={() => moveItem("jobs", i, 1)} className="text-xs border px-2 py-1 rounded">Down</button>
              <button type="button" onClick={() => { const list = [...data.jobs]; list.splice(i, 1); setData({ ...data, jobs: list }); }} className="text-xs text-red-600 border border-red-200 px-2 py-1 rounded">Delete</button>
            </div>
          </div>
        ))}
      </section>

      {/* Stories */}
      <section className="bg-white rounded-xl border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Success Stories</h2>
          <button type="button" onClick={() => setData((prev) => ({ ...prev, stories: [...prev.stories, newStory()] }))} className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg">Add Story</button>
        </div>
        {data.stories.map((story, i) => (
          <div key={story.id} className="border rounded-lg p-4 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500">Title</label>
                <input value={story.title} onChange={(e) => { const list = [...data.stories]; list[i] = { ...list[i], title: e.target.value }; setData({ ...data, stories: list }); }} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Excerpt</label>
                <input value={story.excerpt} onChange={(e) => { const list = [...data.stories]; list[i] = { ...list[i], excerpt: e.target.value }; setData({ ...data, stories: list }); }} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Image</label>
              <ImageUploader value={story.image} onChange={(url) => { const list = [...data.stories]; list[i] = { ...list[i], image: url }; setData({ ...data, stories: list }); }} />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => moveItem("stories", i, -1)} className="text-xs border px-2 py-1 rounded">Up</button>
              <button type="button" onClick={() => moveItem("stories", i, 1)} className="text-xs border px-2 py-1 rounded">Down</button>
              <button type="button" onClick={() => { const list = [...data.stories]; list.splice(i, 1); setData({ ...data, stories: list }); }} className="text-xs text-red-600 border border-red-200 px-2 py-1 rounded">Delete</button>
            </div>
          </div>
        ))}
      </section>

      {/* Government Services */}
      <section className="bg-white rounded-xl border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Government Services</h2>
          <button type="button" onClick={() => setData((prev) => ({ ...prev, govt_services: [...prev.govt_services, newGovtService()] }))} className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg">Add Service</button>
        </div>
        {data.govt_services.map((svc, i) => (
          <div key={svc.id} className="border rounded-lg p-4 space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-500">Icon (emoji)</label>
                <input value={svc.icon} onChange={(e) => { const list = [...data.govt_services]; list[i] = { ...list[i], icon: e.target.value }; setData({ ...data, govt_services: list }); }} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Title</label>
                <input value={svc.title} onChange={(e) => { const list = [...data.govt_services]; list[i] = { ...list[i], title: e.target.value }; setData({ ...data, govt_services: list }); }} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Badge</label>
                <select value={svc.badge} onChange={(e) => { const list = [...data.govt_services]; list[i] = { ...list[i], badge: e.target.value }; setData({ ...data, govt_services: list }); }} className="w-full border rounded px-2 py-1 text-sm">
                  <option value="">None</option><option>جديد</option><option>الأكثر طلباً</option><option>طوارئ</option><option>مميز</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Authority</label>
                <input value={svc.authority} onChange={(e) => { const list = [...data.govt_services]; list[i] = { ...list[i], authority: e.target.value }; setData({ ...data, govt_services: list }); }} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-gray-500">Description</label>
                <input value={svc.description} onChange={(e) => { const list = [...data.govt_services]; list[i] = { ...list[i], description: e.target.value }; setData({ ...data, govt_services: list }); }} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => moveItem("govt_services", i, -1)} className="text-xs border px-2 py-1 rounded">Up</button>
              <button type="button" onClick={() => moveItem("govt_services", i, 1)} className="text-xs border px-2 py-1 rounded">Down</button>
              <button type="button" onClick={() => { const list = [...data.govt_services]; list.splice(i, 1); setData({ ...data, govt_services: list }); }} className="text-xs text-red-600 border border-red-200 px-2 py-1 rounded">Delete</button>
            </div>
          </div>
        ))}
      </section>

      {/* About */}
      <section className="bg-white rounded-xl border p-5 space-y-3">
        <h2 className="font-bold text-lg">{tr("aboutSection")}</h2>
        <p className="text-sm text-gray-500">{tr("aboutContent")}</p>
        <RichTextEditor value={data.about_content} onChange={(about_content) => setData({ ...data, about_content })} />
      </section>
    </div>
  );
}
