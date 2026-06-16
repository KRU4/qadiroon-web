import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { api, type PageRecord } from "../../lib/api";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

function DynamicPageInner() {
  const { slug } = useParams();
  const [page, setPage] = useState<PageRecord | null>(null);
  const darkMode = false;

  useEffect(() => {
    if (slug) api.publicPage(slug).then(setPage).catch(() => setPage(null));
  }, [slug]);

  if (!page) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50" style={{ fontFamily: "Cairo, sans-serif" }}>
      <Header darkMode={darkMode} highContrast={false} fontSize={16} onToggleDark={() => {}} onToggleContrast={() => {}} onFontIncrease={() => {}} onFontDecrease={() => {}} onListen={() => {}} />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="section-title text-3xl font-black mb-6" style={{ color: "#1673B8" }}>{page.title}</h1>
        <div className="prose max-w-none leading-loose" dangerouslySetInnerHTML={{ __html: page.content }} />
      </main>
      <Footer darkMode={darkMode} />
    </div>
  );
}

export function DynamicPage() {
  return <DynamicPageInner />;
}
