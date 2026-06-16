export function countWords(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return 0;
  return text.split(" ").length;
}

export function readingTimeMinutes(html: string): number {
  const words = countWords(html);
  return Math.max(1, Math.ceil(words / 200));
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

export interface SeoCheck {
  id: string;
  label: string;
  pass: boolean;
}

export function runSeoChecks(opts: {
  focusKeyword: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  content: string;
}): SeoCheck[] {
  const kw = opts.focusKeyword.trim().toLowerCase();
  if (!kw) {
    return [{ id: "keyword", label: "Focus keyword set", pass: false }];
  }
  const plain = opts.content.replace(/<[^>]+>/g, " ").toLowerCase();
  const firstPara = plain.slice(0, 300);
  const hasHeading = /<h[1-3][^>]*>/i.test(opts.content) &&
    opts.content.toLowerCase().includes(kw);
  return [
    { id: "title", label: "Keyword in title", pass: (opts.metaTitle || opts.title).toLowerCase().includes(kw) },
    { id: "meta", label: "Keyword in meta description", pass: opts.metaDescription.toLowerCase().includes(kw) },
    { id: "intro", label: "Keyword in first paragraph", pass: firstPara.includes(kw) },
    { id: "heading", label: "Keyword in a heading", pass: hasHeading },
    { id: "slug", label: "Keyword in slug", pass: opts.slug.toLowerCase().includes(kw.replace(/\s+/g, "-")) },
  ];
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function extractToc(html: string): TocItem[] {
  if (typeof document === "undefined") return [];
  const div = document.createElement("div");
  div.innerHTML = html;
  const items: TocItem[] = [];
  div.querySelectorAll("h2, h3").forEach((el, i) => {
    const text = el.textContent?.trim() || `section-${i}`;
    const id = slugifyHeading(text) || `section-${i}`;
    items.push({ id, text, level: el.tagName === "H2" ? 2 : 3 });
  });
  return items;
}

export function injectHeadingIds(html: string): string {
  if (typeof document === "undefined") return html;
  const div = document.createElement("div");
  div.innerHTML = html;
  const used = new Set<string>();
  div.querySelectorAll("h2, h3").forEach((el, i) => {
    let id = slugifyHeading(el.textContent || "");
    if (!id) id = `section-${i}`;
    let n = 1;
    while (used.has(id)) {
      id = `${slugifyHeading(el.textContent || "")}-${n++}`;
    }
    used.add(id);
    el.id = id;
  });
  return div.innerHTML;
}
