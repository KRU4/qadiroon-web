import { useMemo, useState } from "react";
import { extractToc } from "../../lib/seo";

interface TableOfContentsProps {
  html: string;
}

export function TableOfContents({ html }: TableOfContentsProps) {
  const [open, setOpen] = useState(true);
  const items = useMemo(() => extractToc(html), [html]);

  if (items.length === 0) return null;

  return (
    <div className="mb-8 border rounded-xl bg-blue-50/50 border-blue-100 p-4" dir="rtl">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="font-bold text-blue-800 w-full text-start"
      >
        جدول المحتويات {open ? "▾" : "▸"}
      </button>
      {open && (
        <ul className="mt-3 space-y-1.5">
          {items.map((item) => (
            <li key={item.id} style={{ paddingRight: item.level === 3 ? 16 : 0 }}>
              <a
                href={`#${item.id}`}
                className="text-sm text-blue-700 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
