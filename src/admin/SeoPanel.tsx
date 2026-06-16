import { useMemo } from "react";
import { runSeoChecks } from "../lib/seo";
import { useAdminI18n } from "./AdminLanguageContext";

export interface SeoData {
  meta_title: string;
  meta_description: string;
  focus_keyword: string;
  slug: string;
  canonical_url: string;
  og_title: string;
  og_description: string;
  og_image: string;
}

interface SeoPanelProps {
  title: string;
  content: string;
  slug: string;
  isPublished?: boolean;
  seo: SeoData;
  onChange: (seo: SeoData) => void;
  baseUrl?: string;
}

export function SeoPanel({
  title,
  content,
  slug,
  isPublished,
  seo,
  onChange,
  baseUrl = "https://qadiroon.com",
}: SeoPanelProps) {
  const { tr } = useAdminI18n();
  const set = (key: keyof SeoData, value: string) =>
    onChange({ ...seo, [key]: value });

  const displayTitle = seo.meta_title || title || tr("title");
  const displayDesc = seo.meta_description || "";
  const checks = useMemo(
    () =>
      runSeoChecks({
        focusKeyword: seo.focus_keyword,
        title,
        metaTitle: seo.meta_title,
        metaDescription: seo.meta_description,
        slug,
        content,
      }),
    [seo, title, slug, content],
  );

  return (
    <div className="bg-white border rounded-xl p-4 space-y-4 text-sm">
      <h3 className="font-bold text-gray-900">{tr("seoToolkit")}</h3>

      <div>
        <label className="text-xs font-semibold text-gray-600">{tr("metaTitle")}</label>
        <input
          value={seo.meta_title}
          onChange={(e) => set("meta_title", e.target.value)}
          className="w-full border rounded px-2 py-1.5 mt-1"
        />
        <p className="text-xs text-gray-400 mt-0.5">{seo.meta_title.length}/60</p>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600">{tr("metaDescription")}</label>
        <textarea
          value={seo.meta_description}
          onChange={(e) => set("meta_description", e.target.value)}
          className="w-full border rounded px-2 py-1.5 mt-1 h-16"
        />
        <p className="text-xs text-gray-400 mt-0.5">{seo.meta_description.length}/160</p>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600">{tr("focusKeyword")}</label>
        <input
          value={seo.focus_keyword}
          onChange={(e) => set("focus_keyword", e.target.value)}
          className="w-full border rounded px-2 py-1.5 mt-1"
        />
      </div>

      <div className="space-y-1">
        {checks.map((c) => (
          <div key={c.id} className="flex items-center gap-2 text-xs">
            <span className={c.pass ? "text-green-600" : "text-red-500"}>
              {c.pass ? "✓" : "✗"}
            </span>
            <span>{c.label}</span>
          </div>
        ))}
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600">{tr("slug")}</label>
        <input
          value={seo.slug || slug}
          onChange={(e) => set("slug", e.target.value)}
          className="w-full border rounded px-2 py-1.5 mt-1"
          dir="ltr"
        />
        {isPublished && (
          <p className="text-xs text-amber-600 mt-1">{tr("slugWarning")}</p>
        )}
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600">{tr("canonicalUrl")}</label>
        <input
          value={seo.canonical_url}
          onChange={(e) => set("canonical_url", e.target.value)}
          className="w-full border rounded px-2 py-1.5 mt-1"
          dir="ltr"
          placeholder="https://..."
        />
      </div>

      <div className="border rounded-lg p-3 bg-gray-50">
        <p className="text-xs text-gray-500 mb-1">{tr("googlePreview")}</p>
        <p className="text-blue-700 text-sm font-medium truncate">{displayTitle}</p>
        <p className="text-green-700 text-xs truncate">{baseUrl}/blogs/{seo.slug || slug}</p>
        <p className="text-gray-600 text-xs line-clamp-2">{displayDesc}</p>
      </div>

      <details className="border rounded-lg p-3">
        <summary className="font-semibold cursor-pointer text-xs">{tr("socialPreview")}</summary>
        <div className="space-y-2 mt-3">
          <input placeholder="OG Title" value={seo.og_title} onChange={(e) => set("og_title", e.target.value)} className="w-full border rounded px-2 py-1.5" />
          <textarea placeholder="OG Description" value={seo.og_description} onChange={(e) => set("og_description", e.target.value)} className="w-full border rounded px-2 py-1.5 h-14" />
          <input placeholder="OG Image URL" value={seo.og_image} onChange={(e) => set("og_image", e.target.value)} className="w-full border rounded px-2 py-1.5" dir="ltr" />
          <div className="border rounded-lg overflow-hidden bg-white">
            {(seo.og_image) && <img src={seo.og_image} alt="" className="w-full h-24 object-cover" loading="lazy" />}
            <div className="p-2">
              <p className="text-xs font-bold truncate">{seo.og_title || displayTitle}</p>
              <p className="text-xs text-gray-500 line-clamp-2">{seo.og_description || displayDesc}</p>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
