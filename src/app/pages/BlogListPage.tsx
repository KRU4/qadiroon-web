import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api, type BlogRecord } from "../../lib/api";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

function BlogListInner() {
  const [blogs, setBlogs] = useState<BlogRecord[]>([]);
  const [darkMode] = useState(false);

  useEffect(() => {
    api.publicBlogs().then(setBlogs);
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50" style={{ fontFamily: "Cairo, sans-serif" }}>
      <Header darkMode={darkMode} highContrast={false} fontSize={16} onToggleDark={() => {}} onToggleContrast={() => {}} onFontIncrease={() => {}} onFontDecrease={() => {}} onListen={() => {}} />
      <main className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="section-title text-2xl font-black mb-8" style={{ color: "#1673B8" }}>المدونة</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((b) => (
            <Link key={b.id} to={`/blogs/${b.slug}`} className="bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
              {b.cover_image && <img src={b.cover_image} alt="" className="w-full h-48 object-cover" />}
              <div className="p-5">
                {b.category_name && b.category_slug ? <Link to={`/categories/${b.category_slug}`} className="text-xs text-blue-600 font-bold hover:underline">{b.category_name}</Link> : <span className="text-xs text-blue-600 font-bold">{b.category_name}</span>}
                <h2 className="font-bold mt-2 line-clamp-2">{b.title}</h2>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{b.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer darkMode={darkMode} />
    </div>
  );
}

export function BlogListPage() {
  return <BlogListInner />;
}
