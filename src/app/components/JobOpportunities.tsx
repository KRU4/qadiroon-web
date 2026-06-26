import type { JobItem } from "../../lib/api";
import { Building, MapPin, Clock, Briefcase, ExternalLink } from "lucide-react";

const typeColors: Record<string, string> = {
  "دوام كامل": "bg-blue-100 text-blue-700",
  "دوام جزئي": "bg-amber-100 text-amber-700",
  "عن بعد": "bg-green-100 text-green-700",
};

interface Props {
  darkMode: boolean;
  jobs: JobItem[];
}

export function JobOpportunities({ darkMode, jobs }: Props) {
  if (!jobs || jobs.length === 0) return null;

  return (
    <section className={`py-10 ${darkMode ? "bg-gray-900" : "bg-white"}`} dir="rtl">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-title text-xl font-black" style={{ color: "#1673B8", fontFamily: "Cairo, sans-serif" }}>
            فرص العمل لذوي الإعاقة
          </h2>
          <button
            className="text-sm font-bold px-4 py-2 rounded-full border-2 transition-all"
            style={{ borderColor: "#1673B8", color: "#1673B8", fontFamily: "Cairo, sans-serif" }}
          >
            جميع الوظائف
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <div
              key={job.id}
              className={`rounded-2xl border p-5 flex flex-col gap-3 ${
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
              } shadow-sm`}
            >
              <div className="flex items-start justify-between">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${typeColors[job.type] || "bg-gray-100 text-gray-600"}`}
                  style={{ fontFamily: "Cairo, sans-serif" }}
                >
                  {job.type}
                </span>
                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                  {job.companyLogo ? (
                    <img src={job.companyLogo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Building size={18} className="text-gray-400" />
                  )}
                </div>
              </div>
              <h3 className="font-bold mt-1" style={{ fontFamily: "Cairo, sans-serif" }}>
                {job.title}
              </h3>
              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Building size={13} />
                  <span style={{ fontFamily: "Cairo, sans-serif" }}>{job.company}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} />
                  <span style={{ fontFamily: "Cairo, sans-serif" }}>{job.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={13} />
                  <span style={{ fontFamily: "Cairo, sans-serif" }}>{job.postedDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase size={13} />
                  <span className="font-semibold text-gray-700" style={{ fontFamily: "Cairo, sans-serif" }}>
                    {job.salary}
                  </span>
                </div>
              </div>
              {job.tags && job.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                      style={{ fontFamily: "Cairo, sans-serif" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <button
                className="w-full mt-auto flex items-center justify-center gap-1.5 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style={{ backgroundColor: "#1673B8", fontFamily: "Cairo, sans-serif" }}
              >
                تقدم الآن <ExternalLink size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
