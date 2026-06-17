import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { api, type BlogRecord, type CategoryRecord } from "../../lib/api";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState<CategoryRecord | null>(null);
  const [posts, setPosts] = useState<BlogRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    api.publicCategory(slug)
      .then((data) => {
        setCategory(data.category);
        setPosts(data.posts);
      })
      .catch(() => setCategory(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!category) return <div className="p-10 text-center">Category not found</div>;

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50" style={{ fontFamily: "Cairo, sans-serif" }}>
      <Header darkMode={false} highContrast={false} fontSize={16} onToggleDark={() => {}} onToggleContrast={() => {}} onFontIncrease={() => {}} onFontDecrease={() => {}} onListen={() => {}} />
      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          {category.image_url && (
            <img src={category.image_url} alt={category.name} className="w-full max-h-64 object-cover rounded-2xl mb-4" />
          )}
          <h1 className="text-2xl font-black" style={{ color: "#1673B8" }}>{category.name}</h1>
          {category.description && <p className="text-gray-600 mt-2">{category.description}</p>}
        </div>
        {posts.length === 0 ? (
          <p className="text-gray-500">No posts in this category yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((b) => (
              <Link key={b.id} to={`/blogs/${b.slug}`} className="bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                {b.cover_image && <img src={b.cover_image} alt="" className="w-full h-48 object-cover" />}
                <div className="p-5">
                  <span className="text-xs text-blue-600 font-bold">{b.category_name}</span>
                  <h2 className="font-bold mt-2 line-clamp-2">{b.title}</h2>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{b.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer darkMode={false} />
    </div>
  );
}
